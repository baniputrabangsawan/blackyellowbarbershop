"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getAdminSettings() {
  const supabase = await createClient();

  // Get active branch for toggle
  const { data: branchData } = await supabase
    .from("branches")
    .select("*")
    .limit(1)
    .single();

  // Get site settings for Hero text
  // NOTE: This requires the site_settings table to exist
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single();

  return {
    branch: branchData,
    siteSettings: siteSettings || {
      hero_title: "Potongan Presisi.",
      hero_subtitle: "Gaya Tanpa Kompromi.",
      hero_description: "Lebih dari sekadar pangkas rambut. Kami menghadirkan pengalaman premium dengan barber profesional untuk tampilan terbaik Anda."
    }
  };
}

export async function updateBranchStatus(branchId: string, isActive: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("branches")
    .update({ is_active: isActive })
    .eq("id", branchId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateHeroSettings(title: string, subtitle: string, description: string) {
  const supabase = await createClient();
  
  // Update the first row (assuming only one row exists)
  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).single();
  
  let error;
  
  if (existing) {
    const { error: updateError } = await supabase
      .from("site_settings")
      .update({
        hero_title: title,
        hero_subtitle: subtitle,
        hero_description: description
      })
      .eq("id", existing.id);
    error = updateError;
  } else {
    // If no row exists, try inserting (needs to be allowed by RLS though)
    const { error: insertError } = await supabase
      .from("site_settings")
      .insert({
        hero_title: title,
        hero_subtitle: subtitle,
        hero_description: description
      });
    error = insertError;
  }

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function resetTodayQueue(branchId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  
  // "Reset" could mean cancelling all current queues for today that are not completed
  const { error } = await supabase
    .from("queues")
    .update({ status: "cancelled" })
    .eq("branch_id", branchId)
    .eq("queue_date", today)
    .in("status", ["waiting", "called", "in_service"]);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
