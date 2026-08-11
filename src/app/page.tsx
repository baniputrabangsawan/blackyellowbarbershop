import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { QueuePreviewSection } from "@/components/sections/queue-preview-section";
import { BarberSection } from "@/components/sections/barber-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { LocationSection } from "@/components/sections/location-section";
import { FaqSection } from "@/components/sections/faq-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { getPublicSettings, getPublicGalleries, getPublicFaqs, getPublicPromos, getPublicBarbers, getPublicTestimonials } from "@/actions/settings";
import { getPublicQueueStatuses } from "@/actions/queue";
import { PromoBanner } from "@/components/sections/promo-banner";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Supabase returns objects with a null prototype (Object.create(null)). 
  // Passing them directly to Client Components throws React Error 441.
  // We sanitize them by serializing and deserializing.
  const [
    rawSettings, rawGalleries, rawFaqs, rawPromos, rawBarbers, rawTestimonials, rawQueueStatuses
  ] = await Promise.all([
    getPublicSettings(),
    getPublicGalleries(),
    getPublicFaqs(),
    getPublicPromos(),
    getPublicBarbers(),
    getPublicTestimonials(),
    getPublicQueueStatuses(),
  ]);

  const sanitize = <T,>(data: T): T => data === undefined ? data : JSON.parse(JSON.stringify(data));
  const settings = sanitize(rawSettings);
  const galleries = sanitize(rawGalleries);
  const faqs = sanitize(rawFaqs);
  const promos = sanitize(rawPromos);
  const barbers = sanitize(rawBarbers);
  const testimonials = sanitize(rawTestimonials);
  const queueStatuses = sanitize(rawQueueStatuses);

  return (
    <>
      <RealtimeRefresh />
      <PromoBanner key={promos[0]?.id || 'none'} promos={promos} />
      <SiteHeader settings={settings} />
      <main className="flex w-full flex-1 flex-col">
        <HeroSection settings={settings} />
        <ServicesSection />
        <QueuePreviewSection settings={settings} initialStatuses={queueStatuses} />
        <BarberSection barbers={barbers} />
        <GallerySection galleries={galleries} />
        <TestimonialsSection testimonials={testimonials} />
        <LocationSection settings={settings} />
        <FaqSection faqs={faqs} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
