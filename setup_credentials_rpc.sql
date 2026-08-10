-- 1. Fungsi untuk mendapatkan daftar akun admin (Hanya bisa diakses oleh owner)
CREATE OR REPLACE FUNCTION public.get_admin_accounts()
RETURNS TABLE (
  user_id UUID,
  role TEXT,
  username TEXT,
  branch_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role TEXT;
BEGIN
  -- Verifikasi role
  SELECT au.role INTO v_caller_role 
  FROM public.admin_users au 
  WHERE au.user_id = auth.uid();
  
  IF v_caller_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: Hanya Owner yang diizinkan melihat daftar admin.';
  END IF;

  RETURN QUERY
  SELECT 
    au.user_id,
    au.role,
    REPLACE(u.email, '@blackyellow.local', '') AS username,
    COALESCE(b.name, 'Semua Cabang (Owner)') AS branch_name
  FROM public.admin_users au
  JOIN auth.users u ON au.user_id = u.id
  LEFT JOIN public.branches b ON au.branch_id = b.id
  WHERE au.role != 'owner'; -- Opsional: jangan tampilkan owner di dropdown, biarkan owner ganti password lewat profil biasa. Tapi kita bisa ubah != ke sembarang jika owner ingin mengganti password owner lain. Kita kecualikan owner agar aman.
END;
$$;

-- 2. Fungsi untuk mengganti username (email) dan password
CREATE OR REPLACE FUNCTION public.admin_update_credentials(target_user_id UUID, new_email TEXT, new_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role TEXT;
BEGIN
  -- Verifikasi role
  SELECT role INTO v_caller_role 
  FROM public.admin_users 
  WHERE user_id = auth.uid();
  
  IF v_caller_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: Hanya Owner yang diizinkan mengganti kredensial.';
  END IF;

  -- Update email dan password di auth.users
  -- Kita menggunakan COALESCE agar jika new_password kosong, password lama tidak berubah
  UPDATE auth.users
  SET 
    email = COALESCE(NULLIF(new_email, ''), email),
    encrypted_password = CASE WHEN NULLIF(new_password, '') IS NOT NULL THEN crypt(new_password, gen_salt('bf')) ELSE encrypted_password END,
    updated_at = NOW()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Akun admin tidak ditemukan.';
  END IF;

  -- Hancurkan sesi aktif agar user langsung ter-logout (Force Logout)
  DELETE FROM auth.sessions WHERE user_id = target_user_id;
  DELETE FROM auth.refresh_tokens WHERE user_id = target_user_id;
END;
$$;
