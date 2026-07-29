"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "hariboll_intro_splash_seen_v1";
const DISPLAY_DURATION_MS = 3000; // 3 seconds total play time before starting fade out
const FADE_DURATION_MS = 1000; // 1 second radial mask transition

export default function IntroVideoSplash() {
  // Initialize state to TRUE by default (for SSR and initial client pass)
  // so the splash overlay is in the initial HTML and paints instantly on Frame 0.
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const hasSeenIntro = sessionStorage.getItem(SESSION_KEY);
      return !prefersReducedMotion && !hasSeenIntro;
    } catch {
      return true;
    }
  });

  const [isFading, setIsFading] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if reduced motion or already seen in session
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hasSeenIntro = sessionStorage.getItem(SESSION_KEY);

    if (prefersReducedMotion || hasSeenIntro) {
      setIsVisible(false);
      document.documentElement.classList.remove("has-intro-splash");
      return;
    }

    // Detect screen width for PC vs Phone video selection
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    setIsVisible(true);

    // Lock body scroll during splash screen
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Force play video as soon as component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be deferred by browser policies, keep silent fallback
      });
    }

    // Set 4-second display timer before initiating radial fade out
    timerRef.current = setTimeout(() => {
      startFadeOut();
    }, DISPLAY_DURATION_MS);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
      document.body.style.overflow = originalOverflow;
      document.documentElement.classList.remove("has-intro-splash");
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const startFadeOut = () => {
    if (isFading) return;
    setIsFading(true);

    // Save session flag so it won't re-trigger on internal route changes
    sessionStorage.setItem(SESSION_KEY, "true");

    // Unlock body scroll as transition starts
    document.body.style.overflow = "";
    document.documentElement.classList.remove("has-intro-splash");

    fadeTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, FADE_DURATION_MS);
  };

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startFadeOut();
  };

  // Handle video loading and playing whenever visible or isMobile changes
  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Autoplay may be deferred by browser policies
      });
    }
  }, [isMobile, isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="intro-splash-overlay"
          initial={{ opacity: 1, clipPath: "circle(150% at 50% 50%)" }}
          animate={
            isFading
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
          transition={{
            duration: isFading ? FADE_DURATION_MS / 1000 : 0.3,
            ease: [0.22, 1, 0.36, 1], // devotional ease
          }}
          className="fixed inset-0 h-[100dvh] w-screen z-[99999] flex items-center justify-center bg-[#0a0607] overflow-hidden select-none pointer-events-auto"
          aria-label="Temple intro animation"
        >
          {/* Fullscreen Video Player with preload auto and native media query sources */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={startFadeOut}
            className="w-full h-full object-cover pointer-events-none"
          >
            <source
              src="/video/starting animation phone.mp4"
              type="video/mp4"
              media="(max-width: 767px)"
            />
            <source
              src="/video/starting animation pc.mp4"
              type="video/mp4"
              media="(min-width: 768px)"
            />
            <source
              src="/videos/starting animation phone.mp4"
              type="video/mp4"
              media="(max-width: 767px)"
            />
            <source
              src="/videos/starting animation pc.mp4"
              type="video/mp4"
              media="(min-width: 768px)"
            />
            {/* Default fallback for older browsers */}
            <source
              src={
                isMobile
                  ? "/video/starting animation phone.mp4"
                  : "/video/starting animation pc.mp4"
              }
              type="video/mp4"
            />
          </video>

          {/* Golden Ambient Vignette & Mask Overlay */}
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent via-[#0c0708]/20 to-[#0c0708]/80" />

          {/* Elegant Skip Intro Button */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: isFading ? 0 : 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest font-heading text-[#f3e3c3] bg-[#1a0e11]/70 hover:bg-[#2a171c] border border-[#c9a24b]/40 hover:border-[#c9a24b] rounded-full backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer"
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
