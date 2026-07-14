"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";

const MAHAMANTRA_SRC = "/audio/mahamantra-bb-tirtha-gurudeva.mp3";

export default function AmbientSoundscape() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reduceMotion = useReducedMotion();
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
    ? (lang === "hi" ? "महामंत्र रोकें" : "Pause Mahamantra")
    : (lang === "hi" ? "महामंत्र सुनें" : "Play Mahamantra");

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
        className={`ambient-sound-toggle ${playing ? "is-playing" : ""}`}
        aria-label={`${label}, sung by Srila B. B. Tirtha Gurudeva`}
        aria-pressed={playing}
        title="Hare Krishna Mahamantra by Srila B. B. Tirtha Gurudeva"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="ambient-sound-icon" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="hidden whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.15em] sm:block">
          {playing ? "Pause Mahamantra" : "Mahamantra"}
        </span>
      </motion.button>
    </>
  );
}
