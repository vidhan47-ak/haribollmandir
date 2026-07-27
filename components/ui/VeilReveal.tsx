"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";

export default function VeilReveal({ tone = "cream" }: { tone?: "cream" | "maroon" }) {
  const reduce = useReducedMotion();
  if (reduce) return null;

  return (
    <motion.span
      aria-hidden="true"
      className={`image-veil ${tone === "maroon" ? "image-veil--maroon" : "image-veil--cream"}`}
      initial={{ y: "0%" }}
      whileInView={{ y: "-102%" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1.05, ease: EASE_DEVOTIONAL }}
    />
  );
}
