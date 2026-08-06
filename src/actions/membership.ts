"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

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
  const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `BYM-${uniqueId}`;

  const { data, error } = await supabase
    .from("memberships")
    .insert({
      code,
      customer_name: customerName,
      phone,
      membership_plan_id: planId,
      birth_date: birthDate ? birthDate : null,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    console.error("Membership Insert Error:", error);
    return { error: "Terjadi kesalahan saat mendaftar. Silakan coba lagi nanti." };
  }

  revalidatePath("/admin/memberships");
  return { success: true, data };
}
