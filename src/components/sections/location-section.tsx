"use client";
import type { SiteSettings } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { motion } from "motion/react";

export function LocationSection({ settings }: { settings?: SiteSettings }) {
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
                      <h3 className="font-heading font-semibold text-lg mb-3 text-foreground">Alamat Cabang</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium text-foreground text-sm mb-1.5">{settings?.branch_name || "Makassar (Pusat)"}</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {settings?.address || "Jl. AP. Pettarani No. 123, Makassar, Sulawesi Selatan, Indonesia"}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                          <p className="font-medium text-foreground text-sm mb-1.5">Gowa</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Jl. Andi Tonro No.64D, Bonto Bontoa<br />
                            Kec. Somba Opu, Kabupaten Gowa<br />
                            Sulawesi Selatan 92113, Indonesia
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-1 text-foreground">Jam Operasional</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between w-56">
                          <span>Senin - Kamis:</span>
                          <span className="font-medium text-foreground">10:00 - 22:00</span>
                        </div>
                        <div className="flex justify-between w-56">
                          <span>Jumat:</span>
                          <span className="font-medium text-foreground">13:00 - 22:00</span>
                        </div>
                        <div className="flex justify-between w-56">
                          <span>Sabtu - Minggu:</span>
                          <span className="font-medium text-foreground">10:00 - 22:00</span>
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
                        Punya pertanyaan atau kendala? Hubungi {settings?.whatsapp || settings?.phone || "kami"}
                      </p>
                      {settings?.whatsapp && (
                        <Button 
                          className="bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full"
                          onClick={() => window.open(`https://wa.me/${(settings.whatsapp || '').replace(/\D/g, '')}`, '_blank')}
                        >
                          Chat WhatsApp
                        </Button>
                      )}
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
            
            {settings?.maps_url ? (
              <iframe 
                src={settings.maps_url} 
                className="absolute inset-0 w-full h-full opacity-50 grayscale hover:grayscale-0 transition-all duration-500 z-10" 
                style={{border:0}} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4708.67626804175!2d119.50837597937148!3d-5.117271599999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbefbd4556fd6d3%3A0x7c0eec4315e7126e!2sBlack%20Yellow%20Barbershop%20Makassar!5e1!3m2!1sen!2sid!4v1786023141917!5m2!1sen!2sid" 
                className="absolute inset-0 w-full h-full opacity-50 grayscale hover:grayscale-0 transition-all duration-500 z-10" 
                style={{border:0}} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            )}
            
            <div className="absolute bottom-6 right-6 z-20">
              <Button 
                onClick={() => window.open(settings?.maps_url || 'https://www.google.com/maps/search/?api=1&query=Black+Yellow+Barbershop+Makassar', '_blank')}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-xl"
              >
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
