"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth";

export async function getAdminServices() {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching services", error);
    return [];
  }

  return data;
}

export async function updateServiceStatus(serviceId: string, isActive: boolean) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", serviceId);

  if (error) {
    console.error("Error updating service status", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
  return { success: true };
}

export async function updateServicePrice(serviceId: string, price: number) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("services")
    .update({ price })
    .eq("id", serviceId);

  if (error) {
    console.error("Error updating service price", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
  return { success: true };
}

export async function updateServiceDetails(serviceId: string, name: string, duration_minutes: number, price: number) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("services")
    .update({ name, duration_minutes, price })
    .eq("id", serviceId);

  if (error) {
    console.error("Error updating service details", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
  return { success: true };
}

export async function deleteService(serviceId: string) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);

  if (error) {
    console.error("Error deleting service", error);
    // Jika karena foreign key constraint
    if (error.code === '23503') {
      return { success: false, error: "Layanan ini tidak bisa dihapus karena sedang digunakan pada riwayat antrean pelanggan." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
  return { success: true };
}
