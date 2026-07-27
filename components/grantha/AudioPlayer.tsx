"use client";

/* ------------------------------------------------------------------ */
/*  Minimal floating audio player. Narration is a future feature, so   */
/*  the player only mounts when a src exists; otherwise it stays out    */
/*  of the way entirely. Play · pause · speed · progress · time.        */
/* ------------------------------------------------------------------ */

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import { PlayIcon, PauseIcon, HeadphonesIcon } from "./icons";

const SPEEDS = [1, 1.25, 1.5, 0.75] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${`${s}`.padStart(2, "0")}`;
}

export default function AudioPlayer({
  title,
  src,
}: {
  title: string;
  src?: string;
}) {
  const reduce = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  // No narration yet — render nothing rather than a dead control.
  if (!src) return null;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  };

  const cycleSpeed = () => {
    const nextIndex = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(nextIndex);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[nextIndex];
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setCurrent(value);
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_DEVOTIONAL }}
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-md sm:inset-x-auto sm:right-6"
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-4 rounded-full border border-gold/30 bg-cream-50/85 px-4 py-3 shadow-card backdrop-blur-xl">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause narration" : "Play narration"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-gradient text-maroon-dark shadow-soft transition-transform duration-300 hover:scale-105"
        >
          {playing ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-label text-[0.7rem] font-semibold uppercase tracking-wider text-gold-deeper">
            <HeadphonesIcon className="mr-1.5 inline h-3.5 w-3.5" />
            {title}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-label text-[0.65rem] tabular-nums text-ink-muted">
              {formatTime(current)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={current}
              onChange={seek}
              aria-label="Seek"
              className="grantha-range h-1 flex-1 cursor-pointer appearance-none rounded-full bg-gold/25"
            />
            <span className="font-label text-[0.65rem] tabular-nums text-ink-muted">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={cycleSpeed}
          aria-label="Playback speed"
          className="shrink-0 rounded-full border border-gold/30 px-2.5 py-1 font-label text-[0.7rem] font-semibold text-gold-deeper transition-colors hover:border-gold"
        >
          {SPEEDS[speedIndex]}×
        </button>
      </div>
    </motion.div>
  );
}
