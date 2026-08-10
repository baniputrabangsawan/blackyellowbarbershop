import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getQueueOptions, getStoreQueueState } from "@/actions/queue";
import { QueueForm } from "./queue-form";

export const metadata = {
  title: "Ambil Antrean Online | Black Yellow Barbershop Makassar",
  description: "Daftar antrean online di Black Yellow Barbershop Makassar. Hemat waktu, pantau giliran secara realtime dari ponsel Anda.",
};

export default async function QueuePage({ 
  searchParams 
}: { 
  searchParams?: { [key: string]: string | string[] | undefined } 
}) {
  // Dalam Next.js versi terbaru, mungkin berupa promise, kita tangani secara dinamis
  const sp = await searchParams;
  const initialServiceSlug = typeof sp?.service === 'string' ? sp.service : undefined;

  const options = await getQueueOptions();
  let storeState = 'offline';
  
  if (options.branches.length > 0) {
    storeState = await getStoreQueueState(options.branches[0].id);
  }
  
  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full bg-background pt-32 pb-24">
        <div className="container mx-auto max-w-2xl px-6">
          <div className="mb-10 text-center">
            <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-4">
              Ambil <span className="text-primary">Antrean</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Isi data di bawah ini untuk mengambil nomor antrean. Anda dapat memantau estimasi giliran secara realtime.
            </p>
          </div>
          
          {options.branches.length === 0 ? (
            <div className="text-center p-8 border border-border rounded-xl bg-surface">
              <p className="text-destructive font-medium">Sistem antrean saat ini tidak tersedia.</p>
              <p className="text-sm text-muted-foreground mt-2">Silakan hubungi kasir atau coba lagi nanti.</p>
            </div>
          ) : storeState !== 'open' ? (
            <div className="text-center p-12 border border-destructive/20 rounded-xl bg-destructive/5">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4 text-destructive">
                <span className="text-2xl">🛑</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-destructive">Pendaftaran Ditutup</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {storeState === 'closed' 
                  ? "Mohon maaf, pendaftaran antrean saat ini sedang ditutup atau toko sudah penuh. Silakan coba lagi besok atau kunjungi kami langsung."
                  : "Gagal terhubung ke sistem antrean. Silakan coba beberapa saat lagi."}
              </p>
            </div>
          ) : (
            <QueueForm options={options} initialServiceSlug={initialServiceSlug} />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
