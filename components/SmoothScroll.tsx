"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const LenisContext = createContext<Lenis | null>(null);

/** Access the active Lenis instance (null when reduced-motion is on). */
export const useLenisInstance = () => useContext(LenisContext);

/**
 * Smoothly scroll to an element by CSS selector, using Lenis when
 * available and falling back to native smooth scroll otherwise.
 */
export function useSmoothScrollTo() {
  const lenis = useLenisInstance();
  return (selector: string, offset = -84) => {
    const el = document.querySelector(selector);
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el as HTMLElement, {
        offset,
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const touchFirst = window.matchMedia("(pointer: coarse)").matches;

    // Native scrolling is faster and more reliable on touch devices.
    if (prefersReduced || touchFirst) return;

    const instance = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      smoothWheel: true,
    });

    setLenis(instance);

    let rafId = 0;
    const raf = (time: number) => {
      instance.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
