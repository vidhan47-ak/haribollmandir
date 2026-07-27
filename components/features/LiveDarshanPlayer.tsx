"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import { getLiveStatus, LIVE_DARSHAN, type LiveStatus } from "@/lib/live-darshan";
import { useLang } from "@/lib/i18n";
import { aaratiSummary, formatTempleTime, AARATI_TIMES } from "@/lib/temple";

/**
 * Permanent hero badge for the Facebook live broadcast.
 * The dot breathes green while a darshan window is open and rests amber in
 * between, alongside the next broadcast time. Every time shown here is derived
 * from the one ārati schedule in lib/temple.ts — these used to be hardcoded
 * strings that disagreed with the schedule by an hour.
 */
export default function LiveDarshanPlayer() {
  const reduceMotion = useReducedMotion();
  const { lang } = useLang();
  // Deterministic first frame for SSR: render offline, then resolve on mount.
  const [status, setStatus] = useState<LiveStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getLiveStatus());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const live = status?.live ?? false;
  const statusLabel = live
    ? lang === "hi" ? "अभी लाइव" : "Live Now"
    : lang === "hi" ? "लाइव दर्शन" : "Live Darshan";
  const firstWindowLabel = formatTempleTime(AARATI_TIMES[0].minutes, lang);
  const nextLabel = status?.window.label ?? firstWindowLabel;
  const timeLabel = live
    ? aaratiSummary(lang)
    : lang === "hi"
      ? `अगला · ${nextLabel}`
      : `Next · ${nextLabel}`;

  return (
    <motion.a
      href={LIVE_DARSHAN.facebookUrl}
      target="_blank"
      rel="noreferrer"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE_DEVOTIONAL }}
      className="live-darshan-glass inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-cream sm:px-5 sm:py-2.5"
      aria-label={
        live
          ? `Live Darshan is streaming now on Facebook. Broadcasts daily at ${aaratiSummary("en")}`
          : `Live Darshan is currently offline. Next broadcast at ${nextLabel} on Facebook`
      }
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        {live && !reduceMotion && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full transition-colors duration-500 ${
            live ? "bg-emerald-300" : "bg-amber-300"
          }`}
        />
      </span>
      <span className="font-body text-[9px] font-semibold uppercase tracking-[0.13em] sm:text-[10px]">
        {statusLabel}
      </span>
      <span className="h-3 w-px bg-white/35" aria-hidden="true" />
      <span className="whitespace-nowrap font-body text-[9px] font-medium tabular-nums sm:text-[10px]">
        {timeLabel}
      </span>
    </motion.a>
  );
}
