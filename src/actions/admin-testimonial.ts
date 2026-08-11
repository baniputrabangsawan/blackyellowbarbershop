"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth";

export async function getTestimonials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching testimonials", error);
    return [];
  }

  return data;
}

export async function createTestimonial(data: { name: string; content: string; rating: number; sort_order: number; is_active: boolean }) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();

  const { error } = await supabase.from("testimonials").insert([data]);

  if (error) {
    console.error("Error creating testimonial", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/content/testimonial");
  revalidatePath("/");
  return { success: true };
}

export async function updateTestimonial(id: string, data: { name: string; content: string; rating: number; sort_order: number; is_active: boolean }) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("testimonials")
    .update(data)
    .eq("id", id);

  if (error) {
    console.error("Error updating testimonial", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/content/testimonial");
  revalidatePath("/");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();

  const { error } = await supabase
    .from("testimonials")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting testimonial", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/content/testimonial");
  revalidatePath("/");
  return { success: true };
}
