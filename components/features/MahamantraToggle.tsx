"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";

const MAHAMANTRA_SRC = "/audio/mahamantra-bb-tirtha-gurudeva.mp3";

/**
 * Mahamantra player, styled to sit inside the Sadhana dock alongside the
 * Japa and Aarti launchers. Keeps the audio element, the visibility-pause
 * behaviour and the animated equalizer, but wears the dock's glass button.
 */
export default function MahamantraToggle() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reduce = useReducedMotion();
  const { lang } = useLang();

  const stop = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const start = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.62;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  useEffect(() => {
    const onVisibilityChange = () => {
      const audio = audioRef.current;
      if (document.hidden && audio && !audio.paused) {
        audio.pause();
        setPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      audioRef.current?.pause();
    };
  }, []);

  const label = playing
    ? lang === "hi" ? "महामंत्र रोकें" : "Pause Mahamantra"
    : lang === "hi" ? "महामंत्र सुनें" : "Play Mahamantra";

  return (
    <>
      <audio
        ref={audioRef}
        src={MAHAMANTRA_SRC}
        preload="none"
        loop
        onPause={() => setPlaying(false)}
      />
      <motion.button
        type="button"
        onClick={playing ? stop : start}
        className={`sadhana-dock-btn mahamantra-btn ${playing ? "is-playing" : ""}`}
        aria-label={`${label}, sung by Srila B. B. Tirtha Gurudeva`}
        aria-pressed={playing}
        title="Hare Krishna Mahamantra by Srila B. B. Tirtha Gurudeva"
        whileTap={reduce ? undefined : { scale: 0.97 }}
      >
        <span className="ambient-sound-icon" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="hidden whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.15em] sm:block">
          {playing
            ? lang === "hi" ? "रोकें" : "Pause"
            : lang === "hi" ? "महामंत्र" : "Mahamantra"}
        </span>
      </motion.button>
    </>
  );
}
