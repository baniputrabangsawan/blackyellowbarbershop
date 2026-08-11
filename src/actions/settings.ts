import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import { cache } from "react";
import type { SiteSettings } from "@/types";

export const getPublicSettings = cache(async function getPublicSettings() {
  const supabase = createPublicClient();
  const { data: siteSettings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .single();

  return siteSettings || {
    hero_title: "Potongan Presisi.",
    hero_subtitle: "Gaya Tanpa Kompromi.",
    hero_description: "Lebih dari sekadar pangkas rambut. Kami menghadirkan pengalaman premium dengan barber profesional untuk tampilan terbaik Anda."
  } as SiteSettings;
});

export async function getPublicGalleries() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getPublicFaqs() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getPublicPromos() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("promos")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!data) return [];

  // Filter tanggal valid di JS untuk akurasi karena null di start/end date berarti "selamanya"
  return data.filter(promo => {
    const isStarted = !promo.start_date || new Date(promo.start_date) <= new Date();
    const isNotExpired = !promo.end_date || new Date(promo.end_date) >= new Date();
    return isStarted && isNotExpired;
  });
}

export async function getPublicBarbers() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("barbers")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return data || [];
}

export async function getPublicTestimonials() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id, name, content, rating")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return data || [];
}
