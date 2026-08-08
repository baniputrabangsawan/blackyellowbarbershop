import { createClient } from "@/lib/supabase/server";

export async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { isAuthorized: false, user: null };
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (adminError || !adminUser) {
    return { isAuthorized: false, user };
  }

  return { isAuthorized: true, user, role: adminUser.role };
}
