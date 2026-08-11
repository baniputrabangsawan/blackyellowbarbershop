import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Public Supabase client that DOES NOT use cookies.
 * Use this for fetching public data (Galleries, Barbers, Testimonials, etc)
 * on Server Components (like page.tsx) to ensure Next.js can Statically Cache the page.
 * If you use `cookies()` here, the page becomes Dynamic (slow).
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
}
