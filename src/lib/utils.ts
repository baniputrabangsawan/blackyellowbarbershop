import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isStoreOpenAtCurrentTime(): boolean {
  try {
    const now = new Date();
    
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Makassar',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    }).formatToParts(now);

    let weekday = '';
    let hour = 0;
    let minute = 0;

    for (const part of parts) {
      if (part.type === 'weekday') weekday = part.value;
      if (part.type === 'hour') {
         hour = parseInt(part.value, 10);
         if (hour === 24) hour = 0;
      }
      if (part.type === 'minute') minute = parseInt(part.value, 10);
    }

    const currentTimeFloat = hour + (minute / 60);
    let openTime = 10; // 10:00
    const closeTime = 22; // 22:00

    if (weekday === 'Fri') {
      openTime = 13; // 13:00
    }

    return currentTimeFloat >= openTime && currentTimeFloat < closeTime;
  } catch (error) {
    console.error("Error calculating store hours", error);
    return true; // Fail-safe (anggap buka jika error)
  }
}
