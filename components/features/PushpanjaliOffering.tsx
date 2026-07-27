"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Pushpanjali: tapping a deity portrait showers marigold and rose petals
 * over the image. Rendered as an absolutely-positioned layer inside the
 * portrait's relative container.
 */

type Petal = {
  id: number;
  kind: "marigold" | "rose";
  left: number; // % across the container
  size: number; // px
  duration: number; // s
  delay: number; // s
  sway: number; // px
  rot0: number;
  rot1: number;
  rot2: number;
};

let petalId = 0;

function makeBurst(count: number): Petal[] {
  return Array.from({ length: count }, (_, i) => {
    const spin = 140 + Math.random() * 240;
    return {
      id: petalId++,
      kind: Math.random() < 0.6 ? "marigold" : "rose",
      left: 4 + Math.random() * 92,
      size: 11 + Math.random() * 9,
      duration: 2.4 + Math.random() * 1.8,
      delay: (i % 7) * 0.12 + Math.random() * 0.25,
      sway: (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 26),
      rot0: Math.random() * 360,
      rot1: spin,
      rot2: spin + 120 + Math.random() * 160,
    };
  });
}

function PetalShape({ kind }: { kind: Petal["kind"] }) {
  return kind === "marigold" ? (
    <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
      <path
        d="M10 1c3.4 2.8 5 6 4.6 9.6-.3 3-2.1 5.6-4.6 8.4-2.5-2.8-4.3-5.4-4.6-8.4C5 7 6.6 3.8 10 1Z"
        fill="#F5A623"
        stroke="#D97B12"
        strokeWidth="0.8"
      />
      <path d="M10 3.5c1.6 2 2.4 4.2 2.2 6.6" stroke="#FBD07A" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" className="h-full w-full" aria-hidden="true">
      <path
        d="M10 2c3.8 1.6 5.8 4.3 5.8 7.6 0 3.8-2.5 6.7-5.8 8.4-3.3-1.7-5.8-4.6-5.8-8.4C4.2 6.3 6.2 3.6 10 2Z"
        fill="#E7A3B0"
        stroke="#C87E8E"
        strokeWidth="0.8"
      />
      <path d="M10 4.5c1.8 1.5 2.7 3.4 2.6 5.6" stroke="#F4CCD4" strokeWidth="0.9" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function PushpanjaliOffering({
  hint,
  offeredNote,
}: {
  hint: string;
  offeredNote: string;
}) {
  const reduce = useReducedMotion() === true;
  const [petals, setPetals] = useState<Petal[]>([]);
  const [offerings, setOfferings] = useState(0);
  const layerRef = useRef<HTMLDivElement>(null);
  const cleanupTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(cleanupTimer.current), []);

  const offer = () => {
    const travel = layerRef.current?.offsetHeight ?? 360;
    const burst = reduce ? [] : makeBurst(16);
    setPetals((prev) => (reduce ? [] : [...prev.slice(-24), ...burst]));
    setOfferings((n) => n + 1);
    try {
      // A private lifetime tally, like the diya log — continuity for
      // returning devotees, never shown publicly.
      const key = "hariboll-pushpanjali-offerings";
      const total = Number(window.localStorage.getItem(key) || 0) + 1;
      window.localStorage.setItem(key, String(total));
    } catch {
      // The visual offering remains available when storage is restricted.
    }

    // Drop finished petals so the DOM stays small during repeat offerings.
    window.clearTimeout(cleanupTimer.current);
    if (!reduce) {
      cleanupTimer.current = window.setTimeout(() => setPetals([]), 5200);
      layerRef.current?.style.setProperty("--petal-travel", `${travel * 1.02}px`);
    }
  };

  return (
    <>
      {/* Invisible offering surface over the portrait */}
      <button
        type="button"
        onClick={offer}
        aria-label={hint}
        title={hint}
        className="absolute inset-0 z-[6] cursor-pointer bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-light"
      />

      <div ref={layerRef} className="petal-layer" aria-hidden="true">
        {petals.map((p) => (
          <span
            key={p.id}
            className="petal"
            style={
              {
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                "--petal-dur": `${p.duration}s`,
                "--petal-delay": `${p.delay}s`,
                "--petal-sway": `${p.sway}px`,
                "--petal-rot0": `${p.rot0}deg`,
                "--petal-rot1": `${p.rot1}deg`,
                "--petal-rot2": `${p.rot2}deg`,
              } as React.CSSProperties
            }
          >
            <PetalShape kind={p.kind} />
          </span>
        ))}
      </div>

      {/* Hint before the first offering, gratitude after */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-3 z-[8] flex justify-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={offerings === 0 ? "hint" : `offered-${offerings}`}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduce ? 0 : 0.5 }}
            className="rounded-full border border-white/30 bg-black/35 px-3 py-1.5 font-body text-[9px] font-semibold uppercase tracking-[0.14em] text-cream/90 backdrop-blur-sm"
          >
            {offerings === 0 ? hint : offeredNote}
          </motion.span>
        </AnimatePresence>
      </div>
    </>
  );
}
