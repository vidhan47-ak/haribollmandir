"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import type { Palette } from "@/lib/images";

type Tone = "maroon" | "forest" | "gold";

interface QuoteBandProps {
  quote: string;
  subquote: string;
  imageSrc: string;
  imageLabel: string;
  imagePalette: Palette;
  tone?: Tone;
  compact?: boolean;
  focusRight?: boolean;
}

/** Subtle colour wash per tone (keeps the devotional mood). */
const TONE_TINT: Record<Tone, string> = {
  maroon: "linear-gradient(135deg,#6E1E2A,#4A1219)",
  forest: "linear-gradient(135deg,#234437,#152B22)",
  gold: "linear-gradient(135deg,#5c3915,#2a1607)",
};

/** Solid dark fallback colour behind the image per tone. */
const TONE_BASE: Record<Tone, string> = {
  maroon: "#4A1219",
  forest: "#152B22",
  gold: "#2a1607",
};

/**
 * Full-bleed devotional quote band, banner style: the deity image fills the
 * band (object-top keeps the face in frame near the top), a bottom-weighted
 * dark scrim keeps the quote legible, and the quote + script sub-line are
 * pinned to the BOTTOM so the face stays clear.
 *
 * Depth: the banner image drifts with scroll while the quote floats at a
 * slower speed above it — two layers, transform/opacity only, so the effect
 * stays compositor-driven at 60fps. Reduced-motion collapses both to rest.
 */
export default function QuoteBand({
  quote,
  subquote,
  imageSrc,
  imageLabel,
  imagePalette,
  tone = "maroon",
  compact = false,
  focusRight = false,
}: QuoteBandProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() === true;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // ------------------------------------------------------------------
  //  3D Focal Parallax Depth-Stack Transforms
  // ------------------------------------------------------------------
  // 1. Back Layer (0.2x relative speed): Deity artwork moves slowly
  const backY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const backScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1.12, 1.06]);

  // 2. Middle Layer (0.6x speed): Golden lotus frame & radial aura bloom
  const midY = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const auraScale = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.85, 1.18, 0.85]);
  const auraOpacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 0.85, 0]);

  // 3. Front Layer (1.3x speed): Sanskrit text & translation float forward
  const frontY = useTransform(scrollYProgress, [0, 1], [45, -45]);
  const frontScale = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0.94, 1.06, 0.94]);
  const frontOpacity = useTransform(scrollYProgress, [0.15, 0.45, 0.55, 0.85], [0.55, 1, 1, 0.55]);

  return (
    <section
      ref={sectionRef}
      data-section-mood={tone}
      className={`relative flex flex-col justify-end overflow-hidden text-cream [perspective:1000px] ${
        compact
          ? "min-h-[340px] py-12 sm:min-h-[400px] sm:py-14 lg:min-h-[430px] lg:py-16"
          : "min-h-[440px] py-14 sm:min-h-[520px] sm:py-16 lg:min-h-[560px] lg:py-20"
      }`}
      style={{ backgroundColor: TONE_BASE[tone] }}
    >
      {/* LAYER 1: BACK LAYER (0.2x speed) — Deity Banner */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reduce ? undefined : { y: backY, scale: backScale }}
      >
        <FallbackImage
          src={imageSrc}
          alt=""
          label={imageLabel}
          palette={imagePalette}
          loading="lazy"
          className={focusRight
            ? "h-full w-full object-cover object-[68%_top] sm:object-top"
            : "h-full w-full object-cover object-top"}
        />
      </motion.div>

      {/* Subtle tone tint wash */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: TONE_TINT[tone] }}
      />

      {/* LAYER 2: MIDDLE LAYER (0.6x speed) — Golden Lotus Frame & Radial Aura Ring */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center will-change-transform"
        style={reduce ? undefined : { y: midY, opacity: auraOpacity, scale: auraScale }}
      >
        <div className="h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(240,216,150,0.28)_0%,rgba(201,162,75,0.12)_45%,transparent_70%)] blur-md" />
        <div className="absolute h-[520px] w-[520px] rounded-full border border-gold/20 opacity-40 animate-spin-slow" />
      </motion.div>

      {/* Faint floral pattern */}
      <div className="pattern-floral pointer-events-none absolute inset-0 opacity-20" />

      {/* LAYER 3: FRONT LAYER (1.3x speed) — Sanskrit & Translation Float-Forward Text */}
      <motion.div
        className="container-temple relative z-10 will-change-transform [transform-style:preserve-3d]"
        style={
          reduce
            ? undefined
            : {
                y: frontY,
                scale: frontScale,
                opacity: frontOpacity,
              }
        }
      >
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="font-heading text-6xl leading-none text-gold/70 drop-shadow-[0_0_16px_rgba(201,162,75,0.6)]">
              &ldquo;
            </span>
          </Reveal>

          <p className="-mt-4 font-heading text-2xl font-medium italic leading-snug text-cream sm:text-3xl lg:text-4xl [text-shadow:0_0_35px_rgba(240,216,150,0.65),0_4px_24px_rgba(0,0,0,0.9)]">
            {quote}
          </p>

          <Reveal delay={0.2}>
            <div className="divider-lotus mt-6 !via-gold-light" />
          </Reveal>

          <Reveal delay={0.3} duration={0.8}>
            <p className="mt-5 font-script text-xl text-gold-light sm:text-2xl [text-shadow:0_0_25px_rgba(201,162,75,0.7),0_2px_16px_rgba(0,0,0,0.85)]">
              {subquote}
            </p>
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
}
