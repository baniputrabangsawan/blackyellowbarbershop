-- Mengizinkan Admin untuk melakukan INSERT (membuat pengaturan pertama kali) ke tabel site_settings
CREATE POLICY "Admin bisa insert site settings" 
  ON public.site_settings FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin bisa update site settings" 
  ON public.site_settings FOR UPDATE 
  TO authenticated 
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Semua orang bisa melihat site settings" 
  ON public.site_settings FOR SELECT 
  USING (true);

-- Pastikan tabel site_settings mengizinkan RLS (jika sebelumnya belum aktif)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY; 
