"use client";

/* ------------------------------------------------------------------ */
/*  A single collection (Bhagavat Patrika issue, book, …) presented    */
/*  as its own reading room: a cover, a beautiful table of contents,   */
/*  and every article listed as a treasure — never a file list.        */
/* ------------------------------------------------------------------ */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import type { GranthaCollection, ArticleRef } from "@/lib/grantha-types";
import GranthaBackground from "./GranthaBackground";
import GranthaCover, { paletteFor } from "./GranthaCover";
import BookmarkButton from "./BookmarkButton";
import {
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  DownloadIcon,
  HeadphonesIcon,
} from "./icons";
import LotusMark from "@/components/ui/LotusMark";

import { useLang } from "@/lib/i18n";

const EASE = EASE_DEVOTIONAL;

interface CollectionContentProps {
  collection: GranthaCollection;
  articles: ArticleRef[];
  totalMinutes: number;
}

export default function CollectionContent({
  collection,
  articles,
  totalMinutes,
}: CollectionContentProps) {
  const reduce = useReducedMotion();
  const { t } = useLang();
  const palette = paletteFor(collection.title);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <GranthaBackground />

      <div className="container-temple pt-28 pb-24 sm:pt-32">
        {/* Back to library */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/grantha-mandir"
            className="link-underline inline-flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Grantha Mandir
          </Link>
        </motion.div>

        {/* -------------------------------------------------- Issue header */}
        <section className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="mx-auto w-full max-w-xs lg:mx-0"
          >
            <div className="overflow-hidden rounded-[1.5rem] border border-gold/25 shadow-card">
              <GranthaCover
                title={collection.title}
                palette={palette}
                rich
                label={collection.issue ?? collection.year}
                className="aspect-[100/132] w-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            className="flex flex-col justify-center"
          >
            <span className="eyebrow text-gold-deeper">
              {collection.kind === "patrika"
                ? t.grantha.patrikaArchive
                : t.grantha.collection}
            </span>
            <h1
              className="mt-5 font-display text-4xl font-semibold leading-[1.05] text-maroon-dark sm:text-5xl lg:text-[3.5rem]"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              {collection.subtitle ?? collection.title}
            </h1>
            {collection.subtitle && (
              <p className="mt-2 font-label text-sm uppercase tracking-widest text-gold-deep">
                {collection.title}
              </p>
            )}
            <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-ink-soft">
              {collection.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 font-label text-xs uppercase tracking-wider text-ink-muted">
              {collection.year && (
                <span className="text-gold-deeper">{collection.year}</span>
              )}
              {collection.issue && <span>{collection.issue}</span>}
              <span>{articles.length} articles</span>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-gold-deep" />
                {totalMinutes} min
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {articles[0] && (
                <Link
                  href={`/grantha-mandir/read/${articles[0].slug}`}
                  className="btn-gold"
                >
                  {t.grantha.beginReading}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
              <BookmarkButton slug={`collection:${collection.slug}`} />
              {collection.pdfUrl && (
                <a
                  href={collection.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-cream-50/70 px-5 py-3 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper backdrop-blur transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-0.5 hover:border-gold hover:shadow-glow"
                >
                  <DownloadIcon className="h-4 w-4" />
                  {collection.pdfLabel || t.grantha.originalPdf}
                </a>
              )}
            </div>
          </motion.div>
        </section>

        {/* -------------------------------------------------- Table of contents */}
        <section className="mt-20">
          <div className="flex items-center gap-4">
            <LotusMark className="h-6 w-6 text-gold-deep" />
            <h2
              className="font-display text-2xl font-semibold text-maroon-dark sm:text-3xl"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Table of Contents
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
          </div>

          <ol className="mt-8 space-y-4">
            {articles.map((article, i) => (
              <motion.li
                key={article.slug}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.6,
                  delay: Math.min(i * 0.04, 0.24),
                  ease: EASE,
                }}
              >
                <Link
                  href={`/grantha-mandir/read/${article.slug}`}
                  className="group flex items-center gap-5 rounded-2xl border border-gold/15 bg-cream-50/60 p-5 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-[3px] hover:border-gold/40 hover:shadow-glow sm:gap-7 sm:p-6"
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/30 font-display text-lg text-gold-deeper"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deep">
                      {article.category}
                    </p>
                    <h3
                      className="mt-1 truncate font-display text-xl font-semibold text-maroon-dark"
                      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                    >
                      {article.title}
                    </h3>
                    <p className="mt-1 truncate font-body text-sm text-ink-muted">
                      {article.author}
                    </p>
                  </div>
                  <span className="hidden shrink-0 items-center gap-1.5 font-label text-xs text-ink-muted sm:inline-flex">
                    <ClockIcon className="h-3.5 w-3.5 text-gold-deep" />
                    {article.readingMinutes} {t.grantha.min}
                  </span>
                  <ArrowRightIcon className="h-5 w-5 shrink-0 text-gold-deep transition-transform duration-500 group-hover:translate-x-1" />
                </Link>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* future audio narration note */}
        <p className="mt-14 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-cream-50/50 px-4 py-2 font-label text-[0.7rem] uppercase tracking-wider text-ink-muted">
          <HeadphonesIcon className="h-4 w-4 text-gold-deep" />
          Audio narration coming soon
        </p>
      </div>
    </main>
  );
}
