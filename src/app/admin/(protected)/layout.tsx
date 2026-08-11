import { ReactNode } from "react";
import Link from "next/link";
import { 
  Users, CalendarClock, Scissors, Settings, LogOut,
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
              <Link href="/admin/content/testimonial" className="flex items-center gap-3 px-4 py-2.5 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors">
                <MessageSquare size={20} />
                Testimonial
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
