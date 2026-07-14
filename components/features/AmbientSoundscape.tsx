"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLang } from "@/lib/i18n";

type Soundscape = {
  context: AudioContext;
  master: GainNode;
  interval: number;
  drones: OscillatorNode[];
};

const FLUTE_NOTES = [293.66, 329.63, 392, 440, 392, 349.23, 329.63, 261.63];

export default function AmbientSoundscape() {
  const [playing, setPlaying] = useState(false);
  const soundscape = useRef<Soundscape | null>(null);
  const noteIndex = useRef(0);
  const reduceMotion = useReducedMotion();
  const { lang } = useLang();

  const stop = () => {
    const active = soundscape.current;
    if (!active) return;
    window.clearInterval(active.interval);
    const now = active.context.currentTime;
    active.master.gain.cancelScheduledValues(now);
    active.master.gain.setValueAtTime(Math.max(active.master.gain.value, 0.0001), now);
    active.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    window.setTimeout(() => active.context.close().catch(() => undefined), 550);
    soundscape.current = null;
    setPlaying(false);
  };

  const start = async () => {
    if (soundscape.current || !("AudioContext" in window)) return;
    const context = new AudioContext();
    await context.resume();

    const master = context.createGain();
    const filter = context.createBiquadFilter();
    const delay = context.createDelay(1);
    const feedback = context.createGain();
    const wet = context.createGain();

    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.72, context.currentTime + 1.2);
    filter.type = "lowpass";
    filter.frequency.value = 1850;
    filter.Q.value = 0.45;
    delay.delayTime.value = 0.34;
    feedback.gain.value = 0.18;
    wet.gain.value = 0.3;

    filter.connect(master);
    filter.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(master);
    master.connect(context.destination);

    const drones = [146.83, 220].map((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.018 : 0.008;
      oscillator.connect(gain);
      gain.connect(filter);
      oscillator.start();
      return oscillator;
    });

    const playFluteNote = () => {
      if (context.state !== "running") return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const vibrato = context.createOscillator();
      const vibratoDepth = context.createGain();
      const frequency = FLUTE_NOTES[noteIndex.current % FLUTE_NOTES.length];
      noteIndex.current += 1;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      vibrato.frequency.value = 5.1;
      vibratoDepth.gain.value = 1.5;
      vibrato.connect(vibratoDepth);
      vibratoDepth.connect(oscillator.frequency);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.065, now + 0.32);
      gain.gain.exponentialRampToValueAtTime(0.025, now + 1.55);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      oscillator.connect(gain);
      gain.connect(filter);
      oscillator.start(now);
      vibrato.start(now);
      oscillator.stop(now + 2.55);
      vibrato.stop(now + 2.55);
    };

    playFluteNote();
    const interval = window.setInterval(playFluteNote, 2900);
    soundscape.current = { context, master, interval, drones };
    setPlaying(true);
  };

  useEffect(() => {
    const onVisibilityChange = () => {
      const active = soundscape.current;
      if (!active) return;
      if (document.hidden) active.context.suspend().catch(() => undefined);
      else active.context.resume().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      const active = soundscape.current;
      if (active) {
        window.clearInterval(active.interval);
        active.context.close().catch(() => undefined);
        soundscape.current = null;
      }
    };
  }, []);

  const label = playing
    ? (lang === "hi" ? "ध्वनि बंद करें" : "Pause ambience")
    : (lang === "hi" ? "मंदिर की मधुर ध्वनि" : "Temple ambience");

  return (
    <motion.button
      type="button"
      onClick={playing ? stop : start}
      className={`ambient-sound-toggle ${playing ? "is-playing" : ""}`}
      aria-label={label}
      aria-pressed={playing}
      title={label}
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
        {label}
      </span>
    </motion.button>
  );
}

