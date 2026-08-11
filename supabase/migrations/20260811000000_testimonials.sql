CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read on testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admin access on testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Insert Dummy Data
INSERT INTO public.testimonials (name, content, rating, sort_order) VALUES
('Andi', 'Potongannya rapi banget, tempatnya nyaman dan bersih.', 5, 1),
('Budi', 'Barbernya asik diajak ngobrol. Hasil fade-nya juara!', 5, 2),
('Reza', 'Harga terjangkau tapi pelayanan bintang 5. Recommended!', 5, 3),
('Fajar', 'Selalu potong di sini tiap bulan. Antrean online sangat membantu.', 4, 4),
('Dani', 'Nyaman nunggunya, tempatnya dingin, hasil potongan selalu pas di hati.', 5, 5),
('Yoga', 'Potongan classic-nya mantap. Barbershop terbaik di Makassar.', 5, 6);
