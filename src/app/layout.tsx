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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: settings.seo_title || "Black Yellow Barbershop",
    description: settings.meta_description || "Potongan Presisi. Gaya Tanpa Kompromi.",
    openGraph: {
      title: settings.seo_title || "Black Yellow Barbershop",
      description: settings.meta_description || "Potongan Presisi. Gaya Tanpa Kompromi.",
      images: settings.og_image_url ? [settings.og_image_url] : [],
    },
    icons: {
      icon: settings.favicon_url || "/favicon.ico",
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${spaceGrotesk.variable} dark antialiased`}
    >
      <body className="min-h-dvh flex flex-col font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
