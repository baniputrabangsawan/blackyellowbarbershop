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

export const metadata: Metadata = {
  title: "Black Yellow Barbershop",
  description: "Potongan Presisi. Gaya Tanpa Kompromi.",
};

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
