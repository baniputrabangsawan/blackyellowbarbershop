-- Drop the old public read policy on queues
DROP POLICY IF EXISTS "Public read queues" ON public.queues;

-- Add admin explicit select policy
CREATE POLICY "Admin select queues" ON public.queues FOR SELECT TO authenticated USING (public.is_admin());
