"use client";

import type { ReactNode } from "react";

export function useSmoothScrollTo() {
  return (selector: string, offset = -84) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  };
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return children;
}
