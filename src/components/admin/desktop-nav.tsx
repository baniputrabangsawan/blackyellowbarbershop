"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, CalendarClock, Scissors, Settings, LogOut,
  Home, Image as ImageIcon, MessageSquare, Tag, Activity, Globe
} from "lucide-react";
import { logoutAction } from "@/app/admin/login/actions";

const adminGroups = [
  {
    title: "Dashboard",
    links: [
      { name: "Antrean Hari Ini", href: "/admin", icon: CalendarClock },
    ]
  },
  {
    title: "Operasional",
    links: [
      { name: "Layanan", href: "/admin/services", icon: Scissors },
      { name: "Barber", href: "/admin/barbers", icon: Users },
    ]
  },
  {
    title: "Konten",
    links: [
      { name: "Halaman Utama", href: "/admin/content/homepage", icon: Home },
      { name: "Galeri", href: "/admin/content/gallery", icon: ImageIcon },
      { name: "Testimonial", href: "/admin/content/testimonial", icon: MessageSquare },
      { name: "FAQ", href: "/admin/content/faq", icon: MessageSquare },
      { name: "Promo", href: "/admin/content/promo", icon: Tag },
    ]
  },
  {
    title: "Sistem",
    links: [
      { name: "Pengaturan", href: "/admin/settings", icon: Settings },
      { name: "Audit Log", href: "/admin/audit-log", icon: Activity },
    ]
  }
];

export function AdminDesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface-elevated border-r border-border hidden md:flex flex-col h-full">
      <div className="p-6 border-b border-border shrink-0">
        <Link href="/admin" className="font-heading text-xl font-bold uppercase tracking-tight text-primary">
          Black<span className="text-foreground">Yellow</span> <span className="text-muted-foreground text-sm">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {adminGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            {group.title !== "Dashboard" && (
              <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.title}
              </h4>
            )}
            <div className="space-y-1">
              {group.links.map((link) => {
                const Icon = link.icon;
                // Special check for Dashboard to avoid matching all sub-routes if not careful,
                // but exact match is fine here.
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-medium transition-colors ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <Icon size={20} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-border space-y-2 shrink-0">
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
  );
}
