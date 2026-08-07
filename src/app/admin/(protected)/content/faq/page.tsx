import { getFaqs } from "@/actions/admin-faq";
import { FaqClient } from "./faq-client";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Manajemen FAQ - Black Yellow Admin",
};

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manajemen FAQ</h1>
            <p className="text-muted-foreground text-sm">Kelola daftar pertanyaan yang sering diajukan pelanggan.</p>
          </div>
        </div>
      </div>

      <FaqClient initialFaqs={faqs} />
    </div>
  );
}
