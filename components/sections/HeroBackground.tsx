"use client";

import { useEffect, useState } from "react";
import { heroBackgrounds, heroFallback } from "@/lib/images";
import { getJalandharDaypart, type Daypart } from "@/lib/daypart";

interface DaypartLayerProps {
  variant: Daypart;
  desktopSrc: string;
  mobileSrc: string;
  eager: boolean;
  onFatal: () => void;
}

/**
 * One crossfading hero layer. Visibility is driven purely by the
 * `<html data-daypart>` attribute via CSS (.hero-daypart-layer), so both
 * layers stay mounted and there is no hydration mismatch. If the daypart image
 * is missing it retries with the shared fallback; if that fails too it reports
 * upward so the ornamental SVG hero can take over.
 */
function DaypartLayer({
  variant,
  desktopSrc,
  mobileSrc,
  eager,
  onFatal,
}: DaypartLayerProps) {
  const [useFallback, setUseFallback] = useState(false);
  const desktop = useFallback ? heroFallback.desktop : desktopSrc;
  const mobile = useFallback ? heroFallback.mobile : mobileSrc;

  return (
    <picture
      className={`hero-daypart-layer hero-daypart-layer--${variant} absolute inset-0 z-[1] block h-full w-full`}
    >
      <source media="(max-width: 639px)" srcSet={mobile} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={desktop}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "low"}
        onError={() => {
          if (!useFallback) setUseFallback(true);
          else onFatal();
        }}
        className="hero-artwork pointer-events-none h-full w-full object-contain object-top sm:object-cover sm:object-center"
      />
    </picture>
  );
}

/**
 * Renders the morning + evening + night hero layers and keeps
 * `<html data-daypart>` in sync with the live Jalandhar time so the backdrop
 * flips at the 04:00 / 12:00 / 18:00 IST boundaries without a reload. The
 * initial value is set before paint by the inline script in app/layout.tsx;
 * this effect covers long-lived sessions and re-syncs whenever the tab regains
 * focus.
 */
export default function HeroBackground({
  onUnavailable,
}: {
  onUnavailable: () => void;
}) {
  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute("data-daypart", getJalandharDaypart());
    };
    apply();
    const interval = window.setInterval(apply, 60_000);
    const onVisibility = () => {
      if (!document.hidden) apply();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      <DaypartLayer
        variant="day"
        desktopSrc={heroBackgrounds.day.desktop}
        mobileSrc={heroBackgrounds.day.mobile}
        eager
        onFatal={onUnavailable}
      />
      <DaypartLayer
        variant="evening"
        desktopSrc={heroBackgrounds.evening.desktop}
        mobileSrc={heroBackgrounds.evening.mobile}
        eager={false}
        onFatal={onUnavailable}
      />
      <DaypartLayer
        variant="night"
        desktopSrc={heroBackgrounds.night.desktop}
        mobileSrc={heroBackgrounds.night.mobile}
        eager={false}
        onFatal={onUnavailable}
      />
    </>
  );
}
