"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import FallbackImage from "@/components/ui/FallbackImage";
import type { Palette } from "@/lib/images";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Warm cream→gold surface. Kept fairly opaque (no backdrop-blur) so text stays
   readable and the page does not have to recomposite expensive blur layers. */
const CARD_SURFACE =
  "border border-gold/45 rounded-[1.75rem] shadow-[0_20px_60px_rgba(60,35,10,0.28)]";
const CARD_STYLE = {
  backgroundImage:
    "linear-gradient(135deg, rgba(255,244,222,0.96), rgba(233,205,150,0.92))",
} as const;

interface HeritageSectionProps {
  index: string;
  side: "left" | "right";
  title: string;
  children: ReactNode;
  imageSrc: string;
  imageLabel: string;
  imagePalette: Palette;
}

/**
 * A heritage block. On desktop (lg+) a large golden number badge sits in the
 * top corner; its content card (with a tall image) is anchored to the top of
 * the block and slides in on hover — so it only ever grows DOWNWARD and never
 * spills up into the hero / previous section. On mobile it is a tap-to-toggle
 * accordion.
 */
export default function HeritageSection({
  index,
  side,
  title,
  children,
  imageSrc,
  imageLabel,
  imagePalette,
}: HeritageSectionProps) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const isLeft = side === "left";

  const imageBlock = (
    <div className="shrink-0 lg:w-[38%]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-gold/40 shadow-[0_12px_36px_rgba(60,35,10,0.22)]">
        <FallbackImage
          src={imageSrc}
          alt={imageLabel}
          label={imageLabel}
          palette={imagePalette}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );

  const textBlock = (
    <div className="flex-1">
      <h3 className="font-heading text-2xl font-semibold text-maroon-dark lg:text-3xl">
        {title}
      </h3>
      <div className="mt-4 space-y-4 font-body leading-relaxed text-ink-soft">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* ---------------- DESKTOP (lg+) — hover-reveal slide card ---------- */}
      <div className="group relative z-0 hidden hover:z-40 lg:block lg:min-h-[9rem]">
        {/* Content card — anchored to the TOP so it only grows downward, never
            up into the hero. Slides in horizontally on hover. */}
        <div
          className={`absolute top-0 z-20 w-[90%] opacity-0 transition-[transform,opacity] duration-700 ease-devotional pointer-events-none group-hover:translate-x-0 group-hover:opacity-100 group-hover:pointer-events-auto ${
            isLeft ? "left-0 -translate-x-6" : "right-0 translate-x-6"
          }`}
        >
          <article
            className={`${CARD_SURFACE} p-7 lg:p-9 ${
              isLeft ? "lg:pl-28" : "lg:pr-28"
            }`}
            style={CARD_STYLE}
          >
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center">
              {isLeft ? (
                <>
                  {textBlock}
                  {imageBlock}
                </>
              ) : (
                <>
                  {imageBlock}
                  {textBlock}
                </>
              )}
            </div>
          </article>
        </div>

        {/* Golden number badge — top corner, always visible */}
        <div className={`absolute top-0 z-30 ${isLeft ? "left-0" : "right-0"}`}>
          <div
            className="flex h-20 w-20 items-center justify-center rounded-[1.25rem] border border-gold/50 shadow-[0_10px_30px_rgba(60,35,10,0.25)] transition-[transform,box-shadow] duration-500 ease-devotional group-hover:scale-105 group-hover:shadow-[0_0_44px_rgba(201,162,75,0.6)]"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(255,241,207,0.9), rgba(217,168,79,0.55))",
            }}
          >
            <span className="font-display text-4xl font-bold text-gold-deep transition-colors duration-500 [text-shadow:0_2px_10px_rgba(201,162,75,0.35)] group-hover:text-gold lg:text-5xl">
              {index}
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- MOBILE (below lg) — accordion --------------------- */}
      <div className="lg:hidden">
        <div
          className="overflow-hidden rounded-[1.5rem] border border-gold/45 shadow-[0_16px_44px_rgba(60,35,10,0.22)]"
          style={CARD_STYLE}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center gap-4 px-5 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/50 bg-white/40 font-display text-xl font-bold text-gold-deep">
              {index}
            </span>
            <span className="flex-1 font-heading text-lg font-semibold text-maroon-dark">
              {title}
            </span>
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 shrink-0 text-gold-deep transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {reduce ? (
            open && (
              <div className="px-5 pb-6">
                <div className="border-t border-gold/25 pt-5">
                  <div className="mb-5">{imageBlock}</div>
                  <div className="space-y-4 font-body leading-relaxed text-ink-soft">
                    {children}
                  </div>
                </div>
              </div>
            )
          ) : (
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-6">
                    <div className="border-t border-gold/25 pt-5">
                      <div className="mb-5">{imageBlock}</div>
                      <div className="space-y-4 font-body leading-relaxed text-ink-soft">
                        {children}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}
