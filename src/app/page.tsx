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

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Jalankan semua query database secara paralel, bukan berurutan
  // Ini memotong waktu tunggu server dari ~800ms menjadi ~200ms
  const [settings, galleries, faqs, promos] = await Promise.all([
    getPublicSettings(),
    getPublicGalleries(),
    getPublicFaqs(),
    getPublicPromos(),
  ]);

  return (
    <>
      <RealtimeRefresh />
      <PromoBanner key={promos[0]?.id || 'none'} promos={promos} />
      <SiteHeader settings={settings} />
      <main className="flex w-full flex-1 flex-col">
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
