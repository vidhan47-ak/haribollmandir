"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "hariboll_intro_splash_seen_v2";
const FADE_MS = 600;
const SAFETY_MS = 10000; // Backup timeout only if network hangs or video fails to load

type Phase = "init" | "play" | "fade" | "done";

export default function IntroVideoSplash() {
  const [phase, setPhase] = useState<Phase>("init");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const t of timers.current) clearTimeout(t);
    timers.current = [];
  }, []);

  /** Start the radial fade-out, unlock scroll, persist session flag. */
  const fade = useCallback(() => {
    setPhase((prev) => {
      if (prev === "fade" || prev === "done") return prev;
      return "fade";
    });
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("has-intro-splash");
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  /** Completely remove the overlay from the DOM. */
  const teardown = useCallback(() => {
    setPhase("done");
    clearTimers();
  }, [clearTimers]);

  // ── Client initialization ──
  useEffect(() => {
    try {
      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        sessionStorage.getItem(SESSION_KEY)
      ) {
        document.body.style.overflow = "";
        document.documentElement.classList.remove("has-intro-splash");
        setPhase("done");
        return;
      }
    } catch {
      /* ignore */
    }

    setPhase("play");
  }, []);

  // ── "play" phase: lock scroll, play video, set safety fallback ──
  useEffect(() => {
    if (phase !== "play") return;

    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("has-intro-splash");

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const p = videoRef.current.play();
      if (p !== undefined) {
        p.catch((err) => {
          console.warn("Video play fallback:", err);
          fade(); // Instant fallback if autoplay is blocked by browser policy
        });
      }
    }

    // Safety fallback timer in case video fails to load or stalls indefinitely
    timers.current.push(
      setTimeout(() => {
        fade();
        setTimeout(teardown, FADE_MS);
      }, SAFETY_MS),
    );

    return clearTimers;
  }, [phase, fade, teardown, clearTimers]);

  // ── "fade" phase: remove overlay after the clip-path animation finishes ──
  useEffect(() => {
    if (phase !== "fade") return;
    timers.current.push(setTimeout(teardown, FADE_MS));
    return clearTimers;
  }, [phase, teardown, clearTimers]);

  // ── Render ──
  if (phase === "init" || phase === "done") return null;

  return (
    <AnimatePresence>
      {(phase === "play" || phase === "fade") && (
        <motion.div
          key="intro-splash-overlay"
          initial={{ opacity: 1, clipPath: "circle(150% at 50% 50%)" }}
          animate={
            phase === "fade"
              ? {
                  clipPath: "circle(0% at 50% 50%)",
                  opacity: 0,
                  scale: 0.98,
                }
              : {
                  clipPath: "circle(150% at 50% 50%)",
                  opacity: 1,
                  scale: 1,
                }
          }
          exit={{ opacity: 0 }}
          transition={{
            duration: phase === "fade" ? FADE_MS / 1000 : 0.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 h-[100dvh] w-screen z-[99999] flex items-center justify-center bg-[#18110b] overflow-hidden select-none pointer-events-auto"
          aria-label="Temple intro animation"
        >
          {/* Warm devotional background fill */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 pointer-events-none bg-hero-warm"
            aria-hidden="true"
          />

          {/* ── Video with native media queries ── */}
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={fade}
            onError={fade}
            className="w-full h-full object-cover pointer-events-none relative z-0"
          >
            <source
              src="/video/starting-animation-phone.mp4"
              media="(max-width: 767px)"
              type="video/mp4"
            />
            <source
              src="/video/starting-animation-pc.mp4"
              media="(min-width: 768px)"
              type="video/mp4"
            />
            <source src="/video/starting-animation-pc.mp4" type="video/mp4" />
          </video>

          {/* ── Vignette ── */}
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-[#0c0708]/20 to-[#0c0708]/80 z-10" />

          {/* ── Skip button ── */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: phase === "fade" ? 0 : 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            onClick={() => {
              clearTimers();
              fade();
            }}
            className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-heading text-[#f3e3c3] bg-[#1a0e11]/80 hover:bg-[#2a171c] border border-[#c9a24b]/40 hover:border-[#c9a24b] rounded-full backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer"
          >
            <span>Skip Intro</span>
            <svg
              className="w-3.5 h-3.5 text-[#c9a24b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
