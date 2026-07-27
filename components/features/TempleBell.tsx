"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";

/**
 * A hanging temple ghanti in the hero. Clicking it swings the bell, rings a
 * WebAudio-synthesised chime (no asset needed) and releases a ripple of
 * golden sparks — the traditional gesture of announcing one's arrival.
 */

const SPARKS = [
  { x: -46, y: -34 },
  { x: -24, y: -58 },
  { x: 4, y: -66 },
  { x: 30, y: -54 },
  { x: 48, y: -30 },
  { x: -12, y: -48 },
];

function ringChime(ctx: AudioContext) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  // Quieter on phones, which are usually held closer and in public places.
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  master.gain.setValueAtTime(coarse ? 0.32 : 0.5, now);
  master.connect(ctx.destination);

  // A temple bell is a stack of inharmonic partials with long decay.
  const partials: [number, number, number][] = [
    // [frequency, peak gain, decay seconds]
    [523.25, 0.55, 2.6],
    [1046.5, 0.32, 2.0],
    [1567.98, 0.18, 1.5],
    [2093.0, 0.1, 1.1],
    [698.46, 0.12, 1.8],
  ];
  partials.forEach(([freq, peak, decay]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + decay + 0.1);
  });

  // A short bright strike transient so the chime has a "clang" onset.
  const strike = ctx.createOscillator();
  const strikeGain = ctx.createGain();
  strike.type = "triangle";
  strike.frequency.setValueAtTime(2800, now);
  strike.frequency.exponentialRampToValueAtTime(1400, now + 0.06);
  strikeGain.gain.setValueAtTime(0.25, now);
  strikeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  strike.connect(strikeGain).connect(master);
  strike.start(now);
  strike.stop(now + 0.12);
}

export default function TempleBell() {
  const { lang } = useLang();
  const [ringing, setRinging] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);
  const resetTimer = useRef(0);
  const bellRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    return () => {
      window.clearTimeout(resetTimer.current);
      audioCtx.current?.close().catch(() => {});
    };
  }, []);

  /**
   * Rings the bell, restarting an in-flight swing.
   *
   * A CSS @keyframes animation restarts from zero rather than retargeting from
   * where it currently is, so re-ringing mid-swing used to need a
   * setRinging(false) → requestAnimationFrame → setRinging(true) dance: two
   * extra React renders per tap purely to make the browser notice the class had
   * been removed and re-added. Seeking the running animations back to 0 with
   * the Web Animations API does the same job directly, with no render churn and
   * no dropped frame between the two commits.
   */
  const ring = () => {
    try {
      audioCtx.current ??= new AudioContext();
      if (audioCtx.current.state === "suspended") void audioCtx.current.resume();
      ringChime(audioCtx.current);
    } catch {
      // The swing animation still answers the gesture without audio.
    }

    window.clearTimeout(resetTimer.current);

    const running = bellRef.current
      ?.getAnimations?.({ subtree: true })
      ?.filter((animation) => animation.playState !== "idle");

    if (ringing && running && running.length > 0) {
      for (const animation of running) {
        animation.currentTime = 0;
        void animation.play();
      }
    } else {
      setRinging(true);
    }

    resetTimer.current = window.setTimeout(() => setRinging(false), 2600);
  };

  return (
    <button
      ref={bellRef}
      type="button"
      onClick={ring}
      className={`temple-bell ${ringing ? "is-ringing" : ""}`}
      aria-label={lang === "hi" ? "मंदिर की घंटी बजाएँ" : "Ring the temple bell"}
      title={lang === "hi" ? "घंटी बजाएँ" : "Ring the bell"}
    >
      <span className="temple-bell-rope" aria-hidden="true" />
      <svg
        className="temple-bell-body h-12 w-12 sm:h-14 sm:w-14"
        viewBox="0 0 48 52"
        fill="none"
        aria-hidden="true"
      >
        {/* Crown loop */}
        <path d="M24 2c-2.6 0-4.4 1.7-4.4 4h8.8c0-2.3-1.8-4-4.4-4Z" fill="#8A5A1F" />
        {/* Dome */}
        <path
          d="M24 6C14.5 6 9 13.5 9 23.5c0 5.4-1.6 8.6-3.6 10.6-.9.9-.3 2.4 1 2.4h35.2c1.3 0 1.9-1.5 1-2.4-2-2-3.6-5.2-3.6-10.6C39 13.5 33.5 6 24 6Z"
          fill="url(#bellGold)"
          stroke="#8A5A1F"
          strokeWidth="1.2"
        />
        {/* Rim */}
        <rect x="7.5" y="36.5" width="33" height="4" rx="2" fill="#A8842F" stroke="#6E4A1D" strokeWidth="0.8" />
        {/* Clapper */}
        <circle cx="24" cy="45.5" r="4.2" fill="#8A5A1F" stroke="#5C3A12" strokeWidth="1" />
        <rect x="22.8" y="38" width="2.4" height="5" fill="#6E4A1D" />
        {/* Sheen */}
        <path d="M16 11c-2.8 2.4-4.6 6.2-5 10.5" stroke="rgba(255,244,214,0.75)" strokeWidth="1.6" strokeLinecap="round" />
        <defs>
          <linearGradient id="bellGold" x1="9" y1="6" x2="39" y2="37" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F0D48A" />
            <stop offset="0.5" stopColor="#C9A24B" />
            <stop offset="1" stopColor="#9A7127" />
          </linearGradient>
        </defs>
      </svg>
      <span className="bell-ripple" aria-hidden="true" />
      <span className="bell-ripple" aria-hidden="true" />
      <span className="bell-ripple" aria-hidden="true" />
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="bell-spark"
          style={{ "--spark-x": `${s.x}px`, "--spark-y": `${s.y}px` } as React.CSSProperties}
          aria-hidden="true"
        />
      ))}
    </button>
  );
}
