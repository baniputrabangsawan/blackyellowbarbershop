/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRealtimeSettings } from "@/hooks/use-settings";

const navLinks = [
  { name: "Beranda", href: "/#hero" },
  { name: "Services", href: "/#services" },
  { name: "Live Queue", href: "/#queue" },
  { name: "Barber", href: "/#barber" },
  { name: "Gallery", href: "/#gallery" },
  { name: "Membership", href: "/membership" },
  { name: "Lokasi", href: "/#location" },
];

export function SiteHeader({ settings: initialSettings }: { settings?: any }) {
  const settings = useRealtimeSettings(initialSettings || {});
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const scrolledRef = React.useRef(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const nextScrolled = window.scrollY > 50;
      if (nextScrolled === scrolledRef.current) return;

      scrolledRef.current = nextScrolled;
      setScrolled(nextScrolled);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-background/95 border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto max-w-7xl px-6 md:px-12 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={settings?.business_name || "Logo"} className="h-8 w-auto" />
          ) : (
            <span className="font-heading text-xl font-bold uppercase tracking-tight text-primary">
              {settings?.business_name ? (
                // Pisahkan kata pertama (misal Black) dan sisanya
                settings.business_name.split(' ').map((word: string, i: number) => 
                  i === 0 ? <span key={i}>{word}</span> : <span key={i} className="text-foreground">{word}</span>
                )
              ) : (
                <>Black<span className="text-foreground">Yellow</span></>
              )}
            </span>
          )}
        </Link>
        
        {settings && typeof settings.is_open !== 'undefined' && (
          <div className="hidden md:flex ml-4 mr-auto items-center">
            <span className={cn(
              "text-xs font-bold px-2 py-1 rounded-md border uppercase tracking-wider",
              (() => {
                const statusText = settings.is_open === false ? 'Tutup' : (settings.operational_status || 'Buka');
                const status = statusText.toUpperCase();
                if (status === 'ANTREAN PENUH' || status === 'TUTUP' || status === 'MAINTENANCE') return "bg-red-500/10 text-red-500 border-red-500/20";
                if (status === 'ISTIRAHAT') return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                return "bg-green-500/10 text-green-500 border-green-500/20";
              })()
            )}>
              {settings.is_open === false ? 'TUTUP' : (settings.operational_status || 'BUKA').toUpperCase()}
            </span>
          </div>
        )}

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group py-2"
            >
              {link.name}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
            </Link>
          ))}
          <Link href="/queue" className={cn(buttonVariants({ variant: "default" }), "rounded-full bg-primary text-primary-foreground hover:bg-primary-hover px-6")}>
            Ambil Antrean
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100vh - 5rem)" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-20 left-0 w-full bg-primary shadow-lg md:hidden overflow-hidden"
          >
            <nav className="flex flex-col items-center pt-12 p-6 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-bold text-primary-foreground hover:text-background transition-colors text-center"
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/queue" onClick={() => setIsOpen(false)} className={cn(buttonVariants({ variant: "outline" }), "mt-8 w-3/4 max-w-[250px] rounded-full bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary")}>
                Ambil Antrean
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
