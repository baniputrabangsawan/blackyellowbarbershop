"use client";
import type { Barber } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Scissors, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export function BarberSection({ barbers = [] }: { barbers?: Barber[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(1); // Default for mobile (SSR safe)

  useEffect(() => {
    
    const handleResize = () => {
      const newItemsPerPage = window.innerWidth >= 768 ? 3 : 1;
      setItemsPerPage(newItemsPerPage);
      
      // Pastikan currentIndex tidak melebihi batas jika layar berubah
      const newMaxIndex = Math.max(0, barbers.length - newItemsPerPage);
      setCurrentIndex((prev) => (prev > newMaxIndex ? newMaxIndex : prev));
    };
    
    // Initial check (use timeout to avoid synchronous React state update warning during mount)
    const timeoutId = setTimeout(handleResize, 0);
    
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [barbers.length]);

  const maxIndex = Math.max(0, barbers.length - itemsPerPage);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const showButtons = barbers.length > itemsPerPage;

  if (!barbers || barbers.length === 0) {
    return null; // Tidak tampil jika belum ada barber
  }

  return (
    <section id="barber" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
              Tim <span className="text-primary">Barber</span>
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Bertemu dengan para profesional kami. Setiap barber memiliki keahlian spesifik untuk memastikan Anda mendapatkan gaya terbaik.
            </p>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden w-full -mx-2 px-2 pb-4">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(calc(-${currentIndex} * (100% / ${itemsPerPage})))` }}
          >
            {barbers.map((barber, index) => {
              // Fallback gambar jika tidak ada foto
              const imageUrl = barber.photo_url || "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070&auto=format&fit=crop";
              const specs = barber.specialties || ["Haircut", "Grooming"];
              
              return (
                <motion.div
                  key={barber.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full md:w-1/3 shrink-0 px-4"
                >
                  <Card className="bg-surface border-border overflow-hidden group h-full shadow-lg hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 transition-all duration-300">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                      <Image
                        src={imageUrl}
                        alt={barber.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute bottom-6 left-6 right-6 z-20">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="font-heading text-2xl font-bold text-white mb-1">{barber.name}</h3>
                            {barber.bio && <p className="text-white/70 text-sm line-clamp-1">{barber.bio}</p>}
                          </div>
                          {barber.is_active ? (
                            <Badge className="bg-success/20 text-success border-success/30">Tersedia</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground border-border bg-background/50 backdrop-blur-sm">Off</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground uppercase tracking-wider">
                        <Scissors size={14} className="text-primary" />
                        <span>Spesialisasi</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {specs.map((spec: string, i: number) => (
                          <span key={i} className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border shadow-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tombol Navigasi Bawah */}
        {showButtons && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-14 h-14 rounded-full border border-border bg-surface-elevated flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all disabled:opacity-50 disabled:hover:bg-surface-elevated disabled:hover:text-foreground disabled:hover:border-border disabled:cursor-not-allowed shadow-sm"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={28} />
            </button>
            <button 
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="w-14 h-14 rounded-full border border-border bg-surface-elevated flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all disabled:opacity-50 disabled:hover:bg-surface-elevated disabled:hover:text-foreground disabled:hover:border-border disabled:cursor-not-allowed shadow-sm"
              aria-label="Selanjutnya"
            >
              <ChevronRight size={28} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
