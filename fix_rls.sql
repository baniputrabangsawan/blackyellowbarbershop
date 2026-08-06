-- Berikan akses baca untuk publik dan pengguna terautentikasi pada tabel referensi
CREATE POLICY "Public can view active branches" ON public.branches FOR SELECT USING (true);
CREATE POLICY "Public can view active services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public can view active barbers" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Public can view membership plans" ON public.membership_plans FOR SELECT USING (true);

-- Jika error "already exists" atau lainnya, jalankan saja perintah ini untuk menonaktifkan sementara perlindungan baca jika RLS terlanjur menyala tanpa izin baca:
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans DISABLE ROW LEVEL SECURITY;
