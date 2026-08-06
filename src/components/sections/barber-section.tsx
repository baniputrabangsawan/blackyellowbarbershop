"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Scissors } from "lucide-react";
import Image from "next/image";

const barbers = [
  {
    name: "Ahmad",
    specialties: ["Classic Cut", "Fading", "Hair Color"],
    experience: "5 Tahun",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=2070&auto=format&fit=crop",
    available: true
  },
  {
    name: "Rizky",
    specialties: ["Modern Textures", "Beard Grooming"],
    experience: "3 Tahun",
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1976&auto=format&fit=crop",
    available: true
  },
  {
    name: "Budi",
    specialties: ["Kid's Cut", "Hair Tattoo"],
    experience: "4 Tahun",
    image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=1974&auto=format&fit=crop",
    available: false
  }
];

export function BarberSection() {
  return (
    <section id="barber" className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
              Tim <span className="text-primary">Barber</span>
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Bertemu dengan para profesional kami. Setiap barber memiliki keahlian spesifik untuk memastikan Anda mendapatkan gaya terbaik.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="bg-surface border-border overflow-hidden group">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <Image
                    src={barber.image}
                    alt={barber.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-6 left-6 right-6 z-20">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="font-heading text-2xl font-bold text-white mb-1">{barber.name}</h3>
                        <p className="text-white/70 text-sm">{barber.experience} Pengalaman</p>
                      </div>
                      {barber.available ? (
                        <Badge className="bg-success/20 text-success hover:bg-success/30 border-success/30">Tersedia</Badge>
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
                    {barber.specialties.map((spec, i) => (
                      <span key={i} className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
                        {spec}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
