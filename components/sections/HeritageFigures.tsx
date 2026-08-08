"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";

const EASE = EASE_DEVOTIONAL;

const BASE =
  "pointer-events-none absolute bottom-0 z-[1] hidden select-none drop-shadow-[0_22px_45px_rgba(50,25,5,0.38)] lg:block lg:w-[24rem] xl:w-[28rem] 2xl:w-[32rem]";

/**
 * Two devotional figures that flank the "Harinam, Bhakti & Seva" section and
 * rise up + fade in as it scrolls into view — one on the left, one on the
 * right. Decorative (aria-hidden, pointer-events-none), reduced-motion aware,
 * and each hides itself if its image is missing. Transparent PNGs recommended.
 */
export default function HeritageFigures() {
  const reduce = useReducedMotion();
  const [leftOk, setLeftOk] = useState(true);
  const [rightOk, setRightOk] = useState(true);

  return (
    <>
      {leftOk && (
        <motion.img
          src="/images/seva-figure-left.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          onError={() => setLeftOk(false)}
          initial={{ opacity: 0, y: reduce ? 0 : 96 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduce ? 0.4 : 1.1, ease: EASE }}
          className={`${BASE} -left-6 sm:-left-8 lg:-left-10 xl:-left-12`}
        />
      )}
      {rightOk && (
        <motion.img
          src="/images/seva-figure-right.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          decoding="async"
          onError={() => setRightOk(false)}
          initial={{ opacity: 0, y: reduce ? 0 : 96 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reduce ? 0.4 : 1.1, ease: EASE, delay: reduce ? 0 : 0.12 }}
          className={`${BASE} -right-6 sm:-right-8 lg:-right-10 xl:-right-12`}
        />
      )}
    </>
  );
}
