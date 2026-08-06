import { ReactNode } from "react";
import Link from "next/link";
import { Users, CalendarClock, Scissors, Settings, LogOut, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard | Black Yellow Barbershop",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  // In a full implementation, we'd check Supabase Auth session here and redirect to /admin/login if not logged in.
  // For MVP, we'll assume they are logged in if they reach this page.

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
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors text-left">
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <header className="md:hidden p-4 border-b border-border bg-surface-elevated flex justify-between items-center">
          <span className="font-heading font-bold text-primary">BY<span className="text-foreground">Admin</span></span>
          <button className="p-2 bg-white/5 rounded-md"><LogOut size={20} className="text-muted-foreground" /></button>
        </header>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
