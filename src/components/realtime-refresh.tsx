"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export function RealtimeRefresh() {
  const router = useRouter();
  
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy'
    );

    const channelId = typeof window !== 'undefined' ? Math.random().toString(36).substring(2) : Date.now();
    const channel = supabase
      .channel(`global-app-refresh-${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log("⚡ [Realtime] Data berubah! Melakukan refresh background...", payload);
          // Refresh the current route to fetch new server component data (Background refresh)
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log("📡 [Realtime] Status koneksi:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
