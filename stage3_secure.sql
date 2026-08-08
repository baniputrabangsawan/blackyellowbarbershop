-- =================================================================================
-- SCRIPT PENGAMANAN DATABASE TAHAP 3 (FINAL LOCKDOWN) - BLACK YELLOW BARBERSHOP
-- =================================================================================

-- 1. MENCABUT AKSES INSERT PUBLIK SECARA LANGSUNG
-- Ini akan mencegah hacker menggunakan anon key untuk bypass Rate Limiter API Anda
DROP POLICY IF EXISTS "Public insert access on queues" ON public.queues;
DROP POLICY IF EXISTS "Public insert access on memberships" ON public.memberships;

-- 2. MEMBUAT FUNGSI RPC UNTUK DAFTAR MEMBERSHIP (SECURITY DEFINER)
-- Fungsi ini akan dijalankan di bawah otoritas admin, sehingga tetap bisa INSERT
-- meskipun akses publik (anon) sudah diblokir.
CREATE OR REPLACE FUNCTION public.create_membership_safe(
    p_customer_name TEXT,
    p_phone TEXT,
    p_plan_id UUID,
    p_birth_date DATE,
    p_code TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_id UUID;
    v_created_at TIMESTAMPTZ;
BEGIN
    -- Masukkan data membership
    INSERT INTO public.memberships (
        customer_name, 
        phone, 
        membership_plan_id, 
        birth_date, 
        code, 
        status
    ) VALUES (
        p_customer_name, 
        p_phone, 
        p_plan_id, 
        p_birth_date, 
        p_code, 
        'pending'
    )
    RETURNING id, created_at INTO v_new_id, v_created_at;

    -- Return JSON format untuk memudahkan front-end
    RETURN json_build_object(
        'id', v_new_id,
        'customer_name', p_customer_name,
        'phone', p_phone,
        'code', p_code,
        'status', 'pending',
        'created_at', v_created_at
    );
END;
$$;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
