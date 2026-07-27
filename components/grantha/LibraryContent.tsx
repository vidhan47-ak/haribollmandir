"use client";

/* ------------------------------------------------------------------ */
/*  Grantha Mandir — the library floor.                                */
/*                                                                     */
/*  Hero · global search · animated filters · featured Patrika ·       */
/*  recently added rail · masonry archive · collections · continue.    */
/*  Every piece filters live off a single search + filter state.       */
/* ------------------------------------------------------------------ */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import type {
  ArticleRef,
  ContentKind,
  GranthaCollection,
  LibraryFilter,
} from "@/lib/grantha-types";
import { LIBRARY_FILTERS } from "@/lib/grantha-types";
import GranthaBackground from "./GranthaBackground";
import GranthaCover, { paletteFor } from "./GranthaCover";
import ArticleCard from "./ArticleCard";
import BookmarkButton from "./BookmarkButton";
import ContinueReadingCard from "./ContinueReadingCard";
import ReadingStreakBadge from "./ReadingStreakBadge";
import SavedShelf from "./SavedShelf";
import {
  SearchIcon,
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "./icons";
import LotusMark from "@/components/ui/LotusMark";
import { useLang, type Lang } from "@/lib/i18n";

const EASE = EASE_DEVOTIONAL;

interface LibraryContentProps {
  collections: GranthaCollection[];
  articles: ArticleRef[];
  featured?: ArticleRef;
  recent: ArticleRef[];
}

/** Maps each library filter pill to the articles it should surface. */
function matchesFilter(article: ArticleRef, filter: LibraryFilter): boolean {
  switch (filter) {
    case "All":
      return true;
    case "Bhagavat Patrika":
      return article.kind === "patrika";
    case "Books":
      return article.kind === "book";
    case "Lectures":
      return article.kind === "lecture";
    case "Articles":
      return article.kind === "article";
    case "Kirtans":
      return article.kind === "kirtan";
    case "Festival Special":
      return article.tags.some((t) =>
        ["Festivals", "Rath Yatra", "Jagannath", "Ekadashi"].includes(t),
      );
    case "Jagannath":
      return article.tags.includes("Jagannath");
    case "Gaura Lila":
      return article.tags.includes("Mahaprabhu");
    case "Radha Krishna":
      return article.tags.some((t) => ["Radha", "Krishna", "Rasa"].includes(t));
    case "Guru Tattva":
      return article.tags.includes("Guru Tattva");
    case "Bhakti":
      return article.tags.includes("Bhakti");
    case "Harinam":
      return article.tags.includes("Harinam");
    default:
      return true;
  }
}

/**
 * Filters that name a *bound volume / issue* rather than an individual piece.
 * When one of these is active (with no free-text query), the library shows the
 * collections themselves as entries — a shelf of books, or a run of Patrika
 * issues — and opening one reveals its table of contents. The per-piece
 * filters (Kirtans, Lectures, Articles) and search still list articles.
 */
const COLLECTION_FILTER_KIND: Partial<Record<LibraryFilter, ContentKind>> = {
  Books: "book",
  "Bhagavat Patrika": "patrika",
};

function matchesQuery(article: ArticleRef, q: string): boolean {
  if (!q) return true;
  const haystack = [
    article.title,
    article.author,
    article.category,
    article.collectionTitle,
    article.excerpt,
    ...article.tags,
    // Romanised Devanāgarī, so an English query ("madhav") finds माधव bhajans.
    article.roman ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

export default function LibraryContent({
  collections,
  articles,
  featured,
  recent,
}: LibraryContentProps) {
  const reduce = useReducedMotion();
  const { t, lang } = useLang();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<LibraryFilter>("All");

  const filtersRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = filtersRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollFilters = (dir: 1 | -1) => {
    const el = filtersRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir * Math.max(160, el.clientWidth * 0.7),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const isSearching = query.trim().length > 0 || filter !== "All";

  // A "Books" / "Bhagavat Patrika" pill (with no text query) browses whole
  // volumes, not their contents. Text search always drops back to articles so
  // a reader can still find a single bhajan or chapter inside the books.
  const collectionKind = COLLECTION_FILTER_KIND[filter];
  const showCollectionEntries =
    collectionKind !== undefined && query.trim().length === 0;

  const filtered = useMemo(
    () =>
      articles.filter(
        (a) => matchesFilter(a, filter) && matchesQuery(a, query.trim()),
      ),
    [articles, filter, query],
  );

  // Collections of the active volume-kind, each with a live article count
  // (collections arrive with their `articles` stripped, so count from the
  // flat article list instead).
  const entryCollections = useMemo(() => {
    if (!collectionKind) return [];
    const counts = new Map<string, number>();
    for (const a of articles) {
      counts.set(a.collectionSlug, (counts.get(a.collectionSlug) ?? 0) + 1);
    }
    return collections
      .filter((c) => c.kind === collectionKind)
      .map((c) => ({ collection: c, count: counts.get(c.slug) ?? 0 }));
  }, [collections, articles, collectionKind]);

  // Group the visible collections for the "Collections" shelves.
  const visibleCollections = useMemo(() => {
    const visibleSlugs = new Set(filtered.map((a) => a.collectionSlug));
    return collections
      .map((c) => ({
        collection: c,
        items: filtered.filter((a) => a.collectionSlug === c.slug),
      }))
      .filter((group) => visibleSlugs.has(group.collection.slug));
  }, [collections, filtered]);

  /* Which of the three mutually exclusive views is on screen. Used as an
     AnimatePresence key so switching a filter crossfades instead of teleporting
     — `AnimatePresence` was imported here and never used. */
  const branch = showCollectionEntries
    ? `entries:${filter}`
    : isSearching
      ? "results"
      : "default";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <GranthaBackground />

      {/* ---------------------------------------------------------- Hero */}
      <section className="relative">
        <div className="container-temple pt-32 pb-14 sm:pt-40 sm:pb-16 text-center">
          <GranthaHeroBackdrop reduce={!!reduce} />

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="eyebrow justify-center text-gold-deeper"
          >
            {t.grantha.eyebrow}
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className="relative mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-maroon-dark sm:text-7xl lg:text-[5.25rem]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {t.grantha.title}
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mx-auto mt-6 max-w-2xl font-body text-base leading-relaxed text-ink-soft sm:text-lg"
          >
            A timeless collection of Gaudiya Vaishnava literature, Bhagavat
            Patrika, sacred books, lectures and devotional wisdom.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.24 }}
            className="mt-8 flex justify-center"
          >
            <div className="divider-lotus w-52" />
          </motion.div>
        </div>
      </section>

      {/* --------------------------------------------- Sticky search + filters */}
      <div className="sticky top-[4.5rem] z-30">
        <div className="container-temple">
          <div className="rounded-[1.75rem] border border-gold/20 bg-cream-50/80 p-4 shadow-soft backdrop-blur-xl sm:p-5">
            {/* Search.
                The focus indicator used to be an ANIMATED boxShadow, skipped
                entirely under reduced motion — combined with `focus:outline-none`
                on the input that left reduced-motion keyboard users with no
                visible focus state at all (WCAG 2.4.7). It is now a plain
                `focus-within` ring in CSS: always present, motion-independent. */}
            <div className="grantha-search flex items-center gap-3 rounded-full bg-white/70 px-5 py-3.5">
              <SearchIcon className="h-5 w-5 shrink-0 text-gold-deep" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.grantha.searchPlaceholder}
                aria-label={t.grantha.searchLabel}
                className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink-muted focus:outline-none sm:text-base"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="shrink-0 font-label text-xs uppercase tracking-wider text-ink-muted transition-colors duration-200 hover:text-maroon"
                >
                  {t.grantha.clear}
                </button>
              )}
            </div>

            {/* Filters — horizontally scrollable; edge fades + arrows reveal more topics */}
            <div className="relative mt-4">
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-cream-50 to-transparent transition-opacity duration-200 ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
              />
              <button
                type="button"
                onClick={() => scrollFilters(-1)}
                aria-label={t.grantha.scrollLeft}
                tabIndex={canScrollLeft ? 0 : -1}
                className={`press-nudge absolute left-0 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-cream-50 text-gold-deep shadow-soft transition-opacity duration-200 hover:text-maroon focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:grid ${canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
              </button>

              <div
                ref={filtersRef}
                className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {LIBRARY_FILTERS.map((f) => {
                  const active = filter === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      aria-pressed={active}
                      className={`relative shrink-0 rounded-full px-4 py-2 font-label text-xs font-semibold tracking-wide transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                        active
                          ? "text-cream"
                          : "text-ink-soft hover:text-maroon"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="grantha-filter-pill"
                          className="absolute inset-0 rounded-full bg-maroon-gradient shadow-soft"
                          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative z-10">{f}</span>
                    </button>
                  );
                })}
              </div>

              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-cream-50 to-transparent transition-opacity duration-200 ${canScrollRight ? "opacity-100" : "opacity-0"}`}
              />
              <button
                type="button"
                onClick={() => scrollFilters(1)}
                aria-label={t.grantha.scrollRight}
                tabIndex={canScrollRight ? 0 : -1}
                className={`press-nudge absolute right-0 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-gold/40 bg-cream-50 text-gold-deep shadow-soft transition-opacity duration-200 hover:text-maroon focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:grid ${canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-temple pb-32 pt-14">
        {/* -------------------------------------------------- Continue reading */}
        <ContinueReadingCard />

        {/* ---------------------------------------------------- Saved bhajans */}
        <SavedShelf articles={articles} />

        {/* The three views used to swap instantly. A short blur-masked crossfade
            makes the change legible without delaying the content. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={branch}
            initial={reduce ? false : { opacity: 0, filter: "blur(2px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(2px)" }}
            transition={{ duration: reduce ? 0.12 : 0.24, ease: EASE }}
          >
            {showCollectionEntries ? (
              <CollectionEntries
                entries={entryCollections}
                filter={filter}
                reduce={!!reduce}
              />
            ) : isSearching ? (
              <SearchResults results={filtered} query={query} reduce={!!reduce} />
            ) : (
              <>
                {/* ------------------------------------------------ Featured */}
                {featured && <FeaturedPatrika article={featured} reduce={!!reduce} />}

                {/* ------------------------------------------ Recently added */}
                {recent.length > 0 && (
                  <RecentlyAdded articles={recent} reduce={!!reduce} />
                )}

                {/* --------------------------------------------- Collections */}
                <section className="mt-24">
                  <SectionLabel
                    eyebrow={t.grantha.theArchive}
                    title={t.grantha.collections}
                    subtitle={t.grantha.collectionsNote}
                  />
                  <div className="mt-12 space-y-20">
                    {visibleCollections.map(({ collection, items }, i) => (
                      <CollectionShelf
                        key={collection.slug}
                        collection={collection}
                        items={items}
                        index={i}
                        reduce={!!reduce}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle floating streak badge */}
      <ReadingStreakBadge />
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero backdrop — faded manuscript + slow motes                      */
/* ------------------------------------------------------------------ */

function GranthaHeroBackdrop({ reduce }: { reduce: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        left: `${8 + ((i * 97) % 84)}%`,
        top: `${12 + ((i * 53) % 70)}%`,
        size: 4 + (i % 3) * 3,
        delay: (i % 5) * 1.2,
        duration: 9 + (i % 4) * 3,
      })),
    [],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center"
      aria-hidden="true"
    >
      {/* Faded ancient manuscript illustration */}
      <svg
        viewBox="0 0 400 260"
        className="w-[min(90vw,44rem)] opacity-[0.09]"
        fill="none"
      >
        <rect
          x="60"
          y="30"
          width="280"
          height="200"
          rx="10"
          stroke="#6E1E2A"
          strokeWidth="1.4"
        />
        <rect
          x="74"
          y="44"
          width="252"
          height="172"
          rx="6"
          stroke="#C9A24B"
          strokeWidth="1"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={i}
            x1="96"
            y1={70 + i * 16}
            x2="304"
            y2={70 + i * 16}
            stroke="#6B5A4E"
            strokeWidth="0.8"
          />
        ))}
        {/* lotus ornaments at the corners */}
        <g stroke="#C9A24B" strokeWidth="1.1" strokeLinecap="round">
          <path d="M200 6c3 6 3 14 0 20-3-6-3-14 0-20Z" />
          <path d="M200 234c3 6 3 14 0 20-3-6-3-14 0-20Z" />
        </g>
      </svg>

      {/* Nine drifting motes. These were nine INFINITE Framer Motion `y`
          animations, i.e. nine main-thread rAF loops running for the whole
          session on every Grantha route. As predetermined, never-interrupted
          motion they belong in CSS, where the compositor owns them. */}
      {!reduce &&
        particles.map((p, i) => (
          <span
            key={i}
            className="grantha-mote absolute rounded-full bg-gold/40"
            style={
              {
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                "--mote-duration": `${p.duration}s`,
                "--mote-delay": `${p.delay}s`,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Featured Bhagavat Patrika                                          */
/* ------------------------------------------------------------------ */

function FeaturedPatrika({
  article,
  reduce,
}: {
  article: ArticleRef;
  reduce: boolean;
}) {
  const palette = paletteFor(article.title);
  const { t } = useLang();
  return (
    <section className="mt-4">
      <SectionLabel eyebrow={t.grantha.featured} title={t.grantha.featuredPatrika} />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="group mt-10 grid gap-8 overflow-hidden rounded-[2.25rem] border border-gold/20 bg-cream-50/70 p-6 shadow-card backdrop-blur-sm sm:p-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-12 lg:p-10"
      >
        <div className="relative overflow-hidden rounded-[1.75rem] shadow-arch">
          <GranthaCover
            title={article.title}
            palette={palette}
            rich
            className="aspect-[3/4] w-full transition-transform duration-[400ms] ease-devotional group-hover:scale-[1.05]"
          />
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-gold/40 bg-white/60 px-3 py-1 font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deeper">
              {article.collectionTitle}
            </span>
            <span className="font-label text-xs uppercase tracking-widest text-ink-muted">
              {article.category}
            </span>
          </div>

          <h3
            className="mt-5 font-display text-3xl font-semibold leading-tight text-maroon-dark sm:text-4xl"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {article.title}
          </h3>

          <p className="mt-4 max-w-xl font-body leading-relaxed text-ink-soft">
            {article.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-label text-xs uppercase tracking-wider text-ink-muted">
            {article.published && <span>{article.published}</span>}
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4 text-gold-deep" />
              {article.readingMinutes} {t.grantha.minRead}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={`/grantha-mandir/read/${article.slug}`} className="btn-gold">
              {t.grantha.readNow}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <BookmarkButton slug={article.slug} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Recently added — horizontal snap rail                              */
/* ------------------------------------------------------------------ */

function RecentlyAdded({
  articles,
  reduce,
}: {
  articles: ArticleRef[];
  reduce: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const { t } = useLang();

  const nudge = (dir: 1 | -1) => {
    railRef.current?.scrollBy({
      left: dir * 380,
      // Honour the OS preference instead of always smooth-scrolling.
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <section className="mt-24">
      <div className="flex items-end justify-between gap-4">
        <SectionLabel eyebrow={t.grantha.freshNectar} title={t.grantha.recentlyAdded} align="left" />
        <div className="hidden shrink-0 gap-2 sm:flex">
          <RailButton onClick={() => nudge(-1)} label="Scroll left">
            <ArrowLeftIcon className="h-4 w-4" />
          </RailButton>
          <RailButton onClick={() => nudge(1)} label="Scroll right">
            <ArrowRightIcon className="h-4 w-4" />
          </RailButton>
        </div>
      </div>

      <div
        ref={railRef}
        className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {articles.map((article, i) => (
          <motion.div
            key={article.slug}
            initial={reduce ? false : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: Math.min(i * 0.06, 0.3), ease: EASE }}
            className="w-[300px] shrink-0 snap-start sm:w-[340px]"
          >
            <ArticleCard article={article} size="large" index={i} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function RailButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="press-nudge grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-cream-50/70 text-gold-deep backdrop-blur transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-0.5 hover:border-gold hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Collection shelf — an issue/book with a masonry of its articles    */
/* ------------------------------------------------------------------ */

function CollectionShelf({
  collection,
  items,
  index,
  reduce,
}: {
  collection: GranthaCollection;
  items: ArticleRef[];
  index: number;
  reduce: boolean;
}) {
  const { t } = useLang();
  const palette = paletteFor(collection.title);
  const href =
    collection.kind === "patrika"
      ? `/grantha-mandir/issue/${collection.slug}`
      : `/grantha-mandir/read/${items[0]?.slug ?? ""}`;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, ease: EASE }}
      className="[content-visibility:auto] [contain-intrinsic-size:auto_760px]"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,17rem)_1fr] lg:gap-12">
        {/* Collection spine */}
        <div className="lg:sticky lg:top-56 lg:self-start">
          <Link href={href} className="group block">
            <div className="relative overflow-hidden rounded-[1.5rem] shadow-card">
              <GranthaCover
                title={collection.title}
                palette={palette}
                rich
                className="aspect-[3/4] w-full transition-transform duration-[400ms] ease-devotional group-hover:scale-[1.05]"
              />
            </div>
          </Link>
          <h3
            className="mt-5 font-display text-2xl font-semibold leading-tight text-maroon-dark"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {collection.title}
          </h3>
          {collection.description && (
            <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft">
              {collection.description}
            </p>
          )}
          <Link
            href={href}
            className="mt-4 inline-flex items-center gap-1.5 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper transition-transform duration-200 hover:translate-x-0.5"
          >
            {t.grantha.openCollection}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Masonry of articles — capped at 6 so shelves stay scannable */}
        <div className="columns-1 gap-6 sm:columns-2 [&>*]:mb-6 [&>*]:break-inside-avoid">
          {items.slice(0, 6).map((article, i) => (
            <ArticleCard
              key={article.slug}
              article={article}
              size={i === 0 ? "large" : "medium"}
              index={i}
            />
          ))}
        </div>
        {items.length > 6 && (
          <div className="mt-6 sm:col-start-2">
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper transition-transform duration-200 hover:translate-x-0.5"
            >
              {t.grantha.viewAll} {items.length} →
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collection entries — a shelf of whole books / Patrika issues.      */
/*  Shown when the "Books" or "Bhagavat Patrika" pill is active so the */
/*  reader browses volumes as objects; opening one reveals its         */
/*  table of contents (never a flat wall of every article inside).     */
/* ------------------------------------------------------------------ */

function CollectionEntries({
  entries,
  filter,
  reduce,
}: {
  entries: { collection: GranthaCollection; count: number }[];
  filter: LibraryFilter;
  reduce: boolean;
}) {
  const { t } = useLang();
  if (entries.length === 0) {
    return <EmptyState query="" reduce={reduce} />;
  }

  const isPatrika = filter === "Bhagavat Patrika";
  return (
    <section className="mt-6">
      <SectionLabel
        eyebrow={t.grantha.theLibrary}
        title={filter}
        subtitle={isPatrika ? t.grantha.patrikaNote : t.grantha.booksNote}
      />
      <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
        {entries.map(({ collection, count }, i) => (
          <BookEntryCard
            key={collection.slug}
            collection={collection}
            count={count}
            index={i}
            reduce={reduce}
          />
        ))}
      </div>
    </section>
  );
}

function BookEntryCard({
  collection,
  count,
  index,
  reduce,
}: {
  collection: GranthaCollection;
  count: number;
  index: number;
  reduce: boolean;
}) {
  const { t } = useLang();
  const palette = paletteFor(collection.title);
  const href = `/grantha-mandir/issue/${collection.slug}`;
  const isPatrika = collection.kind === "patrika";
  const countLabel =
    count > 0
      ? `${count} ${count === 1 ? t.grantha.treasure : t.grantha.treasures}`
      : undefined;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.05, 0.3),
        ease: EASE,
      }}
    >
      <Link href={href} className="group block">
        <div className="relative overflow-hidden rounded-[1.25rem] shadow-card">
          <GranthaCover
            title={collection.title}
            palette={palette}
            rich
            label={collection.issue ?? collection.year}
            className="aspect-[3/4] w-full transition-transform duration-[400ms] ease-devotional group-hover:scale-[1.05]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[1.25rem] ring-1 ring-inset ring-white/10 transition-[box-shadow] duration-200 group-hover:ring-gold/40"
          />
        </div>

        <h3
          className="mt-4 font-display text-lg font-semibold leading-snug text-maroon-dark transition-colors duration-200 group-hover:text-maroon sm:text-xl"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          {collection.title}
        </h3>

        {collection.subtitle && (
          <p className="mt-1 font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deep">
            {collection.subtitle}
          </p>
        )}

        {(countLabel || collection.year) && (
          <p className="mt-1 font-label text-[0.65rem] uppercase tracking-wider text-ink-muted">
            {[countLabel, !collection.subtitle ? collection.year : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}

        {collection.description && (
          <p className="mt-2 line-clamp-2 font-body text-sm leading-relaxed text-ink-soft">
            {collection.description}
          </p>
        )}

        <span className="mt-3 inline-flex items-center gap-1.5 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper transition-transform duration-200 group-hover:translate-x-0.5">
          {isPatrika ? t.grantha.openIssue : t.grantha.openBook}
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Search results (masonry) + empty state                             */
/* ------------------------------------------------------------------ */

function SearchResults({
  results,
  query,
  reduce,
}: {
  results: ArticleRef[];
  query: string;
  reduce: boolean;
}) {
  const { t } = useLang();
  if (results.length === 0) {
    return <EmptyState query={query} reduce={reduce} />;
  }
  return (
    <section className="mt-6">
      <p
        className="font-label text-xs uppercase tracking-widest text-ink-muted"
        aria-live="polite"
      >
        {results.length}{" "}
        {results.length === 1 ? t.grantha.treasure : t.grantha.treasures}{" "}
        {t.grantha.found}
      </p>
      <div className="mt-8 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
        {results.map((article, i) => (
          <ArticleCard
            key={article.slug}
            article={article}
            size={i % 5 === 0 ? "large" : "medium"}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

function EmptyState({ query, reduce }: { query: string; reduce: boolean }) {
  const { t } = useLang();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mx-auto mt-16 max-w-md text-center"
    >
      <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-gold/25 bg-cream-50/70 text-gold-deep shadow-soft">
        <LotusMark className="h-14 w-14" />
      </div>
      <h3
        className="mt-8 font-display text-3xl font-semibold text-maroon-dark"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {t.grantha.noResults}
      </h3>
      <p className="mt-3 font-body leading-relaxed text-ink-soft">
        {query
          ? `${t.grantha.noResultsQuery} “${query}”.`
          : t.grantha.noResultsEmpty}
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared section label                                               */
/* ------------------------------------------------------------------ */

function SectionLabel({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <span
        className={`eyebrow text-gold-deeper ${align === "center" ? "justify-center" : ""}`}
      >
        {eyebrow}
      </span>
      <h2
        className="mt-4 font-display text-3xl font-semibold leading-tight text-maroon-dark sm:text-4xl"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-xl font-body leading-relaxed text-ink-soft">
          {subtitle}
        </p>
      )}
    </div>
  );
}
