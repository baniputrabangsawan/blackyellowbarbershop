"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { motion } from "motion/react";

export function LocationSection() {
  return (
    <section id="location" className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
            Lokasi & <span className="text-primary">Kontak</span>
          </h2>
          <p className="text-muted-foreground md:text-lg">
            Kunjungi barbershop kami atau hubungi untuk informasi lebih lanjut.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <Card className="bg-surface border-border overflow-hidden">
              <CardContent className="p-8">
                <div className="space-y-8">
                  
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-1 text-foreground">Alamat</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Jl. AP. Pettarani No. 123<br />
                        Kec. Panakkukang, Kota Makassar<br />
                        Sulawesi Selatan 90231
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-1 text-foreground">Jam Operasional</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between w-48">
                          <span>Senin - Jumat:</span>
                          <span className="font-medium text-foreground">10:00 - 21:00</span>
                        </div>
                        <div className="flex justify-between w-48">
                          <span>Sabtu - Minggu:</span>
                          <span className="font-medium text-foreground">09:00 - 22:00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-1 text-foreground">Hubungi Kami</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        Punya pertanyaan atau kendala?
                      </p>
                      <Button className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full">
                        Chat WhatsApp
                      </Button>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 h-[400px] lg:h-auto rounded-xl overflow-hidden border border-border bg-surface-elevated relative group"
          >
            {/* Embedded Google Maps Placeholder */}
            <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center">
              <MapPin size={48} className="text-primary/50 mb-4" />
              <p className="text-muted-foreground font-medium">Peta Interaktif Dimuat Di Sini</p>
            </div>
            
            {/* You can replace this with actual iframe later */}
            <iframe 
              src="https://maps.google.com/maps?q=Makassar,+South+Sulawesi&t=&z=13&ie=UTF8&iwloc=&output=embed" 
              className="absolute inset-0 w-full h-full opacity-50 grayscale hover:grayscale-0 transition-all duration-500 z-10" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            
            <div className="absolute bottom-6 right-6 z-20">
              <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-xl">
                <Navigation className="mr-2 h-4 w-4" />
                Buka di Maps
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
