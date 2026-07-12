"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** A quiet reading-progress cue for the long-form homepage. */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-[#8a5a1f] via-[#e3c77e] to-[#c9a24b] shadow-[0_0_12px_rgba(201,162,75,0.55)]"
      style={{ scaleX: reduce ? scrollYProgress : scaleX }}
    />
  );
}
