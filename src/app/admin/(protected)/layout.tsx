import { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { AdminDesktopNav } from "@/components/admin/desktop-nav";

export const metadata = {
  title: "Admin Dashboard | Black Yellow Barbershop",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  // Langkah 1: Validasi token langsung ke Supabase Auth Server (getUser)
  // Ini mencegah munculnya error/warning "getSession is insecure" di console log
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  // Langkah 2: Verifikasi role admin di tabel admin_users
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (adminError || !adminUser) {
    // Memaksa logout jika bukan admin
    await supabase.auth.signOut();
    redirect("/admin/login");
  }


  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      {/* Sidebar */}
      {/* Sidebar Desktop */}
      <AdminDesktopNav />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background relative">
        <AdminMobileNav />
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
