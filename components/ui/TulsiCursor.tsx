"use client";

import { useEffect, useRef, useState } from "react";

const LIFE = 750; // ms — how long a falling particle lasts before it fades out
const GRAVITY = 0.05; // downward acceleration, applied per ~16ms frame
const EMIT_EVERY = 26; // px of pointer travel between drops (sparse = subtle)
const FOLLOW = 0.65; // leaf position easing per frame (1 = instant)
const TIP = { x: 6, y: 4 }; // where the leaf's pointed tip sits inside the 32px icon

/* Particles must never appear over cards / text / media / controls — only over
   open background. This is the list of "content" elements to skip emission on. */
const CONTENT_SELECTOR =
  "header,a,button,input,textarea,select,label,p,h1,h2,h3,h4,h5,h6,li,img,svg,article,figure,blockquote,[class*='card']";

export default function TulsiCursor() {
  const [enabled, setEnabled] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const leafRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceRef = useRef(false);

  // Enable only on real mouse pointers (skip touch); remember reduced-motion.
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const leaf = leafRef.current;
    const inner = innerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!leaf || !inner || !canvas || !ctx) return;

    const root = document.documentElement;
    root.classList.add("tulsi-cursor-active");

    const particlesOn = !reduceRef.current;

    let cssW = window.innerWidth;
    let cssH = window.innerHeight;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = window.innerWidth;
      cssH = window.innerHeight;
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Pt = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
    };
    const pts: Pt[] = [];
    const target = { x: cssW / 2, y: cssH / 2 };
    let cx = target.x;
    let cy = target.y;
    let lastX = target.x;
    let lastY = target.y;
    let acc = 0;
    let shown = false;

    const overContent = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest(CONTENT_SELECTOR);

    const spawn = (x: number, y: number) => {
      // A tiny seed falls from the lower body / stem of the leaf.
      pts.push({
        x: x + 8 + Math.random() * 8,
        y: y + 12 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.2 + Math.random() * 0.4,
        life: 1,
        size: 0.8 + Math.random() * 1.3,
      });
      if (pts.length > 140) pts.splice(0, pts.length - 140);
    };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        shown = true;
        cx = target.x;
        cy = target.y;
        lastX = target.x;
        lastY = target.y;
        leaf.style.opacity = "1";
      }
      if (particlesOn) {
        const dist = Math.hypot(target.x - lastX, target.y - lastY);
        if (overContent(e.target)) {
          acc = 0; // never shed particles over cards / text / media
        } else {
          acc += dist;
          if (acc >= EMIT_EVERY) {
            acc = 0;
            spawn(target.x, target.y);
          }
        }
      }
      lastX = target.x;
      lastY = target.y;
    };
    const hide = () => {
      leaf.style.opacity = "0";
    };
    const show = () => {
      if (shown) leaf.style.opacity = "1";
    };
    const onDown = () => inner.classList.add("is-press");
    const onUp = () => inner.classList.remove("is-press");
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const interactive = !!t?.closest?.(
        "a,button,[role='button'],input,textarea,select,label,summary",
      );
      inner.classList.toggle("is-hover", interactive);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mouseover", onOver, { passive: true });

    let raf = 0;
    let last = performance.now();
    const render = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      const step = dt / 16;

      cx += (target.x - cx) * FOLLOW;
      cy += (target.y - cy) * FOLLOW;
      leaf.style.transform = `translate3d(${cx - TIP.x}px, ${cy - TIP.y}px, 0)`;

      ctx.clearRect(0, 0, cssW, cssH);
      if (particlesOn && pts.length) {
        ctx.fillStyle = "#6fae4a";
        for (let i = pts.length - 1; i >= 0; i--) {
          const p = pts[i];
          p.vy += GRAVITY * step;
          p.x += p.vx * step;
          p.y += p.vy * step;
          p.life -= dt / LIFE;
          if (p.life <= 0) {
            pts.splice(i, 1);
            continue;
          }
          ctx.globalAlpha = p.life * 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseover", onOver);
      root.classList.remove("tulsi-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9998]"
      />
      <div
        ref={leafRef}
        aria-hidden="true"
        className="tulsi-leaf pointer-events-none fixed left-0 top-0 z-[9999] select-none"
        style={{ opacity: 0 }}
      >
        <div ref={innerRef} className="tulsi-leaf__inner">
          {imgOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/tulsi-cursor.png"
              alt=""
              draggable={false}
              onError={() => setImgOk(false)}
              className="block h-8 w-8 select-none"
            />
          ) : (
            <TulsiLeafSVG />
          )}
        </div>
      </div>
    </>
  );
}

function TulsiLeafSVG() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className="block"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tulsiLeafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8ccf4e" />
          <stop offset="1" stopColor="#3c8a2c" />
        </linearGradient>
      </defs>
      <path
        d="M5 5c9-2 20 4 22 20C18 27 4 20 5 5Z"
        fill="url(#tulsiLeafGrad)"
        stroke="#2c661f"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path d="M7 7 24 24" stroke="#e7f6d5" strokeWidth="0.9" opacity="0.7" />
      <path
        d="M12 10.5 10.5 14M16 13 13.5 16.5M19.5 16 17 19.5"
        stroke="#2c661f"
        strokeWidth="0.6"
        opacity="0.45"
        fill="none"
      />
      <path
        d="M26 25c1.6 1.8 2.6 3.6 3.4 5.6"
        stroke="#5aa542"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
