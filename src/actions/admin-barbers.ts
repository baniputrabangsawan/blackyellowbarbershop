"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth";

export async function getAdminBarbers() {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching barbers", error);
    return [];
  }

  return data;
}

export async function updateBarberStatus(barberId: string, isActive: boolean) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  
  const { error } = await supabase
    .from("barbers")
    .update({ is_active: isActive })
    .eq("id", barberId);

  if (error) {
    console.error("Error updating barber status", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/barbers");
  revalidatePath("/");
  return { success: true };
}
