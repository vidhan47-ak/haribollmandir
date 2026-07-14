"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * A zero-layout-height transition layer. The surrounding main sections remain
 * directly connected while the quote unfolds vertically over their boundary.
 */
export default function QuoteAperture({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [openHeight, setOpenHeight] = useState(560);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 88%", "start 12%"],
  });

  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth < 640;
      const height = mobile
        ? Math.min(520, Math.max(420, window.innerHeight * 0.62))
        : Math.min(680, Math.max(520, window.innerHeight * 0.72));
      setOpenHeight(Math.round(height));
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  const height = useTransform(
    scrollYProgress,
    [0, 0.12, 0.34, 0.66, 0.88, 1],
    [0, 0, openHeight, openHeight, 0, 0],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.14, 0.27, 0.73, 0.86, 1],
    [0, 0, 1, 1, 0, 0],
  );

  return (
    <div ref={ref} className="quote-aperture-anchor">
      <motion.div
        className="quote-aperture"
        style={reduceMotion ? undefined : { height }}
      >
        <motion.div
          className="quote-aperture__panel"
          style={reduceMotion ? undefined : { height: openHeight, opacity }}
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
