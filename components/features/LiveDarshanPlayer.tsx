"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LIVE_DARSHAN } from "@/lib/live-darshan";

function minutesInTempleTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LIVE_DARSHAN.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export default function LiveDarshanPlayer() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const activeBroadcast = useMemo(() => {
    if (!now) return null;
    const minutes = minutesInTempleTime(now);
    return LIVE_DARSHAN.broadcasts.find((broadcast) => {
      const windowStart = broadcast.startMinutes - broadcast.earlyMinutes;
      const windowEnd = broadcast.startMinutes + broadcast.durationMinutes;
      return minutes >= windowStart && minutes <= windowEnd;
    }) ?? null;
  }, [now]);

  if (!activeBroadcast) return null;

  return (
    <motion.a
      href={LIVE_DARSHAN.facebookUrl}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-5 right-4 z-[70] flex items-center gap-3 rounded-full border border-white/35 bg-maroon px-4 py-3 text-cream shadow-xl backdrop-blur-md sm:bottom-7 sm:right-7"
      aria-label={`${activeBroadcast.label} live on Facebook`}
    >
      <span className="relative flex h-3 w-3" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-70" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-300" />
      </span>
      <span>
        <span className="block font-body text-[9px] font-medium uppercase tracking-[0.18em] text-gold-light">Live on Facebook</span>
        <span className="mt-0.5 block font-body text-xs font-semibold">{activeBroadcast.label}</span>
      </span>
    </motion.a>
  );
}

