"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function CeremonialDivider() {
  const reduce = useReducedMotion();
  return (
    <div className="relative z-20 h-0" aria-hidden="true">
      <motion.div
        className="ceremonial-divider absolute left-1/2 top-0 h-px w-[min(72vw,56rem)] -translate-x-1/2 origin-center"
        initial={reduce ? false : { opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: reduce ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
