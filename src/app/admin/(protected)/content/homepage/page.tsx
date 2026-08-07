import { createClient } from "@/lib/supabase/server";
import { HomepageForm } from "./homepage-form";

export const metadata = {
  title: "Konten Halaman Utama - Black Yellow Admin",
};

export default async function HomepageContentPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  return (
    <div className="p-4 md:p-8">
      <HomepageForm initialSettings={settings} />
    </div>
  );
}
