"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, error: "Username dan password wajib diisi." };
  }

  // Format username menjadi email untuk Supabase Auth
  const email = `${username.trim().toLowerCase()}@blackyellow.local`;

  const supabase = await createClient();

  // 1. Autentikasi dengan pseudo-email & password
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    console.error("Login error:", authError?.message);
    return { success: false, error: "Username atau password salah." };
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
  redirect("/admin/login");
}
