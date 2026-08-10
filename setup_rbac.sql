-- Tambahkan kolom branch_id ke admin_users jika belum ada
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL;

-- Ambil ID Cabang untuk referensi
DO $$
DECLARE
  v_makassar_id UUID;
  v_gowa_id UUID;
  v_owner_id UUID := gen_random_uuid();
  v_admin_mks_id UUID := gen_random_uuid();
  v_admin_gowa_id UUID := gen_random_uuid();
BEGIN
  -- Dapatkan branch_id (Asumsi data cabang Makassar dan Gowa sudah ada)
  SELECT id INTO v_makassar_id FROM public.branches WHERE name ILIKE '%Makassar%' LIMIT 1;
  SELECT id INTO v_gowa_id FROM public.branches WHERE name ILIKE '%Gowa%' LIMIT 1;

  -- Buat User di auth.users (Trik khusus untuk local environment Supabase)
  
-- 1. Owner (Super Admin)
  SELECT id INTO v_owner_id FROM auth.users WHERE email = 'owner@blackyellow.local';
  IF v_owner_id IS NULL THEN
    v_owner_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_owner_id, 'authenticated', 'authenticated', 'owner@blackyellow.local', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  END IF;

  -- 2. Admin Makassar
  SELECT id INTO v_admin_mks_id FROM auth.users WHERE email = 'admin_mks@blackyellow.local';
  IF v_admin_mks_id IS NULL THEN
    v_admin_mks_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_admin_mks_id, 'authenticated', 'authenticated', 'admin_mks@blackyellow.local', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  END IF;

  -- 3. Admin Gowa
  SELECT id INTO v_admin_gowa_id FROM auth.users WHERE email = 'admin_gowa@blackyellow.local';
  IF v_admin_gowa_id IS NULL THEN
    v_admin_gowa_id := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_admin_gowa_id, 'authenticated', 'authenticated', 'admin_gowa@blackyellow.local', crypt('admin123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '');
  END IF;

  -- Insert ke admin_users
  -- Owner
  INSERT INTO public.admin_users (user_id, role, branch_id)
  VALUES (v_owner_id, 'owner', NULL)
  ON CONFLICT (user_id) DO UPDATE SET branch_id = NULL, role = 'owner';

  -- Admin Makassar
  INSERT INTO public.admin_users (user_id, role, branch_id)
  VALUES (v_admin_mks_id, 'admin', v_makassar_id)
  ON CONFLICT (user_id) DO UPDATE SET branch_id = v_makassar_id, role = 'admin';

  -- Admin Gowa
  INSERT INTO public.admin_users (user_id, role, branch_id)
  VALUES (v_admin_gowa_id, 'admin', v_gowa_id)
  ON CONFLICT (user_id) DO UPDATE SET branch_id = v_gowa_id, role = 'admin';

END $$;
