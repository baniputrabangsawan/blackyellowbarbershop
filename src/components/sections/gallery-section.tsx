"use client";
import type { GalleryItem } from "@/types";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function GallerySection({ galleries = [] }: { galleries?: GalleryItem[] }) {
  // Jika tidak ada data dari props, bisa tampilkan fallback statis atau kosong
  const displayGalleries = galleries.length > 0 ? galleries : [];

  if (displayGalleries.length === 0) return null; // Sembunyikan section jika belum ada galeri
  
  return (
    <section id="gallery" className="py-24 bg-surface-elevated border-y border-border overflow-hidden">
      <div className="container mx-auto max-w-7xl px-6 md:px-12 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
              Galeri <span className="text-primary">Karya</span>
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Suasana barbershop dan hasil pangkasan terbaik dari tim kami. Kunjungi Instagram kami untuk melihat lebih banyak.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 border-border hover:bg-white/5 rounded-full px-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            Follow @blackyellow
          </Button>
        </div>
      </div>

      <div className="w-full px-2 md:px-6">
        <div className="columns-2 md:columns-3 gap-4 space-y-4 max-w-[1600px] mx-auto">
          {displayGalleries.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="relative rounded-xl overflow-hidden group break-inside-avoid"
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-end p-4">
                {item.title && <p className="text-white font-medium text-sm translate-y-4 group-hover:translate-y-0 transition-transform">{item.title}</p>}
                {item.category && <p className="text-white/80 text-xs translate-y-4 group-hover:translate-y-0 transition-transform delay-75">{item.category}</p>}
              </div>
              <div className="relative aspect-square w-full bg-muted">
                <Image
                  src={item.image_url}
                  alt={item.title || `Gallery image ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover rounded-xl transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
