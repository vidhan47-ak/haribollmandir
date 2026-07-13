"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LIVE_DARSHAN } from "@/lib/live-darshan";

export default function LiveDarshanPlayer() {
  const [open, setOpen] = useState(false);

  if (!LIVE_DARSHAN.isLive || !LIVE_DARSHAN.embedUrl) return null;

  return (
    <div className="fixed bottom-5 right-4 z-[70] sm:bottom-7 sm:right-7">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="mb-3 w-[min(90vw,420px)] overflow-hidden rounded-2xl border border-gold/30 bg-maroon-dark shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 text-cream">
              <span className="font-body text-xs font-semibold">{LIVE_DARSHAN.title}</span>
              <button onClick={() => setOpen(false)} className="rounded-full px-2 py-1 text-cream/70 hover:text-cream" aria-label="Close live darshan">×</button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                className="h-full w-full"
                src={LIVE_DARSHAN.embedUrl}
                title={LIVE_DARSHAN.title}
                allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-white/35 bg-maroon px-4 py-3 font-body text-xs font-semibold text-cream shadow-xl backdrop-blur-md">
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-300" />
        Live Darshan
      </button>
    </div>
  );
}

