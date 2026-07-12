"use client";

import { Fragment, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type Unit = { char: string; enlarged: boolean };

function buildWords(text: string, lang: string): Unit[][] {
  const words = text.split(" ").filter((w) => w.length > 0);
  if (lang === "en") {
    return words.map((word) =>
      Array.from(word).map((ch, i) => ({ char: ch, enlarged: i === 0 })),
    );
  }
  // Non-Latin scripts (e.g. Devanagari): keep each word whole so glyph
  // shaping and matras are never split across separate spans.
  return words.map((word) => [{ char: word, enlarged: false }]);
}

/**
 * Lotus Ripple heading.
 * - Desktop (mouse): letters near the pointer rise 2-4px with a faint golden
 *   glow, forming a gentle wave that settles smoothly on pointer leave.
 * - Mobile (touch): a tap sends one centered ripple outward across the letters.
 * - Honors prefers-reduced-motion (renders a plain static heading).
 */
export default function RippleHeading({
  text,
  lang,
  className = "",
}: {
  text: string;
  lang: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLHeadingElement>(null);

  const wordUnits = buildWords(text, lang);

  useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    if (!root) return;
    const units = Array.from(
      root.querySelectorAll<HTMLElement>(".ripple-unit"),
    );
    if (units.length === 0) return;

    const AMP = 4; // max rise in px
    const SIGMA = 50; // wave spread (how many nearby letters react)
    const RING = 46; // ripple ring thickness
    const TRANS =
      "transform 280ms cubic-bezier(0.22,1,0.36,1), text-shadow 280ms ease";
    const glow = (f: number) =>
      f > 0.02
        ? `0 0 ${(15 * f).toFixed(1)}px rgba(240,216,150,${(0.6 * f).toFixed(3)})`
        : "";

    units.forEach((u) => (u.style.transition = TRANS));

    let cx: number[] = [];
    let cy: number[] = [];
    let ox = 0;
    let oy = 0;
    let maxDist = 1;

    const measure = () => {
      const rr = root.getBoundingClientRect();
      ox = rr.left + rr.width / 2;
      oy = rr.top + rr.height / 2;
      cx = [];
      cy = [];
      maxDist = 1;
      for (const u of units) {
        const r = u.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        cx.push(x);
        cy.push(y);
        const d = Math.hypot(x - ox, y - oy);
        if (d > maxDist) maxDist = d;
      }
    };

    const setUnit = (u: HTMLElement, f: number) => {
      u.style.transform = `translateY(${(-AMP * f).toFixed(2)}px)`;
      u.style.textShadow = glow(f);
    };
    const reset = () => units.forEach((u) => setUnit(u, 0));

    // Desktop: proximity wave following the pointer.
    let raf = 0;
    let px = 0;
    let py = 0;
    const applyHover = () => {
      raf = 0;
      for (let i = 0; i < units.length; i++) {
        const dx = px - cx[i];
        const dy = py - cy[i];
        setUnit(units[i], Math.exp(-(dx * dx + dy * dy) / (2 * SIGMA * SIGMA)));
      }
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      measure();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(applyHover);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      reset();
    };

    // Mobile: one centered ripple on tap.
    let rip = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      measure();
      units.forEach((u) => (u.style.transition = "none"));
      const DURATION = 900;
      const start = performance.now();
      const step = (now: number) => {
        const p = (now - start) / DURATION;
        const radius = maxDist * Math.min(1, p / 0.7);
        const fade = p < 0.7 ? 1 : Math.max(0, 1 - (p - 0.7) / 0.3);
        for (let i = 0; i < units.length; i++) {
          const d = Math.hypot(cx[i] - ox, cy[i] - oy);
          const ring = Math.exp(-((d - radius) * (d - radius)) / (2 * RING * RING));
          setUnit(units[i], ring * fade);
        }
        if (p < 1) {
          rip = requestAnimationFrame(step);
        } else {
          units.forEach((u) => (u.style.transition = TRANS));
          reset();
          rip = 0;
        }
      };
      if (rip) cancelAnimationFrame(rip);
      rip = requestAnimationFrame(step);
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", measure);

    return () => {
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", measure);
      if (raf) cancelAnimationFrame(raf);
      if (rip) cancelAnimationFrame(rip);
    };
  }, [reduce, lang, text]);

  return (
    <h1 ref={rootRef} className={className}>
      {wordUnits.map((units, wi) => (
        <Fragment key={wi}>
          {wi > 0 ? " " : ""}
          <span className="inline-block whitespace-nowrap">
            {units.map((u, ui) => (
              <span
                key={ui}
                className={`ripple-unit inline-block align-baseline${
                  u.enlarged ? " text-[1.3em]" : ""
                }`}
              >
                {u.char}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </h1>
  );
}
