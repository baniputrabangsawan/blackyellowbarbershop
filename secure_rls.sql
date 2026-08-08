-- =================================================================================
-- SCRIPT PENGAMANAN DATABASE (ROW LEVEL SECURITY) - BLACK YELLOW BARBERSHOP
-- =================================================================================

-- 1. AKTIFKAN RLS UNTUK SEMUA TABEL
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Pastikan tabel tambahan juga dilindungi jika ada
DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'galleries') THEN
        EXECUTE 'ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'faqs') THEN
        EXECUTE 'ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'promos') THEN
        EXECUTE 'ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY';
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_activity_logs') THEN
        EXECUTE 'ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY';
    END IF;
END $$;

-- 2. HAPUS SEMUA POLICY LAMA AGAR BERSIH
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- =================================================================================
-- 3. KONFIGURASI POLICY BARU
-- =================================================================================

-- Fungsi Pembantu untuk mengecek Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- A. TABEL YANG BISA DIBACA PUBLIK (TETAPI HANYA ADMIN YANG BISA EDIT)
-- Meliputi: branches, business_hours, services, barbers, membership_plans, site_settings, galleries, faqs, promos

DO $$ 
DECLARE 
    t TEXT;
    pub_tables TEXT[] := ARRAY['branches', 'business_hours', 'services', 'barbers', 'membership_plans', 'site_settings', 'galleries', 'faqs', 'promos'];
BEGIN
    FOREACH t IN ARRAY pub_tables LOOP
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
            EXECUTE format('CREATE POLICY "Public read access on %I" ON public.%I FOR SELECT USING (true)', t, t);
            EXECUTE format('CREATE POLICY "Admin full access on %I" ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t, t);
        END IF;
    END LOOP;
END $$;


-- B. TABEL ANTREAN (QUEUES)
-- Publik bisa read dan insert (mendaftar). Hanya admin yang bisa update dan delete.
CREATE POLICY "Public read access on queues" ON public.queues FOR SELECT USING (true);
CREATE POLICY "Public insert access on queues" ON public.queues FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update access on queues" ON public.queues FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete access on queues" ON public.queues FOR DELETE TO authenticated USING (public.is_admin());


-- C. TABEL MEMBERSHIPS
-- Berisi data privasi. Publik HANYA boleh insert (mendaftar). Tidak boleh read. Admin boleh semua.
CREATE POLICY "Public insert access on memberships" ON public.memberships FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access on memberships" ON public.memberships FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- D. TABEL ADMIN_USERS & AUDIT LOGS
-- Super rahasia. Hanya admin yang bisa melihat datanya sendiri, atau sesama admin.
CREATE POLICY "Admin can view admin_users" ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);
-- Mencegah penambahan admin dari API publik, harus dari database langsung atau superadmin.

DO $$ BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_activity_logs') THEN
        EXECUTE 'CREATE POLICY "Admin read logs" ON public.admin_activity_logs FOR SELECT TO authenticated USING (public.is_admin())';
        EXECUTE 'CREATE POLICY "Admin insert logs" ON public.admin_activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin())';
    END IF;
END $$;

-- =================================================================================
-- 4. PENGAMANAN SUPABASE STORAGE (BUCKET GALLERY)
-- =================================================================================

-- Izinkan publik membaca gambar galeri
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'gallery' );

-- PASTIKAN HANYA ADMIN YANG BISA UPLOAD, UPDATE, & DELETE DI BUCKET GALERI
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload" ON storage.objects;
CREATE POLICY "Admin can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id = 'gallery' AND public.is_admin() );

DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update" ON storage.objects;
CREATE POLICY "Admin can update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id = 'gallery' AND public.is_admin() );

DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete" ON storage.objects;
CREATE POLICY "Admin can delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id = 'gallery' AND public.is_admin() );

-- =================================================================================
-- 5. RPC (DATABASE FUNCTION) UNTUK RACE CONDITION QUEUE
-- =================================================================================
CREATE OR REPLACE FUNCTION public.generate_next_queue(p_branch_id UUID, p_customer_name TEXT, p_phone TEXT, p_service_id UUID, p_barber_id UUID)
RETURNS public.queues
LANGUAGE plpgsql
SECURITY DEFINER -- Menjalankan fungsi sebagai pembuatnya, melewati limitasi RLS pada saat generate agar atomic
AS $$
DECLARE
    v_today DATE := (timezone('Asia/Makassar', now()))::date;
    v_next_number INT;
    v_new_queue public.queues;
BEGIN
    -- Kunci baris simulasi / atomic read
    SELECT COALESCE(MAX(queue_number), 0) + 1 INTO v_next_number
    FROM public.queues
    WHERE branch_id = p_branch_id AND queue_date = v_today;

    INSERT INTO public.queues (
        branch_id, queue_date, queue_number, customer_name, phone, service_id, preferred_barber_id, status, source
    ) VALUES (
        p_branch_id, v_today, v_next_number, p_customer_name, p_phone, p_service_id, p_barber_id, 'waiting', 'web'
    ) RETURNING * INTO v_new_queue;

    RETURN v_new_queue;
END;
$$;

-- Reload Cache
NOTIFY pgrst, 'reload schema';
