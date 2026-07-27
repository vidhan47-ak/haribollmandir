"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import { useGrantha } from "@/lib/grantha-store";
import { FlameIcon } from "./icons";
import { useLang } from "@/lib/i18n";

/** A subtle, non-competitive reading streak badge. */
export default function ReadingStreakBadge() {
  const { streak, ready } = useGrantha();
  const reduce = useReducedMotion();
  const { t } = useLang();

  if (!ready || streak.count < 1) return null;

  // Gentle milestone wording — never aggressive.
  const milestone =
    streak.count >= 30
      ? t.grantha.streakMonth
      : streak.count >= 14
        ? t.grantha.streakFortnight
        : streak.count >= 7
          ? t.grantha.streakWeek
          : t.grantha.streak;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE_DEVOTIONAL }}
      className="inline-flex items-center gap-2.5 rounded-full border border-gold/30 bg-cream-50/70 px-4 py-2 shadow-soft backdrop-blur"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-gold/15 text-gold-deeper">
        <FlameIcon className="h-4 w-4" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-label text-[0.6rem] font-semibold uppercase tracking-widest text-gold-deep">
          {milestone}
        </span>
        <span
          className="font-display text-sm font-semibold text-maroon-dark"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {streak.count} {streak.count === 1 ? t.grantha.day : t.grantha.days}
        </span>
      </span>
    </motion.div>
  );
}
