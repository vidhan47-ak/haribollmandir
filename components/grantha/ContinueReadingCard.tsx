"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import { useGrantha } from "@/lib/grantha-store";
import GranthaCover, { paletteFor } from "./GranthaCover";
import { ArrowRightIcon } from "./icons";
import { useLang } from "@/lib/i18n";

const EASE = EASE_DEVOTIONAL;

/** "Continue Reading" — the last article the devotee opened, if any. */
export default function ContinueReadingCard() {
  const { continueReading, clearContinue, ready } = useGrantha();
  const reduce = useReducedMotion();
  const { t } = useLang();

  const progress = continueReading
    ? Math.min(1, Math.max(0.02, continueReading.progress))
    : 0;

  return (
    <AnimatePresence>
      {ready && continueReading && (
        <motion.section
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-16"
        >
          <Link
            href={`/grantha-mandir/read/${continueReading.slug}`}
            className="group flex items-center gap-5 overflow-hidden rounded-[1.75rem] border border-gold/20 bg-cream-50/70 p-4 shadow-soft backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-[3px] hover:border-gold/45 hover:shadow-glow sm:p-5"
          >
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl shadow-card sm:h-24 sm:w-20">
              <GranthaCover
                title={continueReading.title}
                palette={paletteFor(continueReading.title)}
                className="h-full w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deeper">
                {t.grantha.continueReading}
              </p>
              <h3
                className="mt-1 truncate font-display text-xl font-semibold text-maroon-dark"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {continueReading.title}
              </h3>
              <p className="mt-0.5 truncate font-body text-sm text-ink-soft">
                {continueReading.collectionTitle}
              </p>
              {/* Progress.
                  This bar used to render straight at its final width and never
                  move — the one moment where a little motion actually carries
                  information ("here is how far you got") was the one moment with
                  none. It now grows from the left on `scaleX`, which is a
                  compositor-only property, rather than animating `width`. */}
              <div className="mt-3 h-1 w-full max-w-xs overflow-hidden rounded-full bg-gold/15">
                <motion.div
                  className="h-full origin-left rounded-full bg-gold-gradient"
                  style={{ width: "100%" }}
                  initial={reduce ? { scaleX: progress } : { scaleX: 0 }}
                  animate={{ scaleX: progress }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.75, delay: 0.15, ease: EASE }
                  }
                />
              </div>
              <p className="sr-only">
                {Math.round(progress * 100)}% read
              </p>
            </div>

            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-maroon-gradient px-5 py-2.5 font-label text-xs font-semibold uppercase tracking-wider text-cream transition-transform duration-200 group-hover:translate-x-0.5 sm:inline-flex">
              {t.grantha.resume}
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </span>
          </Link>

          <button
            type="button"
            onClick={clearContinue}
            className="mt-2 font-label text-[0.65rem] uppercase tracking-wider text-ink-muted transition-colors duration-200 hover:text-maroon"
          >
            {t.grantha.dismiss}
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
