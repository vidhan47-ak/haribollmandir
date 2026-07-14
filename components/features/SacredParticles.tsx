"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
  drift: number;
  phase: number;
};

export default function SacredParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canvas || !context || reduceMotion) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let animationFrame = 0;
    let lastPaint = 0;
    let paused = document.hidden;

    const makeParticle = (fromBottom = false): Particle => ({
      x: Math.random() * width,
      y: fromBottom ? height + Math.random() * 40 : Math.random() * height,
      radius: 0.7 + Math.random() * 1.45,
      speed: 5 + Math.random() * 10,
      alpha: 0.14 + Math.random() * 0.28,
      drift: 4 + Math.random() * 10,
      phase: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const count = width < 640 ? 14 : Math.min(34, Math.round(width / 48));
      particles = Array.from({ length: count }, () => makeParticle());
    };

    const draw = (time: number) => {
      animationFrame = window.requestAnimationFrame(draw);
      if (paused || time - lastPaint < 33) return;
      const elapsed = Math.min((time - lastPaint) / 1000 || 0, 0.08);
      lastPaint = time;
      context.clearRect(0, 0, width, height);
      context.shadowColor = "rgba(245, 205, 105, 0.55)";
      context.shadowBlur = 7;

      particles.forEach((particle) => {
        particle.y -= particle.speed * elapsed;
        particle.phase += elapsed * 0.45;
        particle.x += Math.sin(particle.phase) * particle.drift * elapsed;
        if (particle.y < -20 || particle.x < -30 || particle.x > width + 30) {
          Object.assign(particle, makeParticle(true));
        }
        context.beginPath();
        context.fillStyle = `rgba(244, 207, 117, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      });
    };

    const onVisibilityChange = () => {
      paused = document.hidden;
      lastPaint = performance.now();
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} className="sacred-particles" aria-hidden="true" />;
}

