import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-surface-elevated pt-20 pb-10 border-t border-border">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-heading text-2xl font-bold uppercase tracking-tight text-primary">
                Black<span className="text-foreground">Yellow</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Potongan presisi dan gaya tanpa kompromi. Kami hadir untuk memberikan pengalaman pangkas rambut terbaik di kota Anda.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
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
                <span className="font-semibold bg-primary/10 px-2 py-1 rounded-md">Buka</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-6 uppercase tracking-wider text-sm text-foreground">Kontak</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>Jl. AP. Pettarani No. 123, Makassar, Sulawesi Selatan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Black Yellow Barbershop. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
