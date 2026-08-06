"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email dan password wajib diisi." };
  }

  const supabase = await createClient();

  // 1. Autentikasi dengan email & password
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error("Login error:", authError?.message);
    return { success: false, error: "Email atau password salah." };
  }

  // 2. Verifikasi apakah user ada di tabel admin_users
  const { data: adminData, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", authData.user.id)
    .single();

  if (adminError || !adminData) {
    // Jika bukan admin, logout paksa
    await supabase.auth.signOut();
    return { success: false, error: "Akses Ditolak: Akun Anda tidak memiliki hak akses admin." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}
