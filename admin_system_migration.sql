-- 1. TAMBAHKAN KOLOM PENGATURAN KE `site_settings`
ALTER TABLE public.site_settings
  -- Informasi Bisnis
  ADD COLUMN IF NOT EXISTS business_name TEXT DEFAULT 'Black Yellow Barbershop',
  ADD COLUMN IF NOT EXISTS branch_name TEXT DEFAULT 'Makassar',
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS maps_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Makassar',
  
  -- Status Operasional
  ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS operational_status TEXT DEFAULT 'Buka', -- Buka, Istirahat, Antrean Penuh, Tutup, Maintenance
  ADD COLUMN IF NOT EXISTS accept_new_queue BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_online_queue BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS allow_walkin BOOLEAN DEFAULT true,
  
  -- Konfigurasi Antrean
  ADD COLUMN IF NOT EXISTS max_daily_queue INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS max_waiting INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS start_queue_number INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS default_estimation_mins INTEGER DEFAULT 45,
  ADD COLUMN IF NOT EXISTS late_tolerance_mins INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS allow_barber_selection BOOLEAN DEFAULT true,
  
  -- Membership Settings
  ADD COLUMN IF NOT EXISTS membership_registration_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS auto_activate_membership BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_membership_days INTEGER DEFAULT 365,
  ADD COLUMN IF NOT EXISTS birthday_promo_active BOOLEAN DEFAULT false,

  -- Branding & SEO
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS favicon_url TEXT,
  ADD COLUMN IF NOT EXISTS brand_tagline TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT,
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_description TEXT;


-- 2. TABEL AUDIT LOG
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS untuk Audit Log (Hanya bisa dibaca oleh Admin)
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin dapat melihat audit log" 
  ON public.admin_activity_logs FOR SELECT 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin dapat menambah audit log" 
  ON public.admin_activity_logs FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));


-- 3. TABEL MANAJEMEN KONTEN (Galeri, FAQ, Promo)

-- Galeri
CREATE TABLE IF NOT EXISTS public.galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  category TEXT DEFAULT 'Umum',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Semua orang bisa melihat galeri published" ON public.galleries FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin bisa kelola galeri" ON public.galleries FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- FAQ
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Semua orang bisa melihat faq aktif" ON public.faqs FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin bisa kelola faq" ON public.faqs FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Promo
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
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Semua orang bisa melihat promo aktif" ON public.promos FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin bisa kelola promo" ON public.promos FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Refresh Schema
NOTIFY pgrst, 'reload schema';
