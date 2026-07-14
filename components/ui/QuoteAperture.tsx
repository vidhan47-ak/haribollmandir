"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * A zero-layout-height transition layer. The surrounding main sections remain
 * directly connected while the quote unfolds vertically over their boundary.
 */
export default function QuoteAperture({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.16, 0.36, 0.64, 0.84, 1],
    [
      "inset(50% 0% 50% 0%)",
      "inset(50% 0% 50% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(0% 0% 0% 0%)",
      "inset(50% 0% 50% 0%)",
      "inset(50% 0% 50% 0%)",
    ],
  );

  return (
    <div ref={ref} className="quote-aperture">
      <motion.div
        className="quote-aperture__panel"
        style={reduceMotion ? undefined : { clipPath }}
      >
        {children}
      </motion.div>
    </div>
  );
}

