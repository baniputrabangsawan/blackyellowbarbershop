CREATE OR REPLACE FUNCTION public.admin_update_password(target_email TEXT, new_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role TEXT;
BEGIN
  -- 1. Verifikasi apakah yang memanggil fungsi ini adalah 'owner'
  SELECT role INTO v_caller_role 
  FROM public.admin_users 
  WHERE user_id = auth.uid();
  
  IF v_caller_role != 'owner' THEN
    RAISE EXCEPTION 'Unauthorized: Hanya Owner yang diizinkan mengganti password.';
  END IF;

  -- 2. Pastikan email target bukan milik owner sendiri (mencegah owner mereset akunnya sendiri secara tidak sengaja dari panel ini, walaupun aman)
  -- Opsional, tapi baik untuk mencegah kesalahan
  IF target_email = 'owner@blackyellow.local' THEN
    RAISE EXCEPTION 'Gunakan panel profil untuk mengubah password Owner.';
  END IF;

  -- 3. Update password di tabel auth.users
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = NOW()
  WHERE email = target_email;

  -- 4. Verifikasi apakah ada baris yang terpengaruh
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Akun dengan username tersebut tidak ditemukan.';
  END IF;

END;
$$;
