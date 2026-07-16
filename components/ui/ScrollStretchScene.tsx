"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

interface ScrollStretchSceneProps {
  children: ReactNode;
  index: number;
  first?: boolean;
}

/**
 * Lets a section finish naturally, pins its final viewport, then lets the next
 * section pull over it through a deliberately long, scroll-linked reveal.
 */
export default function ScrollStretchScene({
  children,
  index,
  first = false,
}: ScrollStretchSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [pinTop, setPinTop] = useState(0);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setEnabled(query.matches && !reduce);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [reduce]);

  useLayoutEffect(() => {
    if (!enabled || !surfaceRef.current) {
      setPinTop(0);
      return;
    }

    const surface = surfaceRef.current;
    const measure = () => {
      // Tall sections scroll normally first, then their final viewport pins.
      setPinTop(Math.min(0, window.innerHeight - surface.offsetHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(surface);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [enabled]);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "start 28%"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["13vh", "0vh"]);
  const scaleY = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [44, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.35, 1], [0.94, 0.985, 1]);

  const shellStyle = {
    "--stretch-layer": index,
  } as CSSProperties;
  const surfaceStyle = {
    "--stretch-pin-top": `${pinTop}px`,
    ...(enabled && !first ? { y, scaleY, borderRadius: radius, opacity } : {}),
  } as CSSProperties;

  return (
    <div
      ref={sceneRef}
      className={`scroll-stretch-scene ${first ? "scroll-stretch-scene--first" : ""}`}
      style={shellStyle}
    >
      <motion.div
        ref={surfaceRef}
        className="scroll-stretch-surface"
        style={surfaceStyle}
      >
        {children}
      </motion.div>
    </div>
  );
}
