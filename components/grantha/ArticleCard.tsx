"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import type { ArticleRef } from "@/lib/grantha-types";
import GranthaCover, { paletteFor } from "./GranthaCover";
import BookmarkButton from "./BookmarkButton";
import { ClockIcon, ArrowRightIcon } from "./icons";
import { useLang } from "@/lib/i18n";

type CardSize = "large" | "medium" | "small";

interface ArticleCardProps {
  article: ArticleRef;
  size?: CardSize;
  index?: number;
}

const EASE = EASE_DEVOTIONAL;

/** A single sacred treasure — never presented as a file. */
export default function ArticleCard({
  article,
  size = "medium",
  index = 0,
}: ArticleCardProps) {
  const reduce = useReducedMotion();
  const { t } = useLang();
  const palette = paletteFor(article.title);

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.05, 0.3), ease: EASE }}
      className="group relative"
    >
      <Link
        href={`/grantha-mandir/read/${article.slug}`}
        className="block h-full rounded-[1.75rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        {/* `transition-all duration-700` on the most-repeated element in the
            library reached properties that cannot be composited and ran nearly
            three times the hover budget. Named properties, 240ms. */}
        <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-gold/15 bg-cream-50/70 shadow-card backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional group-hover:-translate-y-[5px] group-hover:border-gold/40 group-hover:shadow-glow">
          {/* Cover */}
          <div className="relative overflow-hidden">
            <div
              className={`${
                size === "large" ? "aspect-[16/10]" : "aspect-[16/11]"
              } w-full overflow-hidden`}
            >
              {/* 1200ms was a slow pan on a grid item a reader passes over
                  constantly; 400ms still reads as a gentle drift. */}
              <GranthaCover
                title={article.title}
                palette={palette}
                rich={size === "large"}
                className="h-full w-full scale-[1.02] transition-transform duration-[400ms] ease-devotional group-hover:scale-[1.08]"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-maroon-dark/25 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 rounded-full border border-white/40 bg-cream-50/85 px-3 py-1 font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deeper backdrop-blur">
              {article.category}
            </span>
            {/* `focus-within` keeps the bookmark reachable by keyboard — it was
                revealed on hover only. */}
            <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
              <BookmarkButton slug={article.slug} compact />
            </div>
          </div>

          {/* Body */}
          <div className={`flex flex-1 flex-col ${size === "large" ? "p-7" : "p-6"}`}>
            <p className="font-label text-[0.68rem] font-medium uppercase tracking-widest text-gold-deep">
              {article.collectionTitle}
            </p>
            <h3
              className={`mt-2 font-display font-semibold leading-tight text-maroon-dark ${
                size === "large" ? "text-2xl sm:text-[1.7rem]" : "text-xl"
              }`}
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {article.title}
            </h3>
            <p className="mt-3 line-clamp-3 font-body text-sm leading-relaxed text-ink-soft">
              {article.excerpt}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-gold/10 pt-4">
              <span className="inline-flex items-center gap-1.5 font-label text-xs text-ink-muted">
                <ClockIcon className="h-3.5 w-3.5 text-gold-deep" />
                {article.readingMinutes} {t.grantha.minRead}
              </span>
              <span className="inline-flex items-center gap-1.5 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper transition-transform duration-200 group-hover:translate-x-0.5">
                {t.grantha.read}
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
