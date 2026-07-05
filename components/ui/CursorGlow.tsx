"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const SIZE = 620; // px, diameter of the glow

export default function CursorGlow() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, { stiffness: 120, damping: 30, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 120, damping: 30, mass: 0.5 });

  useEffect(() => {
    if (reduce) return;
    // Only track on devices with a fine pointer (mouse) — skip touch.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX - SIZE / 2);
      y.set(e.clientY - SIZE / 2);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y, reduce]);

  if (reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[5] hidden overflow-hidden [@media(pointer:fine)]:block"
    >
      <motion.div
        style={{
          x: sx,
          y: sy,
          width: SIZE,
          height: SIZE,
          background:
            "radial-gradient(circle, rgba(227,199,126,0.12) 0%, rgba(201,162,75,0.06) 35%, transparent 70%)",
        }}
        className="absolute left-0 top-0 rounded-full will-change-transform"
      />
    </div>
  );
}
