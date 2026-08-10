import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";

import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

import { getPublicSettings } from "@/actions/settings";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://blackyellowbarbershop.com";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const title = settings.seo_title || "Black Yellow Barbershop Makassar | Premium Haircut";
  const description = settings.meta_description || "Lebih dari sekadar pangkas rambut. Black Yellow Barbershop menghadirkan pengalaman premium dengan barber profesional di Makassar.";
  
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${title}`
    },
    description: description,
    keywords: ["Barber Shop Makassar", "Barbershop Makassar", "Tempat Cukur Makassar", "Pangkas Rambut Makassar", "Haircut Makassar", "Barbershop Terdekat", "Barbershop Premium Makassar"],
    authors: [{ name: "Black Yellow Barbershop" }],
    creator: "Black Yellow Barbershop",
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: baseUrl,
      title: title,
      description: description,
      siteName: "Black Yellow Barbershop",
      images: settings.og_image_url ? [{ url: settings.og_image_url, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: settings.og_image_url ? [settings.og_image_url] : [],
    },
    icons: {
      icon: settings.favicon_url || "/brand/blackyellow.svg?v=4",
      apple: settings.favicon_url || "/brand/blackyellow.svg?v=4",
    },
    alternates: {
      canonical: "/",
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();

  // Kumpulkan social media links untuk sameAs
  const sameAs: string[] = [];
  if (settings?.instagram_url) sameAs.push(settings.instagram_url);
  if (settings?.facebook_url) sameAs.push(settings.facebook_url);
  if (settings?.tiktok_url) sameAs.push(settings.tiktok_url);

  // JSON-LD untuk LocalBusiness & HairSalon Schema
  const businessJsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HairSalon"],
    "name": "Black Yellow Barbershop",
    "image": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop",
    "@id": `${baseUrl}/#business`,
    "url": baseUrl,
    ...(settings?.whatsapp || settings?.phone
      ? { "telephone": settings.whatsapp || settings.phone }
      : {}),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": settings?.address || undefined,
      "addressLocality": "Makassar",
      "addressRegion": "Sulawesi Selatan",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -5.147665,
      "longitude": 119.432731
    },
    "areaServed": {
      "@type": "City",
      "name": "Makassar"
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "10:00",
        "closes": "21:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Saturday", "Sunday"],
        "opens": "09:00",
        "closes": "22:00"
      }
    ],
    "priceRange": "$$",
    ...(sameAs.length > 0 ? { "sameAs": sameAs } : {})
  };

  // WebSite schema — membantu Google menampilkan sitelinks
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Black Yellow Barbershop",
    "url": baseUrl
  };

  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} dark antialiased`}
    >
      <body className="min-h-dvh flex flex-col font-sans bg-background text-foreground">
        <SmoothScrollProvider />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
