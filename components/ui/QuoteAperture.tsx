"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/** Opens each quote in the central viewport without recalculating every scroll frame. */
export default function QuoteAperture({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [openHeight, setOpenHeight] = useState(560);

  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth < 640;
      const height = mobile
        ? Math.min(500, Math.max(400, window.innerHeight * 0.6))
        : Math.min(650, Math.max(500, window.innerHeight * 0.68));
      setOpenHeight(Math.round(height));
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const target = ref.current;
    if (!target || reduceMotion) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOpen(entry.isIntersecting),
      { rootMargin: "-14% 0px -14% 0px", threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <div ref={ref} className="quote-aperture-anchor">
      <motion.div
        className="quote-aperture"
        initial={false}
        animate={reduceMotion ? undefined : { height: open ? openHeight : 0 }}
        transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="quote-aperture__panel" style={{ height: openHeight }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
