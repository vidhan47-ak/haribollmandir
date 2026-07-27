"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE = "a,button,[role='button'],input,textarea,select,label,summary";

/**
 * Lightweight Tulsi cursor: pointer-driven only, with no canvas or animation
 * loop.
 *
 * Replacing the native cursor is a motion decision, so it now honours
 * prefers-reduced-motion the same way SacredParticles does — previously it was
 * gated on `(pointer: fine)` alone and hid the system cursor site-wide with no
 * way to opt out.
 */
export default function TulsiCursor() {
  const [enabled, setEnabled] = useState(false);
  const leafRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const noPreference = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    );

    const update = () => setEnabled(finePointer.matches && noPreference.matches);
    update();

    finePointer.addEventListener("change", update);
    noPreference.addEventListener("change", update);
    return () => {
      finePointer.removeEventListener("change", update);
      noPreference.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const leaf = leafRef.current;
    if (!leaf) return;
    const root = document.documentElement;
    root.classList.add("tulsi-cursor-active");

    const move = (event: PointerEvent) => {
      leaf.style.transform = `translate3d(${event.clientX - 6}px, ${event.clientY - 4}px, 0)`;
      const interactive = event.target instanceof Element && !!event.target.closest(INTERACTIVE);
      leaf.classList.toggle("is-hidden", interactive);
      leaf.style.opacity = interactive ? "0" : "1";
    };
    const hide = () => { leaf.style.opacity = "0"; };
    const press = () => leaf.classList.add("is-press");
    const release = () => leaf.classList.remove("is-press");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("mouseleave", hide);
    document.addEventListener("pointerdown", press, { passive: true });
    document.addEventListener("pointerup", release, { passive: true });

    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("pointerdown", press);
      document.removeEventListener("pointerup", release);
      root.classList.remove("tulsi-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={leafRef}
      aria-hidden="true"
      className="tulsi-leaf pointer-events-none fixed left-0 top-0 z-[9999] select-none"
      style={{ opacity: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/tulsi-cursor.png"
        alt=""
        draggable={false}
        className="block h-8 w-8 select-none"
      />
    </div>
  );
}
