import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Pengaturan Sistem - Black Yellow Admin",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  // Ambil data konfigurasi
  const { data: settings, error } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <h2 className="text-xl font-bold mb-2">Gagal Memuat Konfigurasi</h2>
        <p>Pastikan Anda telah menjalankan script SQL Migrasi Database (admin_system_migration.sql). Error: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <SettingsForm initialData={settings} />
    </div>
  );
}
