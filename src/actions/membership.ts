"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getMembershipPlans() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("Error fetching membership plans:", error);
    return [];
  }
  return data;
}

const membershipSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid (min 10 digit)"),
  planId: z.string().uuid("Paket membership tidak valid"),
  birthDate: z.string().optional().or(z.literal("")),
});

export async function createMembership(formData: FormData) {
  const supabase = await createClient();
  
  // Rate limiting (max 5 membership registrations per day per IP)
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const { data: isAllowed } = await supabase.rpc("check_rate_limit", { 
    p_ip: ip, 
    p_action: "create_membership", 
    p_max_req: 5, 
    p_window_seconds: 86400 
  });

  if (isAllowed === false) {
    return { error: "Terlalu banyak percobaan pendaftaran. Silakan coba lagi besok." };
  }

  const validatedFields = membershipSchema.safeParse({
    customerName: formData.get("customerName"),
    phone: formData.get("phone"),
    planId: formData.get("planId"),
    birthDate: formData.get("birthDate"),
  });

  if (!validatedFields.success) {
    return { error: "Data tidak valid", details: validatedFields.error.flatten().fieldErrors };
  }

  const { customerName, phone, planId, birthDate } = validatedFields.data;

  // Check for duplicate phone
  const { data: existingUser } = await supabase
    .from("memberships")
    .select("id")
    .eq("phone", phone)
    .limit(1)
    .single();

  if (existingUser) {
    return { error: "Nomor WhatsApp ini sudah terdaftar sebagai member." };
  }

  // Generate unique code BYM-<RANDOM>
  const uniqueId = crypto.randomUUID().substring(0, 8).toUpperCase();
  const code = `BYM-${uniqueId}`;

  // Gunakan RPC yang memiliki bypass RLS (Security Definer)
  const { data, error } = await supabase.rpc("create_membership_safe", {
    p_customer_name: customerName,
    p_phone: phone,
    p_plan_id: planId,
    p_birth_date: birthDate || null,
    p_code: code
  });

  if (error) {
    console.error("Error creating membership:", error);
    return { error: "Gagal memproses pendaftaran. Silakan coba lagi." };
  }

  // data di sini adalah JSON object yang dikembalikan oleh RPC
  revalidatePath("/admin/memberships");
  return { success: true, data };
}
