-- =================================================================================
-- TITLE: MASTER SCHEMA & SECURITY - BLACK YELLOW BARBERSHOP
-- DESKRIPSI: Initial migration for local Supabase setup.
-- =================================================================================

-- 1. EKSTENSI & FUNGSI BANTUAN
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL BRANCHES (Dibuat lebih awal karena di-reference oleh tabel lain)
CREATE TABLE IF NOT EXISTS public.branches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  whatsapp text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff',
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  slug text UNIQUE,
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
  slug text UNIQUE,
  bio text,
  specialties text[],
  photo_url text,
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
  start_date date,
  end_date date,
  notes text
);

CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_open boolean DEFAULT true,
  operational_status text DEFAULT 'Buka',
  accept_new_queue boolean DEFAULT true,
  allow_online_queue boolean DEFAULT true,
  allow_walkin boolean DEFAULT true,
  business_name text DEFAULT 'Black Yellow Barbershop',
  branch_name text DEFAULT 'Makassar Main Branch',
  address text DEFAULT 'Jl. AP. Pettarani No. 123, Makassar',
  phone text DEFAULT '0411-123456',
  whatsapp text DEFAULT '081234567890',
  email text DEFAULT 'info@blackyellow.com',
  maps_url text,
  instagram_url text,
  tiktok_url text,
  facebook_url text,
  max_daily_queue integer DEFAULT 50,
  max_waiting integer DEFAULT 10,
  default_estimation_mins integer DEFAULT 45,
  late_tolerance_mins integer DEFAULT 15,
  allow_barber_selection boolean DEFAULT true,
  logo_url text,
  favicon_url text,
  brand_tagline text DEFAULT 'Gaya Tanpa Kompromi',
  seo_title text DEFAULT 'Black Yellow Barbershop - Makassar',
  meta_description text,
  og_image_url text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);
