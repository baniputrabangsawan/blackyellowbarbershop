"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MessageSquareQuote } from "lucide-react";

export interface Testimonial {
  id?: string;
  name: string;
  content: string;
  rating: number;
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  // Bagi dua baris (atas dan bawah)
  const half = Math.ceil(testimonials.length / 2);
  const row1 = testimonials.slice(0, half);
  const row2 = testimonials.slice(half);  

  // Fungsi untuk menggandakan array agar cukup panjang menutupi layar besar (menghindari ruang kosong)
  const getDuplicatedArray = (arr: Testimonial[], minLength: number = 20) => {
    if (arr.length === 0) return [];
    let result: Testimonial[] = [];
    while (result.length < minLength) {
      result = [...result, ...arr];
    }
    // Return array yang digandakan agar bagian kiri dan kanan (50%) identik sempurna saat di-loop
    return [...result, ...result];
  };

  const row1Duplicated = getDuplicatedArray(row1);
  const row2Duplicated = getDuplicatedArray(row2.length > 0 ? row2 : row1);

  const TestimonialCard = ({ item }: { item: Testimonial }) => (
    <Card className="bg-surface-elevated border-border w-[300px] shrink-0 mx-3">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <MessageSquareQuote className="text-primary w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">{item.name}</p>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < item.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground italic leading-relaxed">&quot;{item.content}&quot;</p>
      </CardContent>
    </Card>
  );

  return (
    <section className="py-20 bg-background overflow-hidden border-y border-border/50 relative">
      <div className="container px-4 md:px-6 mx-auto mb-12">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-heading text-foreground">
            Apa Kata <span className="text-primary">Mereka</span>
          </h2>
          <p className="text-muted-foreground md:text-lg">
            Kepuasan pelanggan adalah prioritas utama kami. Berikut adalah pengalaman mereka yang telah membuktikan kualitas layanan kami.
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative flex flex-col gap-6 w-full overflow-hidden">
        {/* Row 1 - Ke Kanan */}
        <div className="flex w-max relative">
          <motion.div
            className="flex"
            animate={{ x: ["-50%", "0%"] }}
            transition={{
              ease: "linear",
              duration: 80, // Diperlambat agar mudah dibaca
              repeat: Infinity,
            }}
          >
            {row1Duplicated.map((item, index) => (
              <TestimonialCard key={`r1-${index}`} item={item} />
            ))}
          </motion.div>
        </div>

        {/* Row 2 - Ke Kiri */}
        <div className="flex w-max relative">
          <motion.div
            className="flex"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 90, // Diperlambat tapi tetap sedikit berbeda dengan baris atas
              repeat: Infinity,
            }}
          >
            {row2Duplicated.map((item, index) => (
              <TestimonialCard key={`r2-${index}`} item={item} />
            ))}
          </motion.div>
        </div>
        
        {/* Gradient overlays for smooth fading edges */}
        <div className="absolute top-0 left-0 w-24 md:w-48 h-full bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-24 md:w-48 h-full bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
