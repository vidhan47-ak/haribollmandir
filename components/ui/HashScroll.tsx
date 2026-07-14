"use client";

import { useEffect } from "react";

/**
 * Side-effect-only helper: when the homepage loads with a hash in the URL
 * (e.g. arriving from "/gaudiya-heritage" via "/#about"), smooth-scroll to that
 * section once Lenis + layout have settled. Falls back to native smooth scroll
 * when Lenis is unavailable (reduced-motion).
 */
export default function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#") return;

    const id = window.setTimeout(() => {
      const target = document.querySelector(hash);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({ top, behavior: "smooth" });
    }, 250);

    return () => window.clearTimeout(id);
  }, []);

  return null;
}
