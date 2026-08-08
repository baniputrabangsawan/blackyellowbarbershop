/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { ArrowRight, TicketPercent, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export function PromoBanner({ promos }: { promos: any[] }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!promos || promos.length === 0) return null;
  
  // Ambil promo pertama yang aktif
  const promo = promos[0];
  
  // Format tanggal berakhir (jika ada)
  const endDateFormatted = promo.end_date 
    ? new Date(promo.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, y: 50 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 max-w-[320px] w-[calc(100%-3rem)] bg-primary text-primary-foreground rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="relative p-5">
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors rounded-full hover:bg-black/10"
              aria-label="Tutup Promo"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3 mb-3 pt-1">
              <div className="bg-black/10 p-2 rounded-lg shrink-0 mt-0.5">
                <TicketPercent className="w-5 h-5" />
              </div>
              <div className="pr-4">
                <h4 className="font-bold font-heading text-base leading-tight mb-1">{promo.title}</h4>
                {promo.description && (
                  <p className="text-sm opacity-90 line-clamp-2 leading-relaxed">{promo.description}</p>
                )}
                {endDateFormatted && (
                  <div className="mt-2 text-xs font-medium bg-black/10 inline-block px-2 py-1 rounded-md">
                    Berlaku s/d {endDateFormatted}
                  </div>
                )}
              </div>
            </div>

            {(promo.cta_url || promo.cta_text) && (
              <Link 
                href={promo.cta_url || "#"} 
                className="flex items-center justify-center w-full bg-foreground text-background py-2.5 rounded-lg font-bold text-sm hover:bg-foreground/90 transition-colors group mt-4"
              >
                {promo.cta_text || "Lihat Promo"}
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
