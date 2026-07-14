"use client";

import { motion, useReducedMotion } from "framer-motion";
import { LIVE_DARSHAN } from "@/lib/live-darshan";

export default function LiveDarshanPlayer() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href={LIVE_DARSHAN.facebookUrl}
      target="_blank"
      rel="noreferrer"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="live-darshan-glass inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-cream sm:px-5 sm:py-2.5"
      aria-label="Open Live Darshan on Facebook. Broadcasts daily at 5 AM and 7:30 PM"
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-300" />
      </span>
      <span className="font-body text-[9px] font-semibold uppercase tracking-[0.13em] sm:text-[10px]">
        Live Darshan
      </span>
      <span className="h-3 w-px bg-white/35" aria-hidden="true" />
      <span className="whitespace-nowrap font-body text-[9px] font-medium sm:text-[10px]">
        5:00 AM &amp; 7:30 PM
      </span>
    </motion.a>
  );
}
