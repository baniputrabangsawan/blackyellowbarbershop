-- supabase/schema.sql
-- Run this in Supabase SQL Editor

-- 1. Branches
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  timezone TEXT DEFAULT 'Asia/Makassar',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Business Hours
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT false
);

-- 3. Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  duration_minutes INTEGER NOT NULL,
  member_price DECIMAL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- 4. Barbers
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  bio TEXT,
  specialties TEXT[],
  photo_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 5. Barber Schedules
CREATE TABLE barber_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'active'
);

-- 6. Queues
CREATE TABLE queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE RESTRICT,
  queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  queue_number INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
  preferred_barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
  assigned_barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, called, in_service, completed, cancelled, no_show
  source TEXT NOT NULL DEFAULT 'web',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  called_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  UNIQUE(branch_id, queue_date, queue_number)
);

-- 7. Membership Plans
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL,
  duration_days INTEGER NOT NULL,
  benefits TEXT[],
  is_active BOOLEAN DEFAULT true
);

-- 8. Memberships
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date DATE,
  membership_plan_id UUID REFERENCES membership_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, expired, suspended
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  total_visits INTEGER DEFAULT 0,
  notes TEXT
);

-- 9. Gallery Items
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true
);

-- 10. Admin Activity Logs
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL, -- references auth.users(id)
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Basic Public Read Policies (Customize further based on needs)
CREATE POLICY "Public can view active branches" ON branches FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view business hours" ON business_hours FOR SELECT USING (true);
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active barbers" ON barbers FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view published gallery items" ON gallery_items FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view membership plans" ON membership_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view today queues" ON queues FOR SELECT USING (queue_date = CURRENT_DATE);
CREATE POLICY "Public can insert queues" ON queues FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert memberships" ON memberships FOR INSERT WITH CHECK (true);
