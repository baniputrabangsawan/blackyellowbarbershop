"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, CalendarClock, Scissors, Settings, LogOut, ShieldCheck, 
  Menu, X, Home, Image as ImageIcon, MessageSquare, Tag, FileText, Activity 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
      { name: "Membership", href: "/admin/memberships", icon: ShieldCheck },
    ]
  },
  {
    title: "Konten",
    links: [
      { name: "Halaman Utama", href: "/admin/content/homepage", icon: Home },
      { name: "Galeri", href: "/admin/content/gallery", icon: ImageIcon },
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

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="md:hidden p-4 border-b border-border bg-surface-elevated flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsOpen(!isOpen)} className="text-foreground p-1 hover:text-primary transition-colors">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/admin" onClick={() => setIsOpen(false)} className="font-heading font-bold text-primary text-xl">
            BY<span className="text-foreground">Admin</span>
          </Link>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="p-2 bg-white/5 hover:bg-destructive/20 rounded-md">
            <LogOut size={20} className="text-muted-foreground hover:text-destructive" />
          </button>
        </form>
      </header>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[73px] bg-background/80 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[73px] left-0 w-full bg-surface-elevated border-b border-border shadow-xl md:hidden z-40 overflow-hidden"
            >
              <nav className="flex flex-col p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-73px)]">
                {adminGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1">
                    {group.title !== "Dashboard" && (
                      <h4 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-2">
                        {group.title}
                      </h4>
                    )}
                    {group.links.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors ${
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
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
