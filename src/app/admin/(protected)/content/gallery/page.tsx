import { getGalleries } from "@/actions/admin-gallery";
import { GalleryClient } from "./gallery-client";
import { ImageIcon } from "lucide-react";

export const metadata = {
  title: "Manajemen Galeri - Black Yellow Admin",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const galleries = await getGalleries();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ImageIcon size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen Galeri</h1>
            <p className="text-muted-foreground text-sm">Kelola foto portofolio dan hasil potongan rambut.</p>
          </div>
        </div>
      </div>

      <GalleryClient initialGalleries={galleries} />
    </div>
  );
}
