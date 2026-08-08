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

export async function getPublicGalleries() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getPublicFaqs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getPublicPromos() {
  const supabase = await createClient();
  // Ambil promo yang aktif dan tanggalnya masih valid (opsional, jika difilter dari DB lebih baik,
  // tapi untuk kemudahan kita filter is_active=true lalu filter start/end date di client/server jika perlu,
  // atau langsung di DB jika didukung:
  const { data } = await supabase
    .from("promos")
    .select("*")
    .eq("is_active", true)
    // Supabase filtering for dates is tricky without custom RPC if we allow nulls, 
    // so we'll fetch active ones and filter in JS to be safe since promos are few.
    .order("created_at", { ascending: false });
    
  if (!data) return [];
  
  // Filter tanggal valid di JS untuk akurasi karena null di start/end date berarti "selamanya"
  return data.filter(promo => {
    const isStarted = !promo.start_date || new Date(promo.start_date) <= new Date();
    const isNotExpired = !promo.end_date || new Date(promo.end_date) >= new Date();
    return isStarted && isNotExpired;
  });
}
