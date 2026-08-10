/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Users, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLiveQueueStatus, getStoreQueueState } from "@/actions/queue";
import { createBrowserClient } from "@supabase/ssr";
import { useRealtimeSettings } from "@/hooks/use-settings";

export function QueuePreviewSection({ settings: initialSettings }: { settings?: any }) {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({ currentNumber: null as number | null, waitingCount: 0, estimatedWaitMins: 0, storeState: 'offline' });
  const settings = useRealtimeSettings(initialSettings || {});

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy'
  );

  useEffect(() => {
    let globalSubscription: any = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let isPolling = false;
    let isDisposed = false;

    const fetchQueueStatus = async (branchId: string) => {
      const [liveStatus, storeState] = await Promise.all([
        getLiveQueueStatus(branchId),
        getStoreQueueState(branchId),
      ]);

      return { ...liveStatus, storeState };
    };

    const fetchInitialData = async () => {
      // Fetch the first active branch to show its queue
      const { data: branchData } = await supabase.from("branches").select("id").eq("is_active", true).limit(1).single();
      if (branchData && !isDisposed) {
        const initialStatus = await fetchQueueStatus(branchData.id);
        if (isDisposed) return;

        setStatus(initialStatus);
        setIsLoading(false);

        // Subscribe to real-time updates for this branch's queues
        const channelId = typeof window !== 'undefined' ? Math.random().toString(36).substring(2) : Date.now();
        globalSubscription = supabase
          .channel(`global-queues-preview-${channelId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'queues'
            },
            async () => {
              if (isDisposed) return;

              // Re-fetch the simplified status when any queue changes
              const newStatus = await fetchQueueStatus(branchData.id);
              if (isDisposed) return;

              setStatus(newStatus);
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'site_settings'
            },
            async () => {
              if (isDisposed) return;

              // Update store state when admin changes settings
              const storeState = await getStoreQueueState(branchData.id);
              if (isDisposed) return;

              setStatus(prev => ({ ...prev, storeState }));
            }
          )
          .subscribe();

        // Realtime is the primary update mechanism. Poll less frequently as a fallback.
        pollInterval = setInterval(async () => {
          if (isDisposed || isPolling) return;
          isPolling = true;

          try {
            const newStatus = await fetchQueueStatus(branchData.id);
            
            setStatus(prev => {
              if (
                prev.currentNumber !== newStatus.currentNumber || 
                prev.waitingCount !== newStatus.waitingCount ||
                prev.storeState !== newStatus.storeState
              ) {
                return newStatus;
              }
              return prev;
            });
          } catch (e) {
            console.error("Polling error", e);
          } finally {
            isPolling = false;
          }
        }, 30000);
      }
    };

    fetchInitialData();

    return () => {
      isDisposed = true;
      if (globalSubscription) {
        supabase.removeChannel(globalSubscription);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [supabase]);

  const queueNumberStr = status.currentNumber 
    ? `B${status.currentNumber.toString().padStart(2, '0')}` 
    : "--";

  return (
    <section id="queue" className="py-24 bg-surface-elevated border-y border-border">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          <div className="w-full lg:w-1/2">
            <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-6">
              Live <span className="text-primary">Antrean</span>
            </h2>
            <p className="text-muted-foreground md:text-lg mb-8 leading-relaxed">
              Pantau antrean kami secara langsung. Hemat waktu Anda dengan melihat kondisi barbershop sebelum datang, atau ambil nomor antrean sekarang dari ponsel Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isLoading ? (
                <div className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background h-11 px-8 bg-muted text-muted-foreground">
                  Memuat Status...
                </div>
              ) : status.storeState === 'open' ? (
                <Link href="/queue" className={buttonVariants({ size: "lg", className: "rounded-full bg-primary text-primary-foreground hover:bg-primary-hover px-8 font-semibold" })}>
                  Ambil Antrean Sekarang
                </Link>
              ) : (
                <div className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-bold ring-offset-background h-11 px-8 bg-destructive/10 text-destructive border border-destructive/20 cursor-not-allowed">
                  Pendaftaran Ditutup
                </div>
              )}
            </div>
            
            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle size={16} className="text-primary" />
              <span>Pendaftaran antrean ditutup 30 menit sebelum jam operasional berakhir.</span>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <Card className="bg-background border-primary/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
              <CardContent className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      {isLoading ? (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-muted-foreground animate-pulse"></span>
                      ) : status.storeState === 'open' ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                        </>
                      ) : (status.storeState === 'full' || settings?.operational_status === 'Istirahat') ? (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                      ) : (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                      )}
                    </span>
                    <span className={`text-sm font-bold uppercase tracking-wider ${
                      isLoading ? 'text-muted-foreground' : 
                      status.storeState === 'open' ? 'text-success' : 
                      (status.storeState === 'full' || settings?.operational_status === 'Istirahat') ? 'text-yellow-500' : 'text-destructive'
                    }`}>
                      {isLoading 
                        ? 'Menghubungkan...' 
                        : status.storeState === 'open' 
                          ? 'Live Update' 
                          : status.storeState === 'full' 
                            ? 'Antrean Penuh' 
                            : (settings?.operational_status && settings?.operational_status.toLowerCase() !== 'buka')
                              ? settings.operational_status.toUpperCase()
                              : 'TOKO TUTUP'
                      }
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">Otomatis Diperbarui</span>
                </div>

                <div className="text-center mb-10">
                  <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-2">Sedang Dilayani</p>
                  <motion.div 
                    key={queueNumberStr}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-heading text-7xl md:text-8xl font-bold text-primary tabular-nums"
                  >
                    {queueNumberStr}
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border pt-8">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Users className="text-muted-foreground mb-2" size={24} />
                    <span className="text-2xl font-bold text-foreground">{status.waitingCount}</span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Menunggu</span>
                  </div>
                  <div className="flex flex-col items-center justify-center text-center border-l border-border">
                    <Clock className="text-muted-foreground mb-2" size={24} />
                    <span className="text-2xl font-bold text-foreground">~{status.estimatedWaitMins}m</span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Estimasi</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}
