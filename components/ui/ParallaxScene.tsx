"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

interface ParallaxSceneProps {
  children: ReactNode;
  amount?: number;
  mobileAmount?: number;
}

type ParallaxStyle = CSSProperties & {
  "--section-parallax-y"?: MotionValue<string> | string;
};

/** Slow background depth for the main temple sections; foreground content remains native. */
export default function ParallaxScene({
  children,
  amount = 68,
  mobileAmount = 0,
}: ParallaxSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [desktop, setDesktop] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const desktopY = useTransform(scrollYProgress, [0, 1], [`-${amount}px`, `${amount}px`]);
  const mobileY = useTransform(scrollYProgress, [0, 1], [`-${mobileAmount}px`, `${mobileAmount}px`]);
  const parallaxY = desktop ? desktopY : mobileY;
  const style: ParallaxStyle = {
    "--section-parallax-y": reduceMotion ? "0px" : parallaxY,
  };

  return (
    <motion.div ref={ref} className="parallax-main-scene" style={style}>
      {children}
    </motion.div>
  );
}
