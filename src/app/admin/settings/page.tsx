import { getAdminSettings } from "@/actions/admin-settings";
import { AdminSettingsClient } from "./admin-settings-client";
import { Settings } from "lucide-react";

export const metadata = {
  title: "Pengaturan Sistem | Admin",
};

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pengaturan Sistem</h1>
          <p className="text-muted-foreground text-sm">Kelola pengaturan cabang, antrean, dan konten publik</p>
        </div>
      </div>

      <AdminSettingsClient initialSettings={settings} />
    </div>
  );
}
