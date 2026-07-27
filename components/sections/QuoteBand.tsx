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
  // Background travels the full amplitude…
  const imageY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  // …while the quote floats slower, creating the layered-depth illusion.
  const textY = useTransform(scrollYProgress, [0, 1], [26, -26]);

  return (
    <section
      ref={sectionRef}
      data-section-mood={tone}
      className={`relative flex flex-col justify-end overflow-hidden text-cream ${
        compact
          ? "min-h-[340px] py-12 sm:min-h-[400px] sm:py-14 lg:min-h-[430px] lg:py-16"
          : "min-h-[440px] py-14 sm:min-h-[520px] sm:py-16 lg:min-h-[560px] lg:py-20"
      }`}
      style={{ backgroundColor: TONE_BASE[tone] }}
    >
      {/* deity banner — object-top keeps the face in frame near the top */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reduce ? undefined : { y: imageY, scale: 1.12 }}
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

      {/* subtle tone tint — light enough up top to keep the face visible */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: TONE_TINT[tone] }}
      />

      {/* faint floral */}
      <div className="pattern-floral pointer-events-none absolute inset-0 opacity-20" />

      {/* content pinned to the bottom, floating slower than the banner */}
      <motion.div
        className="container-temple relative z-10 will-change-transform"
        style={reduce ? undefined : { y: textY }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="font-heading text-6xl leading-none text-gold/50">
              &ldquo;
            </span>
          </Reveal>

          <p className="-mt-4 font-heading text-2xl font-medium italic leading-snug text-cream sm:text-3xl lg:text-4xl [text-shadow:0_2px_16px_rgba(0,0,0,0.7)]">
            {quote}
          </p>

          <Reveal delay={0.2}>
            <div className="divider-lotus mt-6 !via-gold-light" />
          </Reveal>

          <Reveal delay={0.3} duration={0.8}>
            <p className="mt-5 font-script text-xl text-gold-light sm:text-2xl [text-shadow:0_2px_16px_rgba(0,0,0,0.7)]">
              {subquote}
            </p>
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
}
