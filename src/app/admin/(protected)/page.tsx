import { getTodayQueues } from "@/actions/admin-queue";
import { getQueueOptions } from "@/actions/queue";
import { AdminQueueClient } from "./admin-queue-client";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { branchId } = await verifyAdmin();
  const queues = await getTodayQueues();
  const options = await getQueueOptions();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground mb-2">Antrean Hari Ini</h1>
          <p className="text-muted-foreground">Kelola antrean pelanggan secara realtime.</p>
        </div>
      </div>

      <AdminQueueClient initialQueues={queues} options={options} userBranchId={branchId} />
    </div>
  );
}
