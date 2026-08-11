"use client";
import type { SiteSettings } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Users, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLiveQueueStatus, getStoreQueueState } from "@/actions/queue";
import { createBrowserClient } from "@supabase/ssr";
import { useRealtimeSettings } from "@/hooks/use-settings";

interface BranchStatus {
  id: string;
  name: string;
  currentNumber: number | null;
  waitingCount: number;
  estimatedWaitMins: number;
  storeState: string;
}

export function QueuePreviewSection({ settings: initialSettings, initialStatuses = [] }: { settings?: SiteSettings, initialStatuses?: BranchStatus[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [branchStatuses, setBranchStatuses] = useState<BranchStatus[]>(initialStatuses);
  const settings = useRealtimeSettings(initialSettings || ({} as SiteSettings));

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy'
  );

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    let isPolling = false;
    let isDisposed = false;

    const fetchQueueStatus = async (branchId: string, branchName: string) => {
      const [liveStatus, storeState] = await Promise.all([
        getLiveQueueStatus(branchId),
        getStoreQueueState(branchId),
      ]);
      return { id: branchId, name: branchName, ...liveStatus, storeState } as BranchStatus;
    };

    const startPolling = async () => {
      // Fetch ALL active branches (only needed for polling structure, but we already have initialStatuses)
      const branches = initialStatuses.map(s => ({ id: s.id, name: s.name }));
      if (branches.length > 0 && !isDisposed) {
        // We already have initial data, start polling right away
        pollInterval = setInterval(async () => {
          if (isDisposed || isPolling) return;
          isPolling = true;

          try {
            const newStatuses = await Promise.all(branches.map(b => fetchQueueStatus(b.id, b.name)));
            if (isDisposed) return;
            setBranchStatuses(newStatuses);
          } catch (e) {
            console.error("Polling error", e);
          } finally {
            isPolling = false;
          }
        }, 10000); // 10 seconds polling
      }
    };

    startPolling();

    return () => {
      isDisposed = true;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [supabase]);

  // Determine if AT LEAST ONE store is open to allow clicking the Ambil Antrean button
  const isAnyStoreOpen = branchStatuses.some(s => s.storeState === 'open');

  return (
    <section id="queue" className="py-24 bg-surface-elevated border-y border-border">
      <div className="container mx-auto max-w-7xl px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left Side: Call to Action */}
          <div className="w-full lg:w-1/2">
            <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-6">
              Live <span className="text-primary">Antrean</span>
            </h2>
            <p className="text-muted-foreground md:text-lg mb-8 leading-relaxed">
              Pantau antrean kami secara langsung untuk seluruh cabang. Hemat waktu Anda dengan melihat kondisi barbershop sebelum datang, atau ambil nomor antrean sekarang dari ponsel Anda.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isLoading ? (
                <div className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background h-11 px-8 bg-muted text-muted-foreground">
                  Memuat Status...
                </div>
              ) : isAnyStoreOpen ? (
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
              <AlertCircle size={16} className="text-primary shrink-0" />
              <span>Pendaftaran antrean ditutup 30 menit sebelum jam operasional berakhir.</span>
            </div>
          </div>

          {/* Right Side: Multiple Queue Cards */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            {isLoading ? (
              // Loading Skeleton
              <Card className="bg-background border-border relative overflow-hidden opacity-50">
                <CardContent className="p-8 h-[250px] flex items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-24 bg-muted rounded mb-4"></div>
                    <div className="h-16 w-32 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ) : branchStatuses.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground">Belum ada cabang yang aktif.</p>
              </div>
            ) : (
              branchStatuses.map((status) => {
                const queueNumberStr = status.currentNumber 
                  ? `B${status.currentNumber.toString().padStart(2, '0')}` 
                  : "--";

                return (
                  <Card key={status.id} className="bg-background border-primary/30 relative overflow-hidden hover:border-primary/60 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-heading text-xl font-bold text-foreground">{status.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="relative flex h-3 w-3">
                              {status.storeState === 'open' ? (
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
                            <span className={`text-xs font-bold uppercase tracking-wider ${
                              status.storeState === 'open' ? 'text-success' : 
                              (status.storeState === 'full' || settings?.operational_status === 'Istirahat') ? 'text-yellow-500' : 'text-destructive'
                            }`}>
                              {status.storeState === 'open' 
                                  ? 'Live Update' 
                                  : status.storeState === 'full' 
                                    ? 'Antrean Penuh' 
                                    : (settings?.operational_status && settings?.operational_status.toLowerCase() !== 'buka')
                                      ? settings.operational_status.toUpperCase()
                                      : 'TOKO TUTUP'
                              }
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap bg-surface-elevated px-2 py-1 rounded-full border border-border">
                          Otomatis
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Sedang Dilayani</p>
                          <motion.div 
                            key={queueNumberStr}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="font-heading text-5xl sm:text-6xl font-bold text-primary tabular-nums leading-none"
                          >
                            {queueNumberStr}
                          </motion.div>
                        </div>

                        <div className="flex gap-4 sm:gap-6 border-l border-border pl-4 sm:pl-6">
                          <div className="flex flex-col items-center justify-center text-center">
                            <Users className="text-muted-foreground mb-1 w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="text-xl sm:text-2xl font-bold text-foreground leading-none">{status.waitingCount}</span>
                            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mt-1">Menunggu</span>
                          </div>
                          <div className="flex flex-col items-center justify-center text-center">
                            <Clock className="text-muted-foreground mb-1 w-5 h-5 sm:w-6 sm:h-6" />
                            <span className="text-xl sm:text-2xl font-bold text-foreground leading-none">~{status.estimatedWaitMins}m</span>
                            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mt-1">Estimasi</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
