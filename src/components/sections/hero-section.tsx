"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarClock } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useRealtimeSettings } from "@/hooks/use-settings";
import type { SiteSettings } from "@/types";

export function HeroSection({ settings: initialSettings }: { settings?: SiteSettings }) {
  const settings = useRealtimeSettings(initialSettings || ({} as SiteSettings));
  const title = settings?.hero_title || "Potongan Presisi.";
  const subtitle = settings?.hero_subtitle || "Gaya Tanpa Kompromi.";
  const description = settings?.hero_description || "Lebih dari sekadar pangkas rambut. Kami menghadirkan pengalaman premium dengan barber profesional untuk tampilan terbaik Anda.";

  return (
    <section id="hero" className="relative min-h-dvh flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background z-10" />
        <Image
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1080&auto=format&fit=crop"
          alt="Interior Black Yellow Barbershop Makassar - Tempat cukur rambut premium"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="container relative z-20 mx-auto max-w-7xl px-6 md:px-12 flex flex-col items-center md:items-start text-center md:text-left pt-20">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-elevated border border-border mb-6">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              (() => {
                const statusText = settings?.is_open === false ? (settings?.operational_status || 'Tutup') : (settings?.operational_status || 'Buka');
                const status = statusText.toUpperCase();
                if (status === 'ANTREAN PENUH' || status === 'TUTUP' || status === 'MAINTENANCE' || status.includes('TUTUP')) return 'bg-red-500';
                if (status === 'ISTIRAHAT') return 'bg-yellow-500';
                return 'bg-green-500';
              })()
            }`} />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {(() => {
                if (settings?.is_open === false) {
                  if (settings?.operational_status && settings.operational_status.toLowerCase().includes('luar jam')) return 'TUTUP (LUAR JAM)';
                  if (settings?.operational_status && settings.operational_status.toLowerCase() !== 'buka') return settings.operational_status.toUpperCase();
                  return 'TOKO TUTUP';
                }
                
                if (settings?.operational_status && settings.operational_status.toLowerCase() !== 'buka') {
                  return settings.operational_status.toUpperCase();
                }

                const day = new Date().getDay();
                let hours = '10:00 - 22:00';
                if (day === 5) hours = '13:00 - 22:00'; // Jumat
                return `BUKA HARI INI ${hours}`;
              })()}
            </span>
          </div>

          <h1 className="flex flex-col gap-3 mb-6">
            <span className="sr-only">
              Black Yellow Barbershop Makassar
            </span>
            <span className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-foreground leading-[0.85]">
              {title}<br />
              <span className="text-primary/90">{subtitle}</span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="#queue" className={cn(buttonVariants({ size: "lg", variant: "default" }), "w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary-hover px-8 py-6 text-base font-semibold group")}>
                <CalendarClock className="mr-2 h-5 w-5" />
                Ambil Antrean
            </Link>
            <Link href="#services" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full sm:w-auto rounded-full px-8 py-6 text-base font-medium hover:bg-white/5 border-border backdrop-blur-sm")}>
                Lihat Services
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
      <div className="absolute top-1/3 -right-64 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none z-10" />
    </section>
  );
}
