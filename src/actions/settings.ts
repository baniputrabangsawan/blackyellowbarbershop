"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPublicSettings() {
  const supabase = await createClient();

  // Try to get site settings
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single();

  return siteSettings || {
    hero_title: "Potongan Presisi.",
    hero_subtitle: "Gaya Tanpa Kompromi.",
    hero_description: "Lebih dari sekadar pangkas rambut. Kami menghadirkan pengalaman premium dengan barber profesional untuk tampilan terbaik Anda."
  };
}
