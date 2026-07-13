"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let hideTimer = 0;
    let showTimer = 0;
    let cancelled = false;

    const cycle = () => {
      hideTimer = window.setTimeout(() => {
        setVisible(false);
        showTimer = window.setTimeout(() => {
          if (cancelled) return;
          setVisible(true);
          cycle();
        }, 10_000);
      }, 20_000);
    };

    cycle();
    return () => {
      cancelled = true;
      window.clearTimeout(hideTimer);
      window.clearTimeout(showTimer);
    };
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

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={LIVE_DARSHAN.facebookUrl}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-0 top-[58%] z-[70] flex items-center gap-2 rounded-l-full border border-r-0 border-white/35 bg-maroon/95 px-3 py-2 text-cream shadow-xl backdrop-blur-md"
          aria-label={activeBroadcast
            ? `${activeBroadcast.label} live on Facebook`
            : "Facebook Darshan at 5 AM and 7:30 PM"}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            {activeBroadcast && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-70" />}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${activeBroadcast ? "bg-red-300" : "bg-gold-light"}`} />
          </span>
          <span>
            <span className="block font-body text-[8px] font-medium uppercase tracking-[0.14em] text-gold-light">
              {activeBroadcast ? "Live Now" : "Facebook Darshan"}
            </span>
            <span className="mt-0.5 block whitespace-nowrap font-body text-[10px] font-semibold">
              {activeBroadcast ? activeBroadcast.label : "5 AM • 7:30 PM"}
            </span>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
