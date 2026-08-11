import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client with SERVICE_ROLE_KEY.
 * Bypasses Row Level Security (RLS).
 * NEVER expose this to the client/browser.
 * Used for secure backend operations (e.g., getting queue counts).
 */
export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase URL or Service Role Key");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
