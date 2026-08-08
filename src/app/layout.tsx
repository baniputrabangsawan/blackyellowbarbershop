import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

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
      icon: settings.favicon_url || "/favicon.ico",
      apple: settings.favicon_url || "/favicon.ico",
    },
    alternates: {
      canonical: "/",
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD untuk LocalBusiness & HairSalon Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HairSalon"],
    "name": "Black Yellow Barbershop",
    "image": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop",
    "@id": `${baseUrl}`,
    "url": baseUrl,
    "telephone": "080000000000",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Makassar",
      "addressRegion": "Sulawesi Selatan",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -5.147665,
      "longitude": 119.432731
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
    "priceRange": "$$"
  };

  return (
    <html
      lang="id"
      className={`${inter.variable} ${spaceGrotesk.variable} dark antialiased`}
    >
      <body className="min-h-dvh flex flex-col font-sans bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
