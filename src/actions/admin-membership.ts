"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAdminMemberships() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memberships")
    .select(`
      *,
      membership_plans ( name, duration_days )
    `)
    .order("joined_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin memberships", error);
    return [];
  }

  return data;
}

export async function updateMembershipStatus(id: string, status: string, durationDays?: number) {
  const supabase = await createClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = { status };
  const now = new Date();
  
  if (status === "active" && durationDays) {
    updateData.activated_at = now.toISOString();
    
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    updateData.expires_at = expiresAt.toISOString();
  }

  const { error } = await supabase
    .from("memberships")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating membership status", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/memberships");
  return { success: true };
}
