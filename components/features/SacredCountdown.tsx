"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SACRED_EVENTS } from "@/lib/sacred-calendar";
import { useLang } from "@/lib/i18n";

const SECOND = 1000;
const DAY = 24 * 60 * 60 * SECOND;

function parts(ms: number) {
  const safe = Math.max(0, ms);
  return {
    days: Math.floor(safe / DAY),
    hours: Math.floor((safe % DAY) / (60 * 60 * SECOND)),
    minutes: Math.floor((safe % (60 * 60 * SECOND)) / (60 * SECOND)),
    seconds: Math.floor((safe % (60 * SECOND)) / SECOND),
  };
}

export default function SacredCountdown() {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  // Start from a stable value so server and client render the same first frame.
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), SECOND);
    return () => window.clearInterval(timer);
  }, []);

  const next = useMemo(
    () => SACRED_EVENTS.find((event) => new Date(event.date).getTime() > now),
    [now],
  );

  if (!next) return null;
  const remaining = parts(new Date(next.date).getTime() - now);
  const units = lang === "hi"
    ? [["दिन", remaining.days], ["घंटे", remaining.hours], ["मिनट", remaining.minutes], ["सेकंड", remaining.seconds]]
    : [["Days", remaining.days], ["Hours", remaining.hours], ["Minutes", remaining.minutes], ["Seconds", remaining.seconds]];

  return (
    <motion.aside
      initial={reduce ? undefined : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-[1.75rem] border border-gold/35 bg-maroon-dark/70 p-5 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.8)] backdrop-blur-md sm:mt-14 sm:p-8"
      aria-label={lang === "hi" ? "अगला पावन दिवस" : "Next sacred day"}
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto] lg:gap-10">
        <div className="text-center lg:text-left">
          <p className="font-body text-[10px] font-medium uppercase tracking-widest2 text-gold-light">
            {lang === "hi" ? "अगला पावन दिवस" : "Next Sacred Day"}
          </p>
          <h3 className="mt-2 font-heading text-2xl font-semibold text-cream sm:text-3xl">
            {lang === "hi" ? next.nameHi : next.name}
          </h3>
          <p className="mt-2 font-body text-xs leading-relaxed text-cream/70 sm:text-sm">
            {lang === "hi" ? next.noteHi : next.note}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {units.map(([label, value]) => (
            <div key={String(label)} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.07] px-2 py-3 text-center sm:min-w-[76px] sm:px-4">
              <span className="block font-display text-xl font-semibold tabular-nums text-gold-light sm:text-2xl">
                {String(value).padStart(2, "0")}
              </span>
              <span className="mt-1 block font-body text-[8px] uppercase tracking-[0.14em] text-cream/55 sm:text-[9px]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-5 text-center font-body text-[9px] leading-relaxed text-cream/45 lg:text-left">
        {lang === "hi"
          ? "जालंधर के लिए वैष्णव पंचांग। अंतिम समय की पुष्टि मंदिर की घोषणा से करें।"
          : "Vaishnava calendar for Jalandhar. Please confirm final observance timings with the temple announcement."}
      </p>
    </motion.aside>
  );
}
