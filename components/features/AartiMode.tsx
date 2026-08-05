"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import FallbackImage from "@/components/ui/FallbackImage";
import { images } from "@/lib/images";
import { useLang } from "@/lib/i18n";
import { EASE_DEVOTIONAL, spring } from "@/lib/springs";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Aarti mode: a fullscreen darkened sanctum where a ghee-lamp flame follows
 * the devotee's finger or cursor, so they can circle it before Sri Sri
 * Radha Madhav Ji as in a real aarti offering.
 */
export default function AartiMode() {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [moved, setMoved] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // A gentle lag makes the flame feel carried rather than glued to the hand.
  // Touch gets a tighter spring — the visible lag of the desktop tuning reads
  // as latency when the flame chases a finger. Resolved once (matchMedia is a
  // layout read, so keep it out of the render path).
  const springConfig = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches
      ? { stiffness: 520, damping: 40, mass: 0.4 }
      : { stiffness: 260, damping: 28, mass: 0.6 },
  ).current;
  const x = useSpring(rawX, springConfig);
  const y = useSpring(rawY, springConfig);

  useEffect(() => {
    // Lets the navbar (or any other surface) begin the aarti directly.
    const openFromEvent = () => setOpen(true);
    window.addEventListener("hariboll:open-aarti", openFromEvent);
    return () => window.removeEventListener("hariboll:open-aarti", openFromEvent);
  }, []);

  useEffect(() => {
    if (!open) return;

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight * 0.72;
    rawX.set(startX);
    rawY.set(startY);
    x.jump(startX);
    y.jump(startY);
    setMoved(false);

    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key === "Tab") {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
        );
        if (focusable.length === 0) {
          event.preventDefault();
          dialogRef.current?.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }

      const step = event.shiftKey ? 48 : 24;
      const movement: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const delta = movement[event.key];
      if (!delta) return;

      event.preventDefault();
      rawX.set(Math.min(window.innerWidth - 24, Math.max(24, rawX.get() + delta[0])));
      rawY.set(Math.min(window.innerHeight - 24, Math.max(24, rawY.get() + delta[1])));
      setMoved(true);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      const launcher = launcherRef.current;
      window.requestAnimationFrame(() => {
        if (launcher?.isConnected) launcher.focus();
      });
    };
  }, [open, rawX, rawY, x, y]);

  const onPointerMove = (event: React.PointerEvent) => {
    rawX.set(event.clientX);
    rawY.set(event.clientY);
    setMoved(true);
  };

  const instructions = lang === "hi"
    ? "दीपक को भगवान के समक्ष गोलाकार घुमाएँ। कीबोर्ड पर तीर कुंजियों का उपयोग करें।"
    : "Move the lamp in slow circles before the Lord, or use the arrow keys.";

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        className="sadhana-dock-btn"
        aria-label={lang === "hi" ? "आरती मोड खोलें" : "Open aarti mode"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="aarti-dialog"
        title={lang === "hi" ? "आरती" : "Aarti"}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#f3d78e" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 3c1.8 2.6 1.8 4.8 0 6.6C10.2 7.8 10.2 5.6 12 3Z" fill="#f3d78e" stroke="none" />
          <path d="M6.5 13h11l-1.2 3.6a4 4 0 0 1-3.8 2.9h-1a4 4 0 0 1-3.8-2.9L6.5 13Z" />
          <path d="M4.5 13h15" strokeLinecap="round" />
        </svg>
        <span className="hidden whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.15em] sm:block">
          {lang === "hi" ? "आरती" : "Aarti"}
        </span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={dialogRef}
                id="aarti-dialog"
                className="aarti-stage fixed inset-0 z-[99999] flex flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_30%,#2a1208_0%,#160707_55%,#090304_100%)] p-4 sm:p-6"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={reduce ? { duration: 0 } : spring.gentle}
                role="dialog"
                aria-modal="true"
                aria-labelledby="aarti-title"
                aria-describedby="aarti-instructions"
                tabIndex={-1}
                onPointerMove={onPointerMove}
                onPointerDown={onPointerMove}
              >
                <p id="aarti-instructions" className="sr-only">
                  {instructions}
                </p>

                {/* 1. Header Bar (Flex shrink-0, stays at the top above image) */}
                <header className="relative z-20 flex shrink-0 items-start justify-between gap-4 pb-2">
                  <div className="min-w-0 flex-1">
                    <p id="aarti-title" className="font-body text-xs font-semibold uppercase tracking-widest2 text-gold-light sm:text-sm">
                      {lang === "hi" ? "श्री श्री राधा माधव आरती" : "Sri Sri Radha Madhav Aarti"}
                    </p>
                    <AnimatePresence>
                      {!moved && (
                        <motion.p
                          initial={reduce ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={reduce ? undefined : { opacity: 0 }}
                          transition={{ delay: reduce ? 0 : 0.8, duration: reduce ? 0 : 0.8 }}
                          className="mt-1 font-body text-xs leading-relaxed text-cream/85 sm:text-sm"
                          aria-hidden="true"
                        >
                          {instructions}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    className="shrink-0 rounded-full border border-cream/35 bg-black/50 px-3.5 py-1.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-cream transition hover:bg-black/80 hover:border-cream/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light backdrop-blur-md"
                    style={{ cursor: "pointer" }}
                    aria-label={lang === "hi" ? "आरती मोड बंद करें" : "Close aarti mode"}
                  >
                    {lang === "hi" ? "समापन" : "Close"}
                  </button>
                </header>

                {/* 2. Main Sanctum Stage (Flex-1 min-h-0, centers image below header) */}
                <main className="pointer-events-none relative flex flex-1 min-h-0 items-center justify-center py-2 sm:py-4">
                  <motion.div
                    initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: reduce ? 0 : 1.1, ease: EASE_DEVOTIONAL }}
                    className="relative aspect-[4/5] h-full max-h-[calc(100vh-140px)] w-auto max-w-sm sm:max-w-md overflow-hidden rounded-t-[8rem] sm:rounded-t-[10rem] rounded-b-3xl border border-gold/40 shadow-[0_0_120px_-30px_rgba(255,170,60,0.55)]"
                  >
                    <FallbackImage
                      src={images.radhaMadhav.src}
                      alt={images.radhaMadhav.alt}
                      label={images.radhaMadhav.label}
                      palette={images.radhaMadhav.palette}
                      className="h-full w-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#160707]/70 via-transparent to-[#160707]/35" />
                  </motion.div>
                </main>

                {/* 3. The offered flame, carried by the devotee */}
                <motion.div
                  className="aarti-flame"
                  style={{ x: reduce ? rawX : x, y: reduce ? rawY : y }}
                  aria-hidden="true"
                >
                  <div className="aarti-flame-glow" />
                  <div className="aarti-flame-tongue" />
                  <div className="aarti-wick-cup" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
