"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { isStoreOpenAtCurrentTime } from "@/lib/utils";

export function useRealtimeSettings<T>(initialSettings: T) {
  const [settings, setSettings] = useState(initialSettings);
  const [prevInitialSettings, setPrevInitialSettings] = useState(initialSettings);
  const [isTimeOpen, setIsTimeOpen] = useState(isStoreOpenAtCurrentTime);

  if (JSON.stringify(initialSettings) !== JSON.stringify(prevInitialSettings)) {
    setPrevInitialSettings(initialSettings);
    setSettings(initialSettings);
  }

  useEffect(() => {
    // Check every minute
    const interval = setInterval(() => {
      setIsTimeOpen(isStoreOpenAtCurrentTime());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy'
    );

    const channelId = typeof window !== 'undefined' ? Math.random().toString(36).substring(2) : Date.now();
    const channel = supabase
      .channel(`settings-updates-${channelId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'site_settings' },
        (payload) => {
          if (payload.new) {
            setSettings((prev: T) => ({ ...prev, ...(payload.new as Partial<T>) }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Override settings if store should be closed by time
  const augmentedSettings = { ...settings } as T & { is_open?: boolean; operational_status?: string };
  if (augmentedSettings && typeof augmentedSettings.is_open !== 'undefined') {
    if (!isTimeOpen) {
      augmentedSettings.is_open = false;
      augmentedSettings.operational_status = "Tutup (Luar Jam Operasional)";
    }
  }

  return augmentedSettings as T;
}
