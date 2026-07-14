"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

interface SacredCurtainProps {
  scene: ReactNode;
  children: ReactNode;
}

/**
 * Pins a devotional image scene while the following section rises over it.
 * The browser keeps ownership of scrolling; only visual depth follows progress.
 */
export default function SacredCurtain({ scene, children }: SacredCurtainProps) {
  const pinRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.58, 1], [1, 1.035, 1.075]);
  const scaleY = useTransform(scrollYProgress, [0, 0.68, 1], [1, 1.018, 1.045]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const shade = useTransform(scrollYProgress, [0, 0.52, 1], [0, 0.12, 0.48]);
  const blur = useTransform(
    scrollYProgress,
    [0, 0.64, 1],
    ["brightness(1) saturate(1) blur(0px)", "brightness(.9) saturate(.96) blur(0px)", "brightness(.66) saturate(.82) blur(2.5px)"],
  );
  const nextScale = useTransform(scrollYProgress, [0, 0.8, 1], [0.975, 0.992, 1]);
  const edgeGlow = useTransform(scrollYProgress, [0, 0.35, 1], [0.15, 0.62, 1]);

  const animate = enabled && !reduceMotion;

  return (
    <div className="sacred-curtain">
      <div ref={pinRef} className="sacred-curtain__pin">
        <motion.div
          className="sacred-curtain__scene"
          style={animate ? { scale, scaleY, y, filter: blur } : undefined}
        >
          {scene}
        </motion.div>
        <motion.div
          aria-hidden="true"
          className="sacred-curtain__shade"
          style={animate ? { opacity: shade } : undefined}
        />
      </div>

      <motion.div
        className="sacred-curtain__next"
        style={animate ? { scale: nextScale, "--curtain-edge-opacity": edgeGlow } as never : undefined}
      >
        {children}
      </motion.div>
    </div>
  );
}

