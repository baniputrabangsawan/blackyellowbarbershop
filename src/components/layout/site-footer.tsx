/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { useRealtimeSettings } from "@/hooks/use-settings";

export function SiteFooter({ settings: initialSettings }: { settings?: any }) {
  const settings = useRealtimeSettings(initialSettings || {});
  return (
    <footer className="bg-surface-elevated pt-20 pb-10 border-t border-border">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-heading text-2xl font-bold uppercase tracking-tight text-primary">
                {settings?.business_name ? (
                  settings.business_name.split(' ').map((word: string, i: number) => 
                    i === 0 ? <span key={i}>{word}</span> : <span key={i} className="text-foreground">{word}</span>
                  )
                ) : (
                  <>Black<span className="text-foreground">Yellow</span></>
                )}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {settings?.brand_tagline || "Potongan presisi dan gaya tanpa kompromi. Pengalaman pangkas rambut terbaik di Makassar."}
            </p>
            <div className="flex gap-4">
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {settings?.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v3a3 3 0 0 1-3-3v11a7 7 0 1 1-7-7z"/></svg>
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-6 uppercase tracking-wider text-sm text-foreground">Menu</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="#services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="#queue" className="hover:text-primary transition-colors">Live Queue</Link></li>
              <li><Link href="#barber" className="hover:text-primary transition-colors">Barber Team</Link></li>
              <li><Link href="#gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link href="#location" className="hover:text-primary transition-colors">Location</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-6 uppercase tracking-wider text-sm text-foreground">Jam Buka</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex justify-between items-center">
                <span>Senin - Jumat</span>
                <span className="text-foreground font-medium">10:00 - 21:00</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Sabtu - Minggu</span>
                <span className="text-foreground font-medium">09:00 - 22:00</span>
              </li>
              <li className="flex justify-between items-center text-primary mt-2">
                <span>Status Saat Ini</span>
                <span className={`font-semibold px-2 py-1 rounded-md ${
                  (() => {
                    const status = (settings?.operational_status || (settings?.is_open === false ? 'Tutup' : 'Buka')).toUpperCase();
                    if (status === 'ANTREAN PENUH' || status === 'TUTUP' || status === 'MAINTENANCE') return "bg-red-500/10 text-red-500";
                    if (status === 'ISTIRAHAT') return "bg-yellow-500/10 text-yellow-500";
                    return "bg-green-500/10 text-green-500";
                  })()
                }`}>
                  {settings?.operational_status || (settings?.is_open === false ? 'Tutup' : 'Buka')}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-6 uppercase tracking-wider text-sm text-foreground">Kontak</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>{settings?.address || "Jl. AP. Pettarani No. 123, Makassar, Sulawesi Selatan"}</span>
              </li>
              {(settings?.phone || settings?.whatsapp) && (
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-primary shrink-0" />
                  <span>{settings.whatsapp || settings.phone}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            <Link href="/admin/login" className="cursor-default select-none focus:outline-none" aria-hidden="true" tabIndex={-1}>
              &copy;
            </Link>{" "}
            {new Date().getFullYear()} {settings?.business_name || "Black Yellow Barbershop"}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
