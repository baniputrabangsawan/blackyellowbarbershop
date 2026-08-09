"use client";

import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";

export function SmoothScrollProvider() {
  const pathname = usePathname();

  // The admin area uses its own nested scroll container.
  if (pathname.startsWith("/admin")) return null;

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.085,
        wheelMultiplier: 0.9,
        anchors: { offset: -80 },
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
      }}
    />
  );
}
