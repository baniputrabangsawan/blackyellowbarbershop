import { ReactNode } from "react";
import Link from "next/link";
import { 
  Users, CalendarClock, Scissors, Settings, LogOut, ShieldCheck,
  Home, Image as ImageIcon, MessageSquare, Tag, Activity, Globe
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logoutAction } from "../login/actions";
import { AdminMobileNav } from "@/components/admin/mobile-nav";

export const metadata = {
  title: "Admin Dashboard | Black Yellow Barbershop",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  // Langkah 1: Baca session dari cookie secara lokal (cepat, tanpa network request)
  // Ini hanya untuk mendapat user.id agar bisa query admin_users secara paralel
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/admin/login");
  }

  // Langkah 2: Jalankan validasi server (getUser) dan pengecekan DB secara PARALEL
  // getUser() memvalidasi token ke Supabase Auth Server
  // admin_users query menggunakan session.user.id yang sudah kita dapat di langkah 1
  const [{ data: { user }, error }, { data: adminUser, error: adminError }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("admin_users").select("role").eq("user_id", session.user.id).single(),
  ]);

  // Validasi hasil — logika keamanan tetap sama persis
  if (error || !user) {
    redirect("/admin/login");
  }

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
          <div className="px-4 py-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-md bg-primary/10 text-primary font-medium transition-colors">
              <CalendarClock size={20} />
              Antrean Hari Ini
            </Link>
          </div>
          
          <div className="px-4 py-2">
            <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Operasional</h4>
            <div className="space-y-1">
              <Link href="/admin/services" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <Scissors size={20} />
                Layanan
              </Link>
              <Link href="/admin/barbers" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <Users size={20} />
                Barber
              </Link>
              <Link href="/admin/memberships" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <ShieldCheck size={20} />
                Membership
              </Link>
            </div>
          </div>

          <div className="px-4 py-2">
            <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Konten</h4>
            <div className="space-y-1">
              <Link href="/admin/content/homepage" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <Home size={20} />
                Halaman Utama
              </Link>
              <Link href="/admin/content/gallery" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <ImageIcon size={20} />
                Galeri
              </Link>
              <Link href="/admin/content/faq" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <MessageSquare size={20} />
                FAQ
              </Link>
              <Link href="/admin/content/promo" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <Tag size={20} />
                Promo
              </Link>
            </div>
          </div>

          <div className="px-4 py-2">
            <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sistem</h4>
            <div className="space-y-1">
              <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <Settings size={20} />
                Pengaturan
              </Link>
              <Link href="/admin/audit-log" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <Activity size={20} />
                Audit Log
              </Link>
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors text-left">
            <Globe size={20} />
            Lihat Website
          </Link>
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
