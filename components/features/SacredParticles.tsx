"use client";

import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  phase: number;
};

/** Sparse golden motes tuned to stay inexpensive during scrolling. */
export default function SacredParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const touch = window.matchMedia("(pointer: coarse)").matches;
    const frameInterval = touch ? 80 : 50;
    let width = 0;
    let height = 0;
    let motes: Mote[] = [];
    let frame = 0;
    let lastPaint = 0;
    let paused = document.hidden;

    const createMote = (below = false): Mote => ({
      x: Math.random() * width,
      y: below ? height + 8 : Math.random() * height,
      size: 0.7 + Math.random() * 1.2,
      speed: 4 + Math.random() * 7,
      alpha: 0.2 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      motes = Array.from({ length: touch ? 8 : 16 }, () => createMote());
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
        context.fillStyle = `rgba(245, 211, 123, ${mote.alpha})`;
        context.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
        context.fill();
      }
    };

    const visibility = () => {
      paused = document.hidden;
      lastPaint = performance.now();
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    frame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="sacred-particles" aria-hidden="true" />;
}
