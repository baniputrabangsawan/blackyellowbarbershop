"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPromos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching promos:", error);
    return [];
  }
  return data;
}

export async function createPromo(data: { title: string; description: string; start_date?: string | null; end_date?: string | null; is_active: boolean; cta_text?: string; cta_url?: string }) {
  const supabase = await createClient();
  
  // Format null explicitly if empty to avoid DB type errors
  const insertData = {
    ...data,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
  };

  const { error } = await supabase.from("promos").insert([insertData]);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/content/promo");
  revalidatePath("/");
  return { success: true };
}

export async function updatePromo(id: string, data: { title: string; description: string; start_date?: string | null; end_date?: string | null; is_active: boolean; cta_text?: string; cta_url?: string }) {
  const supabase = await createClient();
  
  const updateData = {
    ...data,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
  };

  const { error } = await supabase.from("promos").update(updateData).eq("id", id);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/content/promo");
  revalidatePath("/");
  return { success: true };
}

export async function deletePromo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("promos").delete().eq("id", id);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/content/promo");
  revalidatePath("/");
  return { success: true };
}
