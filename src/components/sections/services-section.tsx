"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Clock } from "lucide-react";

type ServiceItem = {
  name: string;
  desc: string;
  price: string;
  duration: string;
  popular?: boolean;
};

const servicesData: Record<string, ServiceItem[]> = {
  haircut: [
    { name: "Black Cut", desc: "Potongan rambut presisi dengan konsultasi gaya, cuci, dan styling pomade.", price: "Rp 60.000", duration: "45 Menit", popular: true },
    { name: "Student Cut", desc: "Potongan rapi khusus pelajar dengan menunjukkan kartu pelajar aktif.", price: "Rp 45.000", duration: "30 Menit" },
    { name: "Kids Cut", desc: "Pangkas rambut anak-anak (di bawah 12 tahun) dengan perlakuan khusus.", price: "Rp 50.000", duration: "45 Menit" },
  ],
  grooming: [
    { name: "Yellow Grooming", desc: "Cukur kumis/jenggot lengkap dengan hot towel dan pijat ringan.", price: "Rp 40.000", duration: "30 Menit" },
    { name: "Hair Wash & Styling", desc: "Cuci rambut premium, tonik, dan styling dengan pomade pilihan.", price: "Rp 35.000", duration: "20 Menit" },
    { name: "Hair Color", desc: "Pewarnaan rambut dasar (hitam/cokelat gelap).", price: "Mulai Rp 150.000", duration: "90 Menit" },
  ],
  package: [
    { name: "Signature Package", desc: "Kombinasi Black Cut & Yellow Grooming untuk tampilan maksimal.", price: "Rp 90.000", duration: "75 Menit", popular: true },
    { name: "Father & Son", desc: "Paket potong rambut ayah dan anak di waktu yang bersamaan.", price: "Rp 100.000", duration: "45 Menit" },
  ]
};

const ServiceCard = ({ service, index }: { service: ServiceItem, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
  >
    <Card className="bg-surface border-border overflow-hidden h-full group hover:border-primary/50 transition-colors">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-1">{service.name}</h3>
            {service.popular && <Badge variant="default" className="bg-primary text-primary-foreground text-xs uppercase tracking-wider mb-2">Terpopuler</Badge>}
          </div>
          <div className="text-primary font-bold whitespace-nowrap">{service.price}</div>
        </div>
        <p className="text-muted-foreground text-sm mb-6 flex-grow">{service.desc}</p>
        <div className="flex items-center text-xs text-muted-foreground font-medium pt-4 border-t border-border/50">
          <Clock className="w-4 h-4 mr-2" />
          Estimasi {service.duration}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export function ServicesSection() {
  const [activeTab, setActiveTab] = useState("haircut");

  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
            Layanan <span className="text-primary">Kami</span>
          </h2>
          <p className="text-muted-foreground md:text-lg">
            Pilih layanan yang sesuai dengan kebutuhan Anda. Harga dan durasi tertera adalah estimasi dasar.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-surface-elevated border border-border p-1 relative">
              <TabsTrigger value="haircut" className="relative data-[state=active]:text-primary-foreground data-[state=active]:bg-transparent px-6 py-2 rounded-md font-medium transition-colors">
                {activeTab === "haircut" && (
                  <motion.div layoutId="activeTabIndicator" className="absolute inset-0 bg-primary rounded-md" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">Haircut</span>
              </TabsTrigger>
              <TabsTrigger value="grooming" className="relative data-[state=active]:text-primary-foreground data-[state=active]:bg-transparent px-6 py-2 rounded-md font-medium transition-colors">
                {activeTab === "grooming" && (
                  <motion.div layoutId="activeTabIndicator" className="absolute inset-0 bg-primary rounded-md" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">Grooming</span>
              </TabsTrigger>
              <TabsTrigger value="package" className="relative data-[state=active]:text-primary-foreground data-[state=active]:bg-transparent px-6 py-2 rounded-md font-medium transition-colors">
                {activeTab === "package" && (
                  <motion.div layoutId="activeTabIndicator" className="absolute inset-0 bg-primary rounded-md" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">Package</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-hidden relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-full"
              >
                <TabsContent value={activeTab} className="mt-0 outline-none w-full data-[state=inactive]:hidden block">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {servicesData[activeTab]?.map((service, idx) => (
                      <ServiceCard key={idx} service={service} index={idx} />
                    ))}
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
