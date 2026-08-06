-- supabase/seed.sql
-- Run this in your Supabase SQL Editor to insert initial data

-- 1. Insert Branch
INSERT INTO branches (name, address, phone, whatsapp)
VALUES ('Makassar Main Branch', 'Jl. AP. Pettarani No. 123, Makassar', '0411-123456', '+6281234567890')
ON CONFLICT DO NOTHING;

-- 2. Insert Services
INSERT INTO services (name, slug, category, description, price, duration_minutes, sort_order)
VALUES 
('Black Cut', 'black-cut', 'haircut', 'Potongan rambut presisi dengan konsultasi gaya, cuci, dan styling pomade.', 60000, 45, 1),
('Student Cut', 'student-cut', 'haircut', 'Potongan rapi khusus pelajar dengan menunjukkan kartu pelajar aktif.', 45000, 30, 2),
('Kids Cut', 'kids-cut', 'haircut', 'Pangkas rambut anak-anak (di bawah 12 tahun) dengan perlakuan khusus.', 50000, 45, 3),
('Yellow Grooming', 'yellow-grooming', 'grooming', 'Cukur kumis/jenggot lengkap dengan hot towel dan pijat ringan.', 40000, 30, 4),
('Hair Wash & Styling', 'hair-wash-styling', 'grooming', 'Cuci rambut premium, tonik, dan styling dengan pomade pilihan.', 35000, 20, 5),
('Signature Package', 'signature-package', 'package', 'Kombinasi Black Cut & Yellow Grooming untuk tampilan maksimal.', 90000, 75, 6)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Barbers
INSERT INTO barbers (name, slug, bio, specialties, photo_url)
VALUES
('Ahmad', 'ahmad', 'Barber senior dengan pengalaman 5 tahun', ARRAY['Classic Cut', 'Fading', 'Hair Color'], 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070&auto=format&fit=crop'),
('Rizky', 'rizky', 'Spesialis gaya modern', ARRAY['Modern Textures', 'Beard Grooming'], 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1976&auto=format&fit=crop'),
('Budi', 'budi', 'Sabar dan ramah melayani anak-anak', ARRAY['Kid''s Cut', 'Hair Tattoo'], 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1974&auto=format&fit=crop')
ON CONFLICT (slug) DO NOTHING;
