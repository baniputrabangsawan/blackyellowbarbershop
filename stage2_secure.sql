-- =================================================================================
-- SCRIPT PENGAMANAN DATABASE TAHAP 2 - BLACK YELLOW BARBERSHOP
-- =================================================================================

-- 1. MENCABUT AKSES BACA PUBLIK DARI TABEL QUEUES (Mencegah Kebocoran PII/WhatsApp)
-- Tabel ini sekarang tertutup bagi publik. Server Actions akan menggunakan RPC khusus di bawah.
DROP POLICY IF EXISTS "Public read access on queues" ON public.queues;
-- Tetap pertahankan akses insert untuk pendaftaran publik (yang nanti dibatasi Rate Limit)
-- CREATE POLICY "Public insert access on queues" ON public.queues FOR INSERT WITH CHECK (true); (Sudah ada di tahap 1)

-- 2. MEMBUAT FUNGSI RPC UNTUK MEMBACA STATUS ANTREAN TANPA MEMBUKA DATA PII
CREATE OR REPLACE FUNCTION public.get_live_queue_status_safe(p_branch_id UUID, p_today DATE)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Menjalankan fungsi sebagai pembuatnya, melewati limitasi RLS
AS $$
DECLARE
    v_current_number INT;
    v_waiting_count INT;
BEGIN
    -- Dapatkan nomor antrean yang sedang dilayani/dipanggil
    SELECT queue_number INTO v_current_number
    FROM public.queues
    WHERE branch_id = p_branch_id 
      AND queue_date = p_today 
      AND status IN ('called', 'in_service')
    ORDER BY called_at DESC NULLS LAST
    LIMIT 1;

    -- Dapatkan jumlah orang yang menunggu
    SELECT count(*) INTO v_waiting_count
    FROM public.queues
    WHERE branch_id = p_branch_id 
      AND queue_date = p_today 
      AND status = 'waiting';

    RETURN json_build_object(
        'currentNumber', v_current_number,
        'waitingCount', v_waiting_count,
        'estimatedWaitMins', v_waiting_count * 15
    );
END;
$$;

-- 3. MEMBUAT TABEL RATE LIMIT UNTUK MENCEGAH SPAM / BOT
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mengaktifkan RLS pada tabel rate_limits (Hanya server admin / RPC yang boleh memodifikasi)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 4. MEMBUAT FUNGSI RPC RATE LIMITER
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_ip TEXT, p_action TEXT, p_max_req INT, p_window_seconds INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Bisa diakses publik tapi eksekusi di bawah privilese pembuatnya
AS $$
DECLARE
    v_count INT;
BEGIN
    -- Bersihkan data lama untuk IP dan action ini agar tabel tidak membengkak
    DELETE FROM public.rate_limits 
    WHERE ip_address = p_ip 
      AND action = p_action 
      AND created_at < (now() - (p_window_seconds || ' seconds')::interval);

    -- Hitung jumlah request tersisa
    SELECT count(*) INTO v_count 
    FROM public.rate_limits 
    WHERE ip_address = p_ip AND action = p_action;

    -- Jika melebih batas, tolak
    IF v_count >= p_max_req THEN
        RETURN FALSE; 
    END IF;

    -- Jika belum melebihi batas, catat request baru dan izinkan
    INSERT INTO public.rate_limits (ip_address, action) VALUES (p_ip, p_action);
    RETURN TRUE;
END;
$$;

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
