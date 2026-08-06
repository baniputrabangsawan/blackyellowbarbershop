import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getMembershipPlans } from "@/actions/membership";
import { MembershipForm } from "./membership-form";
import { ShieldCheck, Star, Clock } from "lucide-react";

export const metadata = {
  title: "Membership | Black Yellow Barbershop",
  description: "Bergabunglah menjadi member eksklusif dan nikmati berbagai keuntungan menarik di Black Yellow Barbershop.",
};

export default async function MembershipPage() {
  const plans = await getMembershipPlans();
  
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full bg-background pt-32 pb-24">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="mb-16 text-center">
            <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
              Bergabung Menjadi <span className="text-primary">Member</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
              Dapatkan pengalaman potong rambut yang lebih hemat dan prioritas layanan dengan mendaftar sebagai member Black Yellow Barbershop.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <Star size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Benefit Eksklusif</h3>
              <p className="text-sm text-muted-foreground">Diskon layanan, promo ulang tahun, dan prioritas antrean untuk member setia.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <Clock size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Lebih Cepat</h3>
              <p className="text-sm text-muted-foreground">Proses check-in yang lebih cepat dan mudah di setiap kunjungan tanpa harus mengisi data berulang kali.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="font-bold text-lg mb-2">Aman & Terpercaya</h3>
              <p className="text-sm text-muted-foreground">Data Anda kami simpan dengan aman hanya untuk keperluan operasional dan benefit membership.</p>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            {plans.length === 0 ? (
              <div className="text-center p-8 border border-border rounded-xl bg-surface">
                <p className="text-muted-foreground font-medium">Belum ada paket membership yang tersedia saat ini.</p>
              </div>
            ) : (
              <MembershipForm plans={plans} />
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
