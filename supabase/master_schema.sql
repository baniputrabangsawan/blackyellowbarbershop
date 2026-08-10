-- =================================================================================
-- TITLE: MASTER SCHEMA & SECURITY - BLACK YELLOW BARBERSHOP
-- DESKRIPSI: Gabungan seluruh tabel, fungsi, dan aturan keamanan (RLS) final.
-- =================================================================================

-- 1. EKTENSI & FUNGSI BANTUAN
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PEMBUATAN TABEL INTI
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff',
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  whatsapp text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.business_hours (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL,
  open_time time without time zone,
  close_time time without time zone,
  is_closed boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text,
  category text,
  description text,
  price numeric NOT NULL,
  duration_minutes integer NOT NULL,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.barbers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text,
  bio text,
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.queues (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id uuid REFERENCES public.branches(id),
  queue_date date NOT NULL,
  queue_number integer NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  service_id uuid REFERENCES public.services(id),
  preferred_barber_id uuid REFERENCES public.barbers(id),
  assigned_barber_id uuid REFERENCES public.barbers(id),
  status text DEFAULT 'waiting',
  source text DEFAULT 'web',
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  called_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.membership_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric,
  duration_days integer NOT NULL,
  benefits jsonb,
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.memberships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  birth_date date,
  membership_plan_id uuid REFERENCES public.membership_plans(id),
  status text DEFAULT 'pending',
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  total_visits integer DEFAULT 0,
  notes text
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  hero_description text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  business_name TEXT DEFAULT 'Black Yellow Barbershop',
  branch_name TEXT DEFAULT 'Makassar',
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  maps_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  facebook_url TEXT,
  timezone TEXT DEFAULT 'Asia/Makassar',
  is_open BOOLEAN DEFAULT true,
  operational_status TEXT DEFAULT 'Buka',
  accept_new_queue BOOLEAN DEFAULT true,
  allow_online_queue BOOLEAN DEFAULT true,
  allow_walkin BOOLEAN DEFAULT true,
  max_daily_queue INTEGER DEFAULT 50,
  max_waiting INTEGER DEFAULT 10,
  start_queue_number INTEGER DEFAULT 1,
  default_estimation_mins INTEGER DEFAULT 45,
  late_tolerance_mins INTEGER DEFAULT 15,
  allow_barber_selection BOOLEAN DEFAULT true,
  membership_registration_active BOOLEAN DEFAULT true,
  auto_activate_membership BOOLEAN DEFAULT false,
  default_membership_days INTEGER DEFAULT 365,
  birthday_promo_active BOOLEAN DEFAULT false,
  logo_url TEXT,
  favicon_url TEXT,
  brand_tagline TEXT,
  og_image_url TEXT,
  seo_title TEXT,
  meta_description TEXT
);

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  category TEXT DEFAULT 'Umum',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  cta_text TEXT,
  cta_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. MENGAKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

-- Hapus kebijakan lama agar tidak bentrok (wajib jika database sudah ada isinya)
DO $$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP EXECUTE format('DROP POLICY IF EXISTS "%s" ON public.%I', r.policyname, r.tablename); END LOOP; END $$;

-- 4. KEBIJAKAN (POLICIES)

-- Admin_Users
CREATE POLICY "Admin view admin_users" ON public.admin_users FOR SELECT TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

-- Tabel Publik (Bisa dibaca siapa saja, diubah oleh admin)
DO $$ 
DECLARE t TEXT; pub_tables TEXT[] := ARRAY['branches', 'business_hours', 'services', 'barbers', 'membership_plans', 'site_settings', 'galleries', 'faqs', 'promos'];
BEGIN
    FOREACH t IN ARRAY pub_tables LOOP
        EXECUTE format('CREATE POLICY "Public read on %I" ON public.%I FOR SELECT USING (true)', t, t);
        EXECUTE format('CREATE POLICY "Admin access on %I" ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t, t);
    END LOOP;
END $$;

-- Queues (Baca Publik, Modifikasi Admin) - Insert via RPC
CREATE POLICY "Public read queues" ON public.queues FOR SELECT USING (true);
CREATE POLICY "Admin update queues" ON public.queues FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admin delete queues" ON public.queues FOR DELETE TO authenticated USING (public.is_admin());

-- Memberships (Admin Full Access) - Insert via RPC
CREATE POLICY "Admin access memberships" ON public.memberships FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Audit Logs
CREATE POLICY "Admin read logs" ON public.admin_activity_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admin insert logs" ON public.admin_activity_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 5. FUNGSI RPC (SECURITY DEFINER UNTUK BYPASS RLS INSERT)
CREATE OR REPLACE FUNCTION public.generate_next_queue(p_branch_id UUID, p_customer_name TEXT, p_phone TEXT, p_service_id UUID, p_barber_id UUID)
RETURNS public.queues
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := (timezone('Asia/Makassar', now()))::date;
    v_next_number INT;
    v_new_queue public.queues;
BEGIN
    SELECT COALESCE(MAX(queue_number), 0) + 1 INTO v_next_number FROM public.queues WHERE branch_id = p_branch_id AND queue_date = v_today;
    INSERT INTO public.queues (branch_id, queue_date, queue_number, customer_name, phone, service_id, preferred_barber_id, status, source) 
    VALUES (p_branch_id, v_today, v_next_number, p_customer_name, p_phone, p_service_id, p_barber_id, 'waiting', 'web') RETURNING * INTO v_new_queue;
    RETURN v_new_queue;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_membership_safe(p_customer_name TEXT, p_phone TEXT, p_plan_id UUID, p_birth_date DATE, p_code TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_id UUID;
    v_created_at TIMESTAMPTZ;
BEGIN
    INSERT INTO public.memberships (customer_name, phone, membership_plan_id, birth_date, code, status) 
    VALUES (p_customer_name, p_phone, p_plan_id, p_birth_date, p_code, 'pending') RETURNING id, created_at INTO v_new_id, v_created_at;
    RETURN json_build_object('id', v_new_id, 'customer_name', p_customer_name, 'phone', p_phone, 'code', p_code, 'status', 'pending', 'created_at', v_created_at);
END;
$$;

-- 6. REALTIME SUBSCRIPTIONS
-- Menambahkan tabel ke publikasi supabase_realtime
-- DROP PUBLICATION IF EXISTS supabase_realtime; CREATE PUBLICATION supabase_realtime; -- (Dilakukan oleh sistem Supabase)
-- ALTER PUBLICATION supabase_realtime ADD TABLE site_settings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE queues;

-- 7. SEED DATA (DATA AWAL)
-- Pastikan cabang Makassar ada dan aktif
INSERT INTO public.branches (name, address, whatsapp, is_active)
SELECT 'Black Yellow Makassar', 'Jl. AP. Pettarani No. 123, Makassar, Sulawesi Selatan, Indonesia', '0811424428', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.branches WHERE name = 'Black Yellow Makassar'
);

UPDATE public.branches 
SET is_active = true, whatsapp = '0811424428' 
WHERE name = 'Black Yellow Makassar';

-- Pastikan cabang Gowa ada dan aktif
INSERT INTO public.branches (name, address, whatsapp, is_active)
SELECT 'Black Yellow Gowa', 'Jl. Andi Tonro No.64D, Bonto-Bontoa Kec. Somba Opu, Kabupaten Gowa Sulawesi Selatan 92113, Indonesia', '0811424427', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.branches WHERE name = 'Black Yellow Gowa'
);

UPDATE public.branches 
SET is_active = true, whatsapp = '0811424427' 
WHERE name = 'Black Yellow Gowa';

-- 8. CLEANUP SCRIPT (JIKA ADA DUPLIKAT SAAT TESTING)
-- Hapus semua antrean percobaan yang menyangkut di cabang duplikat
DELETE FROM public.queues;

-- Hapus semua cabang duplikat, dan hanya menyisakan 1 yang paling pertama dibuat
DELETE FROM public.branches
WHERE id NOT IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rnum
        FROM public.branches
    ) t
    WHERE t.rnum = 1
);

-- 9. REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';