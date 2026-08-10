"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function useRealtimeSettings<T>(initialSettings: T) {
  const [settings, setSettings] = useState(initialSettings);
  const [prevInitialSettings, setPrevInitialSettings] = useState(initialSettings);

  if (initialSettings !== prevInitialSettings) {
    setPrevInitialSettings(initialSettings);
    setSettings(initialSettings);
  }

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

  return settings;
}
