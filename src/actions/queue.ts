"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { verifyAdmin } from "@/lib/auth";

const queueSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  serviceId: z.string().min(1, "Layanan harus dipilih"),
  preferredBarberId: z.string().nullable().optional().or(z.literal("")),
  branchId: z.string().min(1, "Cabang tidak valid"),
});

export async function createQueue(formData: FormData) {
  const supabase = await createClient();
  
  const adminCheck = await verifyAdmin();
  const isAdmin = adminCheck.isAuthorized;

  // Rate limiting (max 3 queues per hour per IP) - BYPASS UNTUK ADMIN
  if (!isAdmin) {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const { data: isAllowed } = await supabase.rpc("check_rate_limit", { 
      p_ip: ip, 
      p_action: "create_queue", 
      p_max_req: 3, 
      p_window_seconds: 3600 
    });

    if (isAllowed === false) {
      return { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." };
    }
  }

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

  // Check store state before creating queue - BYPASS UNTUK ADMIN
  if (!isAdmin) {
    const storeState = await getStoreQueueState(branchId);
    if (storeState !== 'open') {
      return { error: "Pendaftaran antrean sedang ditutup atau toko sudah penuh." };
    }
  }

  // Use the RPC to safely generate next queue number and insert
  const { data, error } = await supabase.rpc("generate_next_queue", {
    p_branch_id: branchId,
    p_customer_name: customerName,
    p_phone: phone,
    p_service_id: serviceId,
    p_barber_id: preferredBarberId || null
  });

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
  
  const { data, error } = await supabase.rpc("get_live_queue_status_safe", {
    p_branch_id: branchId,
    p_today: today
  });

  if (error || !data) {
    return {
      currentNumber: null,
      waitingCount: 0,
      estimatedWaitMins: 0
    };
  }
  
  return {
    currentNumber: data.currentNumber,
    waitingCount: data.waitingCount,
    estimatedWaitMins: data.estimatedWaitMins
  };
}

export async function getStoreQueueState(branchId: string): Promise<'open' | 'closed' | 'offline'> {
  try {
    const supabase = await createClient();
    
    // Get current time in Makassar timezone
    const now = new Date();
    const makassarTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
    const dayOfWeek = makassarTime.getDay(); // 0 is Sunday
    
    // Check if the branch is manually closed by the admin (is_active = false)
    const { data: branch } = await supabase
      .from("branches")
      .select("is_active")
      .eq("id", branchId)
      .single();

    if (branch && branch.is_active === false) {
      return 'closed';
    }

    // Check Global Site Settings from Admin Dashboard
    const { data: settings } = await supabase
      .from("site_settings")
      .select("is_open, operational_status, accept_new_queue")
      .limit(1)
      .maybeSingle();

    if (settings) {
      if (settings.is_open === false) return 'closed';
      if (settings.accept_new_queue === false) return 'closed';
      if (
        settings.operational_status === 'Istirahat' || 
        settings.operational_status === 'Antrean Penuh' || 
        settings.operational_status === 'Maintenance'
      ) {
        return 'closed';
      }
    }

    // We bypass the strict business_hours table check here
    // because the admin dashboard "Status Operasional" is now the single source of truth.
    // If the admin sets it to "Buka", it remains open until they change it or turn off "Toko Buka".
    
    return 'open';
  } catch (error) {
    console.error("Queue state error:", error);
    return 'offline';
  }
}
