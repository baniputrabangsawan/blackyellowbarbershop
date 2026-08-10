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

export async function addBarber(name: string) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const { error, data } = await supabase
    .from("barbers")
    .insert([{ name, slug, is_active: true }])
    .select()
    .single();

  if (error) {
    console.error("Error adding barber", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/barbers");
  revalidatePath("/");
  return { success: true, data };
}

export async function updateBarber(id: string, name: string) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const { error } = await supabase
    .from("barbers")
    .update({ name, slug })
    .eq("id", id);

  if (error) {
    console.error("Error updating barber", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/barbers");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBarber(id: string) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };

  const supabase = await createClient();
  
  // NOTE: If barber is linked to queues, this might fail due to foreign keys.
  // A safe fallback would be to catch the error and suggest disabling instead.
  const { error } = await supabase
    .from("barbers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting barber", error);
    if (error.code === '23503') {
      return { success: false, error: "Barber tidak bisa dihapus karena masih terkait dengan data antrean. Silakan ubah statusnya menjadi Non-Aktif saja." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/barbers");
  revalidatePath("/");
  return { success: true };
}
