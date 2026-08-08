import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { QueuePreviewSection } from "@/components/sections/queue-preview-section";
import { BarberSection } from "@/components/sections/barber-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { LocationSection } from "@/components/sections/location-section";
import { FaqSection } from "@/components/sections/faq-section";
import { getPublicSettings, getPublicGalleries, getPublicFaqs, getPublicPromos } from "@/actions/settings";
import { PromoBanner } from "@/components/sections/promo-banner";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export default async function Home() {
  const settings = await getPublicSettings();
  const galleries = await getPublicGalleries();
  const faqs = await getPublicFaqs();
  const promos = await getPublicPromos();

  return (
    <>
      <RealtimeRefresh />
      <PromoBanner key={promos[0]?.id || 'none'} promos={promos} />
      <SiteHeader settings={settings} />
      <main className="flex-1 w-full flex flex-col">
        <HeroSection settings={settings} />
        <ServicesSection />
        <QueuePreviewSection />
        <BarberSection />
        <GallerySection galleries={galleries} />
        <LocationSection settings={settings} />
        <FaqSection faqs={faqs} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
