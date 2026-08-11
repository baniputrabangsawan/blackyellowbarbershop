"use client";
import type { Queue } from "@/types";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Users, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function QueueTicketClient({ 
  initialQueue, 
  initialWaiting,
  initialEstimatedMins 
}: { 
  initialQueue: Queue, 
  initialWaiting: number,
  initialEstimatedMins: number
}) {
  const [queue, setQueue] = useState(initialQueue);
  const waiting = initialWaiting;
  const estimatedMins = initialEstimatedMins;
  const [isUpdating, setIsUpdating] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy'
  );

  useEffect(() => {
    // Subscribe to changes on this specific queue
    const queueSubscription = supabase
      .channel(`queue-${queue.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'queues',
          filter: `id=eq.${queue.id}`
        },
        (payload) => {
          setIsUpdating(true);
          setTimeout(() => {
            setQueue((prev: Queue) => ({ ...prev, ...payload.new }));
            setIsUpdating(false);
          }, 500);
        }
      )
      .subscribe();

    // Subscribe to changes on other queues to update waiting count
    // A more sophisticated approach would be an edge function, but this works for MVP
    const globalSubscription = supabase
      .channel('global-queues')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queues',
          filter: `branch_id=eq.${queue.branch_id}`
        },
        () => {
          // Instead of recalculating complex logic on client, we could trigger a server action
          // For simplicity, we just decrement if a queue before this one gets called/completed
          // In a real app, you might want to call `getQueueStatus` here
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(queueSubscription);
      supabase.removeChannel(globalSubscription);
    };
  }, [queue.id, queue.branch_id, supabase]);

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'waiting': return { label: 'Menunggu', color: 'text-warning bg-warning/10 border-warning/20' };
      case 'called': return { label: 'Dipanggil', color: 'text-primary bg-primary/10 border-primary/20', animate: true };
      case 'in_service': return { label: 'Sedang Dilayani', color: 'text-success bg-success/10 border-success/20' };
      case 'completed': return { label: 'Selesai', color: 'text-muted-foreground bg-surface border-border' };
      case 'cancelled': return { label: 'Dibatalkan', color: 'text-destructive bg-destructive/10 border-destructive/20' };
      case 'no_show': return { label: 'Tidak Hadir', color: 'text-destructive bg-destructive/10 border-destructive/20' };
      default: return { label: status, color: 'text-foreground bg-surface border-border' };
    }
  };

  const statusDisplay = getStatusDisplay(queue.status || 'waiting');
  const queueNumberStr = `B${(queue.queue_number || 0).toString().padStart(2, '0')}`;
  const isDone = ['completed', 'cancelled', 'no_show'].includes(queue.status || 'waiting');

  return (
    <Card className="bg-surface border-primary/30 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
      <CardContent className="p-8 md:p-12">
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-muted-foreground">
            {format(new Date(queue.queue_date || new Date().toISOString()), 'EEEE, d MMMM yyyy', { locale: id })}
          </div>
          <div className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${statusDisplay.color} ${statusDisplay.animate ? 'animate-pulse' : ''}`}>
            {statusDisplay.label}
          </div>
        </div>

        <div className="text-center mb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-2">Nomor Antrean Anda</p>
          <motion.div 
            key={queue.status}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-heading text-8xl md:text-9xl font-bold tabular-nums mb-2 ${isDone ? 'text-muted-foreground' : 'text-primary'}`}
          >
            {queueNumberStr}
          </motion.div>
          <h2 className="text-xl font-bold text-foreground">{queue.customer_name}</h2>
          <p className="text-muted-foreground">{queue.services?.name}</p>
          {queue.barbers && (
            <p className="text-sm text-primary mt-1">Barber: {queue.barbers.name}</p>
          )}
        </div>

        {!isDone && queue.status === 'waiting' && (
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-8 mb-8">
            <div className="flex flex-col items-center justify-center text-center">
              <Users className="text-muted-foreground mb-2" size={24} />
              <span className="text-2xl font-bold text-foreground">{waiting}</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Antrean Sebelumnya</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center border-l border-border">
              <Clock className="text-muted-foreground mb-2" size={24} />
              <span className="text-2xl font-bold text-foreground">~{estimatedMins}m</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Estimasi Menunggu</span>
            </div>
          </div>
        )}

        {queue.status === 'called' && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center mb-8 animate-pulse">
            <AlertCircle className="mx-auto text-primary mb-3" size={32} />
            <h3 className="font-bold text-foreground text-lg mb-1">Giliran Anda!</h3>
            <p className="text-sm text-muted-foreground">Silakan menuju kursi barber sekarang.</p>
          </div>
        )}

        <div className="flex justify-center border-t border-border pt-8">
          <Link href="/" className={buttonVariants({ variant: "outline", className: "rounded-full" })}>
            Kembali ke Beranda
          </Link>
        </div>
        
        {isUpdating && (
          <div className="absolute top-4 right-4 text-primary">
            <RefreshCw className="animate-spin" size={16} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
