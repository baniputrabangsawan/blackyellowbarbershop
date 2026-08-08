import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Activity } from "lucide-react";

type AuditLog = {
  id: string;
  created_at: string;
  admin_user_id: string;
  action: string;
  entity_type: string;
  metadata: Record<string, unknown> | null;
};

export const metadata = {
  title: "Audit Log Sistem - Black Yellow Admin",
};

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const supabase = await createClient();

  // Ambil 50 log terbaru
  const { data: logs, error } = await supabase
    .from("admin_activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Activity size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log Sistem</h1>
          <p className="text-muted-foreground text-sm">Rekam jejak aktivitas penting yang dilakukan oleh admin.</p>
        </div>
      </div>

      <Card className="bg-surface border-border overflow-hidden">
        <CardHeader>
          <CardTitle>Riwayat Aktivitas Terbaru</CardTitle>
          <CardDescription>Menampilkan maksimal 50 aktivitas terakhir.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-elevated text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Waktu</th>
                  <th className="px-6 py-4 font-medium">Admin ID</th>
                  <th className="px-6 py-4 font-medium">Aksi</th>
                  <th className="px-6 py-4 font-medium">Tujuan Data</th>
                  <th className="px-6 py-4 font-medium">Keterangan Khusus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {error && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-destructive">
                      Gagal memuat log aktivitas. {error.message}
                    </td>
                  </tr>
                )}
                
                {!error && logs && logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      Belum ada aktivitas admin yang tercatat.
                    </td>
                  </tr>
                )}
                
                {!error && logs && (logs as AuditLog[]).map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {format(new Date(log.created_at), "dd MMM yyyy, HH:mm")}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {log.admin_user_id.split("-")[0]}...
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {log.entity_type}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {log.metadata ? (
                        <div className="max-w-[200px] md:max-w-md truncate" title={JSON.stringify(log.metadata)}>
                          {JSON.stringify(log.metadata)}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
