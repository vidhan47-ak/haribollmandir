"use client";

/* ------------------------------------------------------------------ */
/*  Your Shelf — the bookmarks a devotee has saved.                    */
/*                                                                     */
/*  `toggleBookmark` has always written a slug list to localStorage,    */
/*  but nothing anywhere read it back: saving a bhajan was a dead end.  */
/*  This is the missing half. No accounts, no sync, no counts — purely  */
/*  local, matching the store's own stated intent.                      */
/* ------------------------------------------------------------------ */

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import { useGrantha } from "@/lib/grantha-store";
import type { ArticleRef } from "@/lib/grantha-types";
import GranthaCover, { paletteFor } from "./GranthaCover";
import BookmarkButton from "./BookmarkButton";
import { ArrowRightIcon } from "./icons";
import { useLang } from "@/lib/i18n";

export default function SavedShelf({ articles }: { articles: ArticleRef[] }) {
  const { bookmarks, ready } = useGrantha();
  const reduce = useReducedMotion();
  const { t } = useLang();

  // Preserve the devotee's own ordering (newest save first, as stored).
  const saved = ready
    ? bookmarks
        .map((slug) => articles.find((a) => a.slug === slug))
        .filter((a): a is ArticleRef => a !== undefined)
    : [];

  if (saved.length === 0) return null;

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.6, ease: EASE_DEVOTIONAL }}
      className="mb-16"
      aria-labelledby="saved-shelf-heading"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="eyebrow text-gold-deeper">{t.grantha.keptClose}</span>
          <h2
            id="saved-shelf-heading"
            className="mt-3 font-display text-2xl font-semibold leading-tight text-maroon-dark sm:text-3xl"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {t.grantha.yourShelf}
          </h2>
        </div>
        <p className="hidden shrink-0 font-label text-[0.65rem] uppercase tracking-wider text-ink-muted sm:block">
          {saved.length} {t.grantha.saved}
        </p>
      </div>

      <ul className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence initial={false}>
          {saved.map((article) => (
            <motion.li
              key={article.slug}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: reduce ? 0.12 : 0.28, ease: EASE_DEVOTIONAL }}
              className="w-[220px] shrink-0 snap-start sm:w-[240px]"
            >
              <div className="group relative">
                <Link
                  href={`/grantha-mandir/read/${article.slug}`}
                  className="block rounded-[1.25rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  <div className="relative overflow-hidden rounded-[1.25rem] shadow-card">
                    <GranthaCover
                      title={article.title}
                      palette={paletteFor(article.title)}
                      className="aspect-[3/4] w-full transition-transform duration-[400ms] ease-devotional group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3
                    className="mt-3 line-clamp-2 font-display text-base font-semibold leading-snug text-maroon-dark"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    {article.title}
                  </h3>
                  <p className="mt-1 truncate font-label text-[0.65rem] uppercase tracking-wider text-ink-muted">
                    {article.collectionTitle}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 font-label text-[0.65rem] font-semibold uppercase tracking-wider text-gold-deeper transition-transform duration-200 group-hover:translate-x-0.5">
                    {t.grantha.read}
                    <ArrowRightIcon className="h-3 w-3" />
                  </span>
                </Link>
                {/* Removing from the shelf is the same control that added it. */}
                <div className="absolute right-2 top-2">
                  <BookmarkButton slug={article.slug} compact />
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
}
