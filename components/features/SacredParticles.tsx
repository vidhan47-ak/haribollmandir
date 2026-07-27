"use client";

import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  phase: number;
  fill: string; // pre-computed so the draw loop never builds strings
};

/** Sparse golden motes tuned to stay inexpensive during scrolling. */
export default function SacredParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const touch = window.matchMedia("(pointer: coarse)").matches;
    const lowMemory =
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory !==
        undefined &&
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4;
    const frameInterval = touch || lowMemory ? 80 : 50;
    let width = 0;
    let height = 0;
    let motes: Mote[] = [];
    let frame = 0;
    let lastPaint = 0;
    let paused = document.hidden;

    const createMote = (below = false): Mote => {
      const alpha = 0.2 + Math.random() * 0.3;
      return {
        x: Math.random() * width,
        y: below ? height + 8 : Math.random() * height,
        size: 0.7 + Math.random() * 1.2,
        speed: 4 + Math.random() * 7,
        alpha,
        phase: Math.random() * Math.PI * 2,
        fill: `rgba(245, 211, 123, ${alpha})`,
      };
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      motes = Array.from(
        { length: touch || lowMemory ? (lowMemory ? 6 : 8) : 16 },
        () => createMote(),
      );
    };

    const draw = (time: number) => {
      frame = window.requestAnimationFrame(draw);
      if (paused || time - lastPaint < frameInterval) return;
      const elapsed = Math.min((time - lastPaint) / 1000 || 0, 0.1);
      lastPaint = time;
      context.clearRect(0, 0, width, height);

      for (const mote of motes) {
        mote.y -= mote.speed * elapsed;
        mote.phase += elapsed * 0.35;
        mote.x += Math.sin(mote.phase) * 2.2 * elapsed;
        if (mote.y < -8) Object.assign(mote, createMote(true));
        context.beginPath();
        context.fillStyle = mote.fill;
        context.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        context.fill();
      }
    };

    const visibility = () => {
      paused = document.hidden;
      lastPaint = performance.now();
    };

    // Defer the first frame past initial paint so the hero wins the race
    // for main-thread time on slower devices.
    let startTimer = 0;
    let idleHandle = 0;
    const start = () => {
      resize();
      window.addEventListener("resize", resize, { passive: true });
      document.addEventListener("visibilitychange", visibility);
      frame = window.requestAnimationFrame(draw);
    };
    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(start, { timeout: 2500 });
    } else {
      startTimer = window.setTimeout(start, 1200);
    }

    return () => {
      if (idleHandle) window.cancelIdleCallback?.(idleHandle);
      window.clearTimeout(startTimer);
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="sacred-particles" aria-hidden="true" />;
}
