"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL, spring } from "@/lib/springs";
import { useGrantha } from "@/lib/grantha-store";
import { BookmarkIcon } from "./icons";
import { useLang } from "@/lib/i18n";

interface BookmarkButtonProps {
  slug: string;
  className?: string;
  /** Compact icon-only variant used on cards. */
  compact?: boolean;
}

/**
 * Tracks whether `active` became true because the DEVOTEE pressed the button,
 * as opposed to because localStorage finished hydrating.
 *
 * The celebration used to be bound to `active` alone. Since `active` is
 * `ready && isBookmarked(slug)`, it flipped false → true on hydration for every
 * already-bookmarked card on the page — so opening the library fired a
 * petal-burst on each saved item with no user action at all. An animation needs
 * a reason, and "the store just loaded" is not one.
 */
function useCelebrateOnUserSave(active: boolean, ready: boolean): boolean {
  const [celebrate, setCelebrate] = useState(false);
  const previous = useRef<boolean | null>(null);

  useEffect(() => {
    if (!ready) return;

    // First observation after hydration establishes the baseline silently.
    if (previous.current === null) {
      previous.current = active;
      return;
    }

    if (active && !previous.current) setCelebrate(true);
    if (!active) setCelebrate(false);
    previous.current = active;
  }, [active, ready]);

  return celebrate;
}

/** Bookmark toggle with a gentle petal-burst confirmation. */
export default function BookmarkButton({
  slug,
  className = "",
  compact = false,
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, ready } = useGrantha();
  const active = ready && isBookmarked(slug);
  const reduce = useReducedMotion();
  const { t } = useLang();
  const celebrate = useCelebrateOnUserSave(active, ready);

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleBookmark(slug);
        }}
        aria-pressed={active}
        aria-label={active ? t.grantha.removeBookmark : t.grantha.addBookmark}
        className={`group press-nudge relative grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-cream-50/80 text-gold-deep backdrop-blur transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-0.5 hover:border-gold hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${className}`}
      >
        <BurstOnActive active={celebrate} reduce={!!reduce} />
        <motion.span
          key={active ? "on" : "off"}
          // 0.6 is far outside the 0.9–0.97 band — nothing in the world
          // appears at 60% of its size, so it read as a pop rather than a press.
          initial={reduce ? false : { scale: 0.94 }}
          animate={{ scale: 1 }}
          transition={reduce ? { duration: 0 } : spring.snappy}
        >
          <BookmarkIcon filled={active} className="h-4 w-4" />
        </motion.span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleBookmark(slug)}
      aria-pressed={active}
      className={`group press-nudge relative inline-flex items-center gap-2 rounded-full border border-gold/50 bg-cream-50/70 px-5 py-3 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper backdrop-blur transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-0.5 hover:border-gold hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${className}`}
    >
      <BurstOnActive active={celebrate} reduce={!!reduce} />
      <BookmarkIcon filled={active} className="h-4 w-4" />
      {active ? t.grantha.savedLabel : t.grantha.bookmark}
    </button>
  );
}

function BurstOnActive({ active, reduce }: { active: boolean; reduce: boolean }) {
  if (reduce) return null;
  return (
    <AnimatePresence>
      {active && (
        <motion.span
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-gold"
                initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                animate={{
                  x: Math.cos(angle) * 16,
                  y: Math.sin(angle) * 16,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{ duration: 0.55, ease: EASE_DEVOTIONAL }}
              />
            );
          })}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
