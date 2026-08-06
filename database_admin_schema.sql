-- Buat tabel admin_users untuk mencatat siapa saja yang memiliki akses admin
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Buat policy: Admin hanya bisa membaca datanya sendiri
CREATE POLICY "Admin dapat melihat data role mereka sendiri" 
ON public.admin_users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Wajib jalankan ini agar schema cache Supabase terefresh
NOTIFY pgrst, 'reload schema';
