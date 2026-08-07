import { ReactNode } from "react";
import Link from "next/link";
import { Users, CalendarClock, Scissors, Settings, LogOut, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logoutAction } from "../login/actions";
import { AdminMobileNav } from "@/components/admin/mobile-nav";

export const metadata = {
  title: "Admin Dashboard | Black Yellow Barbershop",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  // Cek apakah user ada di tabel admin_users
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
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-elevated border-r border-border hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="font-heading text-xl font-bold uppercase tracking-tight text-primary">
            Black<span className="text-foreground">Yellow</span> <span className="text-muted-foreground text-sm">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-md bg-primary/10 text-primary font-medium transition-colors">
            <CalendarClock size={20} />
            Antrean Hari Ini
          </Link>
          <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
            <Scissors size={20} />
            Layanan
          </Link>
          <Link href="/admin/barbers" className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
            <Users size={20} />
            Barber
          </Link>
          <Link href="/admin/memberships" className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
            <ShieldCheck size={20} />
            Membership
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
            <Settings size={20} />
            Pengaturan
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <form action={logoutAction}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-left">
              <LogOut size={20} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

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
