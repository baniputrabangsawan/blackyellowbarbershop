import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { QueuePreviewSection } from "@/components/sections/queue-preview-section";
import { BarberSection } from "@/components/sections/barber-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { LocationSection } from "@/components/sections/location-section";
import { FaqSection } from "@/components/sections/faq-section";
import { getPublicSettings } from "@/actions/settings";

export default async function Home() {
  const settings = await getPublicSettings();

  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full flex flex-col">
        <HeroSection settings={settings} />
        <ServicesSection />
        <QueuePreviewSection />
        <BarberSection />
        <GallerySection />
        <LocationSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
