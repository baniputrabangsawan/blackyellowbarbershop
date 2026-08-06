"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const galleryImages = [
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532710093739-9470ac1d4d5b?q=80&w=2070&auto=format&fit=crop"
];

export function GallerySection() {
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
          {galleryImages.map((src, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="relative rounded-xl overflow-hidden group break-inside-avoid"
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              <div className="relative aspect-square w-full">
                <Image
                  src={src}
                  alt={`Gallery image ${idx + 1}`}
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
