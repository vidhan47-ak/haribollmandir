"use client";

import { useEffect } from "react";
import { useLenisInstance } from "@/components/SmoothScroll";

/**
 * Side-effect-only helper: when the homepage loads with a hash in the URL
 * (e.g. arriving from "/gaudiya-heritage" via "/#about"), smooth-scroll to that
 * section once Lenis + layout have settled. Falls back to native smooth scroll
 * when Lenis is unavailable (reduced-motion).
 */
export default function HashScroll() {
  const lenis = useLenisInstance();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#") return;

    const id = window.setTimeout(() => {
      const target = document.querySelector(hash);
      if (!target) return;
      if (lenis) {
        lenis.scrollTo(target as HTMLElement, {
          offset: -84,
          duration: 1.6,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 250);

    return () => window.clearTimeout(id);
  }, [lenis]);

  return null;
}
