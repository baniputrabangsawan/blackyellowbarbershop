import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { QueueTicketClient } from "./queue-ticket-client";

export const metadata = {
  title: "Tiket Antrean | Black Yellow Barbershop",
};

export default async function QueueTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const supabase = await createClient();

  const { data: queue, error } = await supabase
    .from("queues")
    .select(`
      *,
      branches ( name ),
      services ( name, duration_minutes ),
      barbers ( name )
    `)
    .eq("id", id)
    .single();

  if (error || !queue) {
    notFound();
  }

  // Get waiting count for this branch before this queue
  const { count: waitingCount } = await supabase
    .from("queues")
    .select("*", { count: "exact", head: true })
    .eq("branch_id", queue.branch_id)
    .eq("queue_date", queue.queue_date)
    .eq("status", "waiting")
    .lt("queue_number", queue.queue_number);

  const estimatedWaitMins = (waitingCount || 0) * 15;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 w-full bg-background pt-32 pb-24">
        <div className="container mx-auto max-w-xl px-6">
          <QueueTicketClient 
            initialQueue={queue} 
            initialWaiting={waitingCount || 0}
            initialEstimatedMins={estimatedWaitMins}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
