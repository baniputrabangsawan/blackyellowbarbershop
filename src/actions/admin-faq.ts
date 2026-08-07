"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getFaqs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
  return data;
}

export async function createFaq(data: { question: string; answer: string; sort_order: number; is_active: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert([data]);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/content/faq");
  revalidatePath("/");
  return { success: true };
}

export async function updateFaq(id: string, data: { question: string; answer: string; sort_order: number; is_active: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").update(data).eq("id", id);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/content/faq");
  revalidatePath("/");
  return { success: true };
}

export async function deleteFaq(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/admin/content/faq");
  revalidatePath("/");
  return { success: true };
}
