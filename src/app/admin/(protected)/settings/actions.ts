/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSiteSettingsAction(data: any) {
  const supabase = await createClient();

  // Ambil ID setting pertama
  const { data: existing, error: fetchError } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    return { error: "Gagal mengambil konfigurasi aktif." };
  }

  let updateError;

  if (existing) {
    const { error } = await supabase
      .from("site_settings")
      .update({
        // Business
        business_name: data.business_name,
        branch_name: data.branch_name,
        address: data.address,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        maps_url: data.maps_url,
        instagram_url: data.instagram_url,
        tiktok_url: data.tiktok_url,
        facebook_url: data.facebook_url,
        timezone: data.timezone,
        
        // Operational
        is_open: data.is_open,
        operational_status: data.operational_status,
        accept_new_queue: data.accept_new_queue,
        allow_online_queue: data.allow_online_queue,
        allow_walkin: data.allow_walkin,
        
        // Queue Config
        max_daily_queue: data.max_daily_queue,
        max_waiting: data.max_waiting,
        start_queue_number: data.start_queue_number,
        default_estimation_mins: data.default_estimation_mins,
        late_tolerance_mins: data.late_tolerance_mins,
        allow_barber_selection: data.allow_barber_selection,
        
        // Branding & SEO
        logo_url: data.logo_url,
        favicon_url: data.favicon_url,
        brand_tagline: data.brand_tagline,
        og_image_url: data.og_image_url,
        seo_title: data.seo_title,
        meta_description: data.meta_description,
        
        updated_at: new Date().toISOString()
      })
      .eq("id", existing.id);
    updateError = error;
  } else {
    // If no existing record, we should insert it
    const { error } = await supabase
      .from("site_settings")
      .insert({
        hero_title: "Potongan Presisi.", // required fields
        hero_subtitle: "Gaya Tanpa Kompromi.", // required fields
        hero_description: "Lebih dari sekadar pangkas rambut.", // required fields
        business_name: data.business_name,
        branch_name: data.branch_name,
        address: data.address,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        maps_url: data.maps_url,
        instagram_url: data.instagram_url,
        tiktok_url: data.tiktok_url,
        facebook_url: data.facebook_url,
        timezone: data.timezone,
        
        // Operational
        is_open: data.is_open ?? true,
        operational_status: data.operational_status ?? 'Buka',
        accept_new_queue: data.accept_new_queue ?? true,
        allow_online_queue: data.allow_online_queue ?? true,
        allow_walkin: data.allow_walkin ?? true,
        
        // Queue Config
        max_daily_queue: data.max_daily_queue ?? 50,
        max_waiting: data.max_waiting ?? 10,
        start_queue_number: data.start_queue_number ?? 1,
        default_estimation_mins: data.default_estimation_mins ?? 45,
        late_tolerance_mins: data.late_tolerance_mins ?? 15,
        allow_barber_selection: data.allow_barber_selection ?? true,
        
        // Branding & SEO
        logo_url: data.logo_url,
        favicon_url: data.favicon_url,
        brand_tagline: data.brand_tagline,
        og_image_url: data.og_image_url,
        seo_title: data.seo_title,
        meta_description: data.meta_description,
      });
    updateError = error;
  }

  if (updateError) {
    console.error("Update settings error:", updateError);
    return { error: updateError.message };
  }

  // Catat ke Audit Log
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user) {
    await supabase.from("admin_activity_logs").insert({
      admin_user_id: userData.user.id,
      action: existing ? "UPDATE_SETTINGS" : "CREATE_SETTINGS",
      entity_type: "site_settings",
      entity_id: existing?.id || "global",
      metadata: { updated_fields: Object.keys(data) }
    });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  
  return { success: true };
}
