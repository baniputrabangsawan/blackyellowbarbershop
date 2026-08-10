-- Hapus semua data yang mungkin tersangkut
DELETE FROM public.services;
DELETE FROM public.barbers;
DELETE FROM public.branches;
DELETE FROM public.membership_plans;

-- 1. Insert Branches
INSERT INTO public.branches (id, name, address, whatsapp, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Black Yellow Makassar', 'Alamat Cabang Makassar', '0811424428', true),
  ('00000000-0000-0000-0000-000000000002', 'Black Yellow Gowa', 'Alamat Cabang Gowa', '0811424427', true);

-- 2. Insert Services
INSERT INTO public.services (name, category, price, duration_minutes, is_active)
VALUES 
  ('Premium Haircut', 'Haircut', 50000, 45, true),
  ('Hair Coloring', 'Treatment', 150000, 90, true),
  ('Kid Haircut', 'Haircut', 40000, 30, true);

-- 3. Insert Barbers
INSERT INTO public.barbers (name, is_active)
VALUES ('Budi', true), ('Andi', true), ('Rina', true);

-- 4. Insert Membership Plans
INSERT INTO public.membership_plans (name, description, duration_days, price, benefits)
VALUES 
  ('Silver Member', 'Paket membership dasar 6 bulan', 180, 100000, '["Diskon 10% setiap cukur", "Gratis cuci rambut"]'),
  ('Gold Member', 'Paket membership premium 1 tahun', 365, 250000, '["Diskon 20% setiap cukur", "Gratis cuci rambut", "Prioritas booking"]');

-- 5. Berikan akses publik penuh untuk MVP ini (karena belum ada login Admin)
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.queues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;

-- Reload schema
NOTIFY pgrst, 'reload schema';
