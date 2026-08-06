-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  whatsapp text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Business Hours Table
CREATE TABLE IF NOT EXISTS public.business_hours (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id uuid REFERENCES public.branches(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL, -- 0 for Sunday, 1 for Monday, etc.
  open_time time without time zone,
  close_time time without time zone,
  is_closed boolean DEFAULT false
);

-- 3. Services Table
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

-- 4. Barbers Table
CREATE TABLE IF NOT EXISTS public.barbers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text,
  bio text,
  is_active boolean DEFAULT true
);

-- 5. Queues Table
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
  status text DEFAULT 'waiting', -- waiting, called, in_service, completed, cancelled, no_show
  source text DEFAULT 'web',
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  called_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone
);

-- 6. Membership Plans Table
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric,
  duration_days integer NOT NULL,
  benefits jsonb,
  is_active boolean DEFAULT true
);

-- 7. Memberships Table
CREATE TABLE IF NOT EXISTS public.memberships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  birth_date date,
  membership_plan_id uuid REFERENCES public.membership_plans(id),
  status text DEFAULT 'pending', -- pending, active, expired, suspended
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  activated_at timestamp with time zone,
  expires_at timestamp with time zone,
  total_visits integer DEFAULT 0,
  notes text
);

-- 8. Site Settings Table (dari langkah sebelumnya)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  hero_description text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Dummy Data for Branches
INSERT INTO public.branches (name, address, whatsapp)
VALUES ('Black Yellow Makassar', 'Jl. Contoh No. 123, Makassar', '081234567890')
ON CONFLICT DO NOTHING;

-- Dummy Data for Services
INSERT INTO public.services (name, category, price, duration_minutes)
VALUES 
  ('Premium Haircut', 'Haircut', 50000, 45),
  ('Hair Coloring', 'Treatment', 150000, 90),
  ('Kid Haircut', 'Haircut', 40000, 30)
ON CONFLICT DO NOTHING;

-- Dummy Data for Barbers
INSERT INTO public.barbers (name)
VALUES ('Budi'), ('Andi'), ('Rina')
ON CONFLICT DO NOTHING;

-- Dummy Data for Membership Plans
INSERT INTO public.membership_plans (name, description, duration_days, price, benefits)
VALUES 
  ('Silver Member', 'Paket membership dasar 6 bulan', 180, 100000, '["Diskon 10% setiap cukur", "Gratis cuci rambut"]'),
  ('Gold Member', 'Paket membership premium 1 tahun', 365, 250000, '["Diskon 20% setiap cukur", "Gratis cuci rambut", "Prioritas booking"]')
ON CONFLICT DO NOTHING;

-- Dummy Data for Site Settings
INSERT INTO public.site_settings (hero_title, hero_subtitle, hero_description)
VALUES (
  'Potongan Presisi.',
  'Gaya Tanpa Kompromi.',
  'Lebih dari sekadar pangkas rambut. Kami menghadirkan pengalaman premium dengan barber profesional untuk tampilan terbaik Anda.'
) ON CONFLICT DO NOTHING;

-- Reload schema cache just in case
NOTIFY pgrst, 'reload_schema';
