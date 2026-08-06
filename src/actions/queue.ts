"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const queueSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  serviceId: z.string().uuid("Layanan harus dipilih"),
  preferredBarberId: z.string().optional().or(z.literal("")),
  branchId: z.string().uuid("Cabang tidak valid"),
});

export async function createQueue(formData: FormData) {
  const supabase = await createClient();
  
  // Validation
  const validatedFields = queueSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    serviceId: formData.get("serviceId"),
    preferredBarberId: formData.get("preferredBarberId"),
    branchId: formData.get("branchId"),
  });

  if (!validatedFields.success) {
    return { error: "Data tidak valid", details: validatedFields.error.flatten().fieldErrors };
  }

  const { customerName, phone, serviceId, preferredBarberId, branchId } = validatedFields.data;

  // Check store state before creating queue
  const storeState = await getStoreQueueState(branchId);
  if (storeState !== 'open') {
    return { error: "Pendaftaran antrean sedang ditutup atau toko sudah penuh." };
  }

  // Get current date
  const today = new Date().toISOString().split("T")[0];

  // Calculate new queue number
  // Using a simple transaction-like approach or just reading max
  // Note: For high concurrency, a DB function/trigger is better. 
  // For MVP, we'll fetch max and increment.
  const { data: maxQueue } = await supabase
    .from("queues")
    .select("queue_number")
    .eq("branch_id", branchId)
    .eq("queue_date", today)
    .order("queue_number", { ascending: false })
    .limit(1)
    .single();

  const nextNumber = maxQueue ? maxQueue.queue_number + 1 : 1;

  const { data, error } = await supabase
    .from("queues")
    .insert({
      branch_id: branchId,
      queue_date: today,
      queue_number: nextNumber,
      customer_name: customerName,
      phone,
      service_id: serviceId,
      preferred_barber_id: preferredBarberId ? preferredBarberId : null,
      status: "waiting",
      source: "web"
    })
    .select()
    .single();

  if (error) {
    console.error("Queue Insert Error:", error);
    return { error: "Gagal mengambil antrean. Silakan coba lagi." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, data };
}

export async function getQueueOptions() {
  const supabase = await createClient();
  
  const [branches, services, barbers] = await Promise.all([
    supabase.from("branches").select("id, name").eq("is_active", true),
    supabase.from("services").select("id, name, price, duration_minutes").eq("is_active", true).order("sort_order"),
    supabase.from("barbers").select("id, name").eq("is_active", true)
  ]);
  
  return {
    branches: branches.data || [],
    services: services.data || [],
    barbers: barbers.data || []
  };
}

export async function getLiveQueueStatus(branchId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  
  // Get active queue (in_service)
  const { data: currentQueue } = await supabase
    .from("queues")
    .select("queue_number, status, called_at")
    .eq("branch_id", branchId)
    .eq("queue_date", today)
    .in("status", ["called", "in_service"])
    .order("called_at", { ascending: false })
    .limit(1)
    .single();
    
  // Get waiting count
  const { count: waitingCount } = await supabase
    .from("queues")
    .select("*", { count: "exact", head: true })
    .eq("branch_id", branchId)
    .eq("queue_date", today)
    .eq("status", "waiting");
    
  // Simple estimation logic (15 mins per waiting person as a placeholder)
  // For MVP, we'll use a static multiplier. In production, we'd use service duration.
  const estimatedWaitMins = (waitingCount || 0) * 15;
  
  return {
    currentNumber: currentQueue ? currentQueue.queue_number : null,
    waitingCount: waitingCount || 0,
    estimatedWaitMins
  };
}

export async function getStoreQueueState(branchId: string): Promise<'open' | 'closed' | 'offline'> {
  try {
    const supabase = await createClient();
    
    // Get current time in Makassar timezone
    const now = new Date();
    const makassarTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
    const dayOfWeek = makassarTime.getDay(); // 0 is Sunday
    
    const { data: businessHour, error } = await supabase
      .from("business_hours")
      .select("open_time, close_time, is_closed")
      .eq("branch_id", branchId)
      .eq("day_of_week", dayOfWeek)
      .single();
      
    if (error || !businessHour) {
      return 'offline';
    }
    
    if (businessHour.is_closed || !businessHour.open_time || !businessHour.close_time) {
      return 'closed';
    }
    
    const [openHour, openMin] = businessHour.open_time.split(':').map(Number);
    const [closeHour, closeMin] = businessHour.close_time.split(':').map(Number);
    
    const openTimeMinutes = openHour * 60 + openMin;
    const closeTimeMinutes = closeHour * 60 + closeMin;
    const currentTimeMinutes = makassarTime.getHours() * 60 + makassarTime.getMinutes();
    
    // Registration closes 30 minutes before store close time
    const cutoffTimeMinutes = closeTimeMinutes - 30;
    
    if (currentTimeMinutes < openTimeMinutes || currentTimeMinutes >= cutoffTimeMinutes) {
      return 'closed';
    }
    
    return 'open';
  } catch (error) {
    console.error("Error getting store queue state:", error);
    return 'offline';
  }
}
