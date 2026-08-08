"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth";
import { z } from "zod";

export async function getAdminSettings() {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");
  const supabase = await createClient();

  // Get active branch for toggle
  const { data: branchData } = await supabase
    .from("branches")
    .select("*")
    .limit(1)
    .maybeSingle();

  // Get site settings for Hero text
  // NOTE: This requires the site_settings table to exist
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

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
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
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

const heroSchema = z.object({
  title: z.string().min(1, "Title wajib diisi").max(100, "Title maksimal 100 karakter"),
  subtitle: z.string().min(1, "Subtitle wajib diisi").max(150, "Subtitle maksimal 150 karakter"),
  description: z.string().min(1, "Deskripsi wajib diisi").max(500, "Deskripsi maksimal 500 karakter"),
});

export async function updateHeroSettings(title: string, subtitle: string, description: string) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };

  const validatedFields = heroSchema.safeParse({ title, subtitle, description });
  if (!validatedFields.success) {
    return { success: false, error: "Teks terlalu panjang atau tidak valid." };
  }

  const { title: safeTitle, subtitle: safeSubtitle, description: safeDesc } = validatedFields.data;
  
  const supabase = await createClient();
  
  // Update the first row (assuming only one row exists)
  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();
  
  let error;
  
  if (existing) {
    const { error: updateError } = await supabase
      .from("site_settings")
      .update({
        hero_title: safeTitle,
        hero_subtitle: safeSubtitle,
        hero_description: safeDesc
      })
      .eq("id", existing.id);
    error = updateError;
  } else {
    // If no row exists, try inserting (needs to be allowed by RLS though)
    const { error: insertError } = await supabase
      .from("site_settings")
      .insert({
        hero_title: safeTitle,
        hero_subtitle: safeSubtitle,
        hero_description: safeDesc
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

export async function resetTodayQueue(branchId: string, reason: string = "Reset manual") {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  
  // "Reset" means cancelling all current queues for today that are not completed
  const { error } = await supabase
    .from("queues")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("branch_id", branchId)
    .eq("queue_date", today)
    .in("status", ["waiting", "called", "in_service"]);

  if (error) {
    return { success: false, error: error.message };
  }

  // Audit Log
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user) {
    await supabase.from("admin_activity_logs").insert({
      admin_user_id: userData.user.id,
      action: "RESET_QUEUE",
      entity_type: "queues",
      entity_id: branchId,
      metadata: { reason, date: today }
    });
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}
