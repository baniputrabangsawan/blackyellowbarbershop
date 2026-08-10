"use client";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowRight, Check, Clock } from "lucide-react";
import Link from "next/link";

type ServiceItem = {
  slug: string;
  name: string;
  desc?: string;
  price: string;
  duration?: string;
  features?: string[];
  popular?: boolean;
};

const coreCutBenefits = [
  "Layanan Cukur Rambut",
  "Keramas / Cuci Rambut",
  "Hairtonic",
  "Hair Styling",
];

const servicesData: Record<string, ServiceItem[]> = {
  package: [
    { slug: "junior-cuts", name: "Junior Cuts", price: "Rp35.000", features: [...coreCutBenefits] },
    { slug: "bronze-cuts", name: "Bronze Cuts", price: "Rp40.000", features: [...coreCutBenefits] },
    { slug: "silver-cuts", name: "Silver Cuts", price: "Rp45.000", features: [...coreCutBenefits, "Handuk Hangat"] },
    { slug: "gold-cuts", name: "Gold Cuts", price: "Rp50.000", features: [...coreCutBenefits, "Handuk Hangat", "Pijat Ringan"] },
    { slug: "premium-cuts", name: "Premium Cuts", price: "Rp60.000", features: [...coreCutBenefits, "Handuk Hangat", "Pijat Ringan", "Vacuum Komedo"], popular: true },
  ]
};

const ServiceCard = ({
  service,
  index,
  isPackage,
}: {
  service: ServiceItem;
  index: number;
  isPackage: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: Math.min(index * 0.06, 0.24), duration: 0.4 }}
    className={`h-full ${
      isPackage ? "xl:col-span-2" : ""
    } ${
      isPackage && index === 3 ? "xl:col-start-2" : ""
    } ${
      isPackage && index === 4
        ? "md:col-span-2 md:mx-auto md:w-[calc(50%-0.75rem)] xl:col-span-2 xl:mx-0 xl:w-auto"
        : ""
    }`}
  >
    <Card
      className={`group relative h-full gap-0 overflow-hidden border bg-surface py-0 ring-0 transition-all duration-500 ease-out motion-reduce:transition-none md:hover:-translate-y-1.5 md:hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] ${
        service.popular
          ? "border-primary/60 md:hover:border-primary"
          : "border-border md:hover:border-primary/50"
      }`}
    >
      <div
        aria-hidden="true"
        className={`h-1 w-full ${service.popular ? "bg-primary" : "bg-border"}`}
      />
      <CardContent className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="border-b border-border/80 pb-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {service.name}
            </h3>
            {service.popular && (
              <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                {isPackage ? "Terlengkap" : "Terpopuler"}
              </span>
            )}
          </div>
          <p className="mt-5 font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {service.price}
          </p>
        </div>

        <div className="flex flex-1 flex-col py-6">
          {service.features ? (
            <>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Termasuk dalam paket
              </p>
              <ul className="space-y-3.5" aria-label={`Benefit ${service.name}`}>
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-foreground/90">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <p className="flex-1 text-sm leading-6 text-muted-foreground">{service.desc}</p>
              {service.duration && (
                <div className="mt-6 flex items-center border-t border-border/70 pt-5 text-xs font-medium text-muted-foreground">
                  <Clock className="mr-2 size-4 text-primary" aria-hidden="true" />
                  Estimasi {service.duration}
                </div>
              )}
            </>
          )}
        </div>

        <Link
          href={`/queue?service=${service.slug}`}
          className={buttonVariants({
            variant: service.popular ? "default" : "outline",
            size: "lg",
            className: "mt-auto w-full rounded-full",
          })}
          aria-label={`${isPackage ? "Pilih paket" : "Pilih layanan"} ${service.name}`}
        >
          {isPackage ? "Pilih Paket" : "Pilih Layanan"}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  </motion.div>
);

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
            Layanan <span className="text-primary">Kami</span>
          </h2>
          <p className="text-muted-foreground md:text-lg">
            Pilih paket layanan yang sesuai dengan kebutuhan Anda.
          </p>
        </div>

        <div className="relative min-h-[400px]">
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-6">
            {servicesData.package?.map((service, idx) => (
              <ServiceCard
                key={service.name}
                service={service}
                index={idx}
                isPackage={true}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
