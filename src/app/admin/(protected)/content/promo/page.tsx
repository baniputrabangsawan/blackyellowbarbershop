import { getPromos } from "@/actions/admin-promo";
import { PromoClient } from "./promo-client";
import { Tag } from "lucide-react";

export const metadata = {
  title: "Manajemen Promo - Black Yellow Admin",
};

export const dynamic = "force-dynamic";

export default async function PromoPage() {
  const promos = await getPromos();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Tag size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen Promo & Banner</h1>
            <p className="text-muted-foreground text-sm">Buat dan jadwalkan banner pengumuman atau promo diskon.</p>
          </div>
        </div>
      </div>

      <PromoClient initialPromos={promos} />
    </div>
  );
}
