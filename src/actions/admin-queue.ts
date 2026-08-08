/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth";

export async function getTodayQueues() {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) throw new Error("Unauthorized");
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("queues")
    .select(`
      *,
      services ( name, duration_minutes ),
      barbers:barbers!queues_preferred_barber_id_fkey ( name )
    `)
    .eq("queue_date", today)
    .order("queue_number", { ascending: true });

  if (error) {
    console.error("Error fetching queues", error);
    return [];
  }

  return data;
}

export async function updateQueueStatus(queueId: string, status: string) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();
  
  const updateData: any = { status };
  
  if (status === "called") {
    updateData.called_at = new Date().toISOString();
  } else if (status === "in_service") {
    updateData.started_at = new Date().toISOString();
  } else if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
  } else if (status === "cancelled" || status === "no_show") {
    updateData.cancelled_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("queues")
    .update(updateData)
    .eq("id", queueId);

  if (error) {
    console.error("Error updating queue", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteQueue(queueId: string) {
  const { isAuthorized } = await verifyAdmin();
  if (!isAuthorized) return { success: false, error: "Unauthorized" };
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("queues")
    .delete()
    .eq("id", queueId);

  if (error) {
    console.error("Error deleting queue", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
