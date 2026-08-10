"use server";

import { createClient } from "@/lib/supabase/server";
import { verifyAdmin } from "@/lib/auth";

export async function getAdminAccounts() {
  const { isAuthorized, role } = await verifyAdmin();
  if (!isAuthorized || role !== "owner") return [];

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_accounts");
  
  if (error) {
    console.error("Error fetching admin accounts:", error);
    return [];
  }
  
  return data || [];
}

export async function updateAdminCredentials(targetUserId: string, newUsername?: string, newPassword?: string) {
  const { isAuthorized, role } = await verifyAdmin();
  
  if (!isAuthorized || role !== "owner") {
    return { success: false, error: "Akses ditolak. Hanya Owner yang dapat melakukan ini." };
  }

  if (!targetUserId) {
    return { success: false, error: "ID target tidak valid." };
  }

  if (newPassword && newPassword.length > 0 && newPassword.length < 6) {
    return { success: false, error: "Password harus minimal 6 karakter." };
  }

  const supabase = await createClient();
  const targetEmail = newUsername && newUsername.trim() !== "" ? `${newUsername.trim().toLowerCase()}@blackyellow.local` : null;

  const { error } = await supabase.rpc("admin_update_credentials", {
    target_user_id: targetUserId,
    new_email: targetEmail,
    new_password: newPassword || null
  });

  if (error) {
    console.error("Error updating credentials:", error);
    return { success: false, error: error.message || "Gagal mengubah kredensial." };
  }

  return { success: true };
}
