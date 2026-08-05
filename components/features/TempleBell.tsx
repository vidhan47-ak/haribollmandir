"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";

/**
 * Interactive Temple Bell (Ghaṇṭī): Synthesizes a rich, multi-harmonic brass bell
 * acoustic using Web Audio API so it plays instantly without loading external audio files.
 * Features realistic swinging physics and lotus spark visual feedback.
 */
export default function TempleBell({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const [ringing, setRinging] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playBellSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/audio/templebell.mp3");
      }
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.95;
      void audioRef.current.play().catch(() => {});
    } catch {
      /* ignore audio errors */
    }
  }, []);

  const ringBell = () => {
    playBellSound();
    setRinging(true);
    setTimeout(() => setRinging(false), 700);
  };

  const label = lang === "hi" ? "मंदिर की घंटी बजाएं" : "Ring Temple Bell";

  return (
    <motion.button
      type="button"
      onClick={ringBell}
      className={`sadhana-dock-btn relative overflow-visible ${className}`}
      aria-label={label}
      title={label}
      animate={ringing && !reduce ? { rotate: [0, -18, 18, -12, 12, -6, 0] } : { rotate: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileTap={reduce ? undefined : { scale: 0.95 }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#f3d78e" strokeWidth="1.6" aria-hidden="true">
        <path d="M12 3a4 4 0 0 0-4 4v3.2c0 .8-.4 1.6-1 2.1l-.8.7c-.5.5-.2 1.4.6 1.4h14.4c.8 0 1.1-.9.6-1.4l-.8-.7c-.6-.5-1-1.3-1-2.1V7a4 4 0 0 0-4-4Z" />
        <path d="M10 17.5a2 2 0 0 0 4 0" strokeLinecap="round" />
        <path d="M12 1.5v1.5" strokeLinecap="round" />
      </svg>
      <span className="hidden whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.15em] sm:block">
        {lang === "hi" ? "घंटी" : "Bell"}
      </span>

      {/* Ringing aura ripple */}
      {ringing && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 rounded-full border border-gold-light/60 pointer-events-none"
        />
      )}
    </motion.button>
  );
}
