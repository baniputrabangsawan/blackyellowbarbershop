"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getGalleries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("galleries")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching galleries:", error);
    return [];
  }
  return data;
}

export async function createGallery(data: { image_url: string; alt_text: string; category: string; sort_order: number; is_published: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase.from("galleries").insert([data]);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/content/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function updateGallery(id: string, data: { image_url: string; alt_text: string; category: string; sort_order: number; is_published: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase.from("galleries").update(data).eq("id", id);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/content/gallery");
  revalidatePath("/");
  return { success: true };
}

export async function deleteGallery(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("galleries").delete().eq("id", id);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/content/gallery");
  revalidatePath("/");
  return { success: true };
}
