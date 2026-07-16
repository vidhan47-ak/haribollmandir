"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionStyle } from "framer-motion";

interface ParallaxSceneProps {
  children: ReactNode;
  amount?: number;
  mobileAmount?: number;
}

export default function ParallaxScene({
  children,
  amount = 36,
  mobileAmount = 0,
}: ParallaxSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const desktopY = useTransform(scrollYProgress, [0, 1], [-(reduce ? 0 : amount), reduce ? 0 : amount]);
  const mobileY = useTransform(scrollYProgress, [0, 1], [-(reduce ? 0 : mobileAmount), reduce ? 0 : mobileAmount]);

  return (
    <motion.div
      ref={ref}
      className="parallax-main-scene"
      style={{ "--parallax-y": desktopY, "--parallax-mobile-y": mobileY } as MotionStyle}
    >
      {children}
    </motion.div>
  );
}
