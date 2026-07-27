"use client";

/* ------------------------------------------------------------------ */
/*  The reading room — a single article, presented like Apple Books    */
/*  or Medium: generous margins, serif headings, a living progress     */
/*  bar, a sticky sidebar, and gentle devotional microinteractions.    */
/* ------------------------------------------------------------------ */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import type { ArticleRef, ArticleBlock } from "@/lib/grantha-types";
import { useGrantha } from "@/lib/grantha-store";
import { devanagariToLatin } from "@/lib/translit";
import { useLang } from "@/lib/i18n";
import GranthaBackground from "./GranthaBackground";
import GranthaCover, { paletteFor } from "./GranthaCover";
import BookmarkButton from "./BookmarkButton";
import ArticleCard from "./ArticleCard";
import AudioPlayer from "./AudioPlayer";
import {
  ClockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  DownloadIcon,
  ShareIcon,
  CopyIcon,
  ListIcon,
  HeadphonesIcon,
} from "./icons";
import LotusMark from "@/components/ui/LotusMark";
import { useLotusNavigate } from "@/components/ui/ViewTransitions";

const EASE = EASE_DEVOTIONAL;

/** Progress-ring geometry, shared by the ring and the MotionValue driving it. */
const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** localStorage key persisting the opt-in "Kirtan mode" reading preference. */
const KIRTAN_STORAGE_KEY = "hariboll-kirtan-mode";

/**
 * Script preference for Devanāgarī lyrics.
 *
 * The songbooks (Bhajana Gīti, Gauḍīya Gītiguccha — 249 songs) carry no
 * transliteration blocks at all, so every one of them was readable only by
 * devotees who read Devanāgarī. `lib/translit.ts` has always been able to
 * romanise this exact text, but its output only ever fed a hidden search index.
 * This surfaces it.
 */
const SCRIPT_STORAGE_KEY = "hariboll-script-mode";

type ScriptMode = "deva" | "both" | "roman";

const SCRIPT_LABEL: Record<ScriptMode, string> = {
  deva: "देवनागरी",
  both: "Both",
  roman: "Romanised",
};

const SCRIPT_ORDER: ScriptMode[] = ["deva", "both", "roman"];

const DEVANAGARI_RE = /[\u0900-\u097F]/;

/**
 * The romanised text to show for a verse, honouring the script preference.
 *
 * A hand-checked `transliteration` from the source always wins; `translit.ts`
 * only fills in where the source has none (which is every one of the 249
 * songbook entries).
 */
function romanFor(
  transliteration: string | undefined,
  sanskrit: string | undefined,
  script: ScriptMode,
): string | undefined {
  if (script === "deva") return transliteration || undefined;
  if (transliteration) return transliteration;
  if (sanskrit && DEVANAGARI_RE.test(sanskrit)) {
    return devanagariToLatin(sanskrit);
  }
  return undefined;
}

interface ReadingContentProps {
  article: ArticleRef;
  previous?: ArticleRef;
  next?: ArticleRef;
  related: ArticleRef[];
}

/** Slugify a heading so the table of contents can jump to it. */
function headingId(text: string, index: number): string {
  return `h-${index}-${text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)}`;
}

export default function ReadingContent({
  article,
  previous,
  next,
  related,
}: ReadingContentProps) {
  const reduce = useReducedMotion();
  const { t } = useLang();
  const navigate = useLotusNavigate();
  const { recordReading } = useGrantha();
  const articleRef = useRef<HTMLElement>(null);

  // Devanagari titles need the Devanagari heading face (Laila) with a relaxed
  // line-height — Cormorant has no Devanagari glyphs and leading-[1.08] clips
  // the matras/conjuncts (e.g. "श्रीगुरुदेव-प्रणाम").
  const titleIsDevanagari = /[\u0900-\u097F]/.test(article.title);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const [toast, setToast] = useState<string | null>(null);
  const [kirtan, setKirtan] = useState(false);
  // Always "deva" on the first render so the static HTML and hydration agree.
  const [script, setScript] = useState<ScriptMode>("deva");

  /** Only offer the script toggle on articles that actually contain Devanāgarī. */
  const hasDevanagari = useMemo(
    () =>
      article.blocks.some((block) => {
        if (block.type === "poem") return block.lines.some((l) => DEVANAGARI_RE.test(l));
        if (block.type === "verse") return DEVANAGARI_RE.test(block.sanskrit ?? "");
        return false;
      }),
    [article.blocks],
  );

  // Table-of-contents entries derived from heading blocks.
  const toc = useMemo(
    () =>
      article.blocks
        .map((block, index) => ({ block, index }))
        .filter((entry) => entry.block.type === "heading")
        .map((entry) => ({
          id: headingId((entry.block as { text: string }).text, entry.index),
          text: (entry.block as { text: string }).text,
          level: (entry.block as { level?: number }).level ?? 2,
        })),
    [article.blocks],
  );

  /*
    Reading progress used to live in React state, set from the scroll stream.
    Rounding to whole percent meant ~100 setState calls per article, and each
    one re-rendered THIS component — which renders every block of the article.
    The percentage is now a MotionValue read imperatively by the ring and the
    numeral, so scrolling costs zero React renders.
  */
  const readFraction = useTransform(progress, (v) =>
    Math.min(1, Math.max(0, v)),
  );
  const readPctText = useTransform(readFraction, (v) => `${Math.round(v * 100)}%`);
  const ringOffset = useTransform(
    readFraction,
    (v) => RING_CIRCUMFERENCE * (1 - v),
  );

  useEffect(() => {
    // Record the visit once on mount, then again with progress on unmount.
    recordReading({
      slug: article.slug,
      title: article.title,
      collectionTitle: article.collectionTitle,
      cover: article.cover,
      progress: 0,
    });
    return () => {
      recordReading({
        slug: article.slug,
        title: article.title,
        collectionTitle: article.collectionTitle,
        cover: article.cover,
        progress: scrollYProgress.get(),
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article.slug]);

  // Kirtan mode — restore the saved preference on mount so it stays ON across
  // prev/next route changes (each navigation remounts this component). Guarded
  // for SSR / static export: window is only touched inside the effect, and the
  // initial render is always OFF so client hydration matches the server.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(KIRTAN_STORAGE_KEY) === "1") {
        setKirtan(true);
      }
      const savedScript = window.localStorage.getItem(SCRIPT_STORAGE_KEY);
      if (savedScript === "both" || savedScript === "roman") {
        setScript(savedScript);
      }
    } catch {
      /* localStorage unavailable (private mode / disabled storage) */
    }
  }, []);

  const cycleScript = () => {
    setScript((prev) => {
      const next =
        SCRIPT_ORDER[(SCRIPT_ORDER.indexOf(prev) + 1) % SCRIPT_ORDER.length];
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(SCRIPT_STORAGE_KEY, next);
        }
      } catch {
        /* ignore persistence errors */
      }
      return next;
    });
  };

  const toggleKirtan = () => {
    setKirtan((prev) => {
      const nextOn = !prev;
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(KIRTAN_STORAGE_KEY, nextOn ? "1" : "0");
        }
      } catch {
        /* ignore persistence errors */
      }
      return nextOn;
    });
  };

  // When singing, move straight through the book: ArrowLeft / swipe-right →
  // previous, ArrowRight / swipe-left → next (only when a neighbour exists).
  // Reuses the app's lotus navigate hook — the same client routing the
  // prev/next links use — rather than introducing a new router.
  useEffect(() => {
    if (!kirtan || typeof window === "undefined") return;

    const goTo = (target?: ArticleRef) => {
      if (target) navigate(`/grantha-mandir/read/${target.slug}`);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      const el = event.target as HTMLElement | null;
      if (
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      )
        return;
      if (event.key === "ArrowLeft" && previous) {
        event.preventDefault();
        goTo(previous);
      } else if (event.key === "ArrowRight" && next) {
        event.preventDefault();
        goTo(next);
      }
    };

    let startX = 0;
    let startY = 0;
    let tracking = false;
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        tracking = false;
        return;
      }
      tracking = true;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      // Only treat clearly horizontal swipes as navigation so vertical
      // scrolling through a long song is never hijacked.
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) goTo(next);
      else goTo(previous);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [kirtan, previous, next, navigate]);

  const showToast = (message: string) => {
    setToast(message);
    window.clearTimeout((showToast as { _t?: number })._t);
    (showToast as { _t?: number })._t = window.setTimeout(
      () => setToast(null),
      2000,
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast(t.grantha.linkCopied);
    } catch {
      /* user dismissed the share sheet — nothing to do */
    }
  };

  const palette = paletteFor(article.title);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <GranthaBackground />

      {/* -------------------------------------------------- Reading progress */}
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gold-gradient"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <div className="container-temple pt-24 pb-24 sm:pt-28">
        <Link
          href={`/grantha-mandir/issue/${article.collectionSlug}`}
          className="link-underline inline-flex items-center gap-2 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {article.collectionTitle}
        </Link>

        <div
          className={
            kirtan
              ? "mt-8 grid gap-12 lg:gap-16"
              : "mt-8 grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16"
          }
        >
          {/* ============================================= Article column */}
          <article
            ref={articleRef}
            className={kirtan ? "mx-auto w-full min-w-0 max-w-3xl" : "min-w-0"}
          >
            {/* ----- Header */}
            <header>
              <div className="overflow-hidden rounded-[1.75rem] border border-gold/20 shadow-card">
                <GranthaCover
                  title={article.title}
                  palette={palette}
                  rich
                  className="aspect-[16/8] w-full"
                />
              </div>

              <div className="mt-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-cream-50/70 px-4 py-1.5 font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deeper">
                  {article.category}
                </span>
                <h1
                  className={`mt-5 font-display text-4xl font-semibold text-maroon-dark sm:text-5xl lg:text-[3.4rem] ${
                    titleIsDevanagari ? "leading-[1.4] pb-[0.1em]" : "leading-[1.08]"
                  }`}
                  style={{
                    fontFamily: titleIsDevanagari
                      ? "var(--font-hi-heading), Georgia, serif"
                      : "var(--font-cormorant), Georgia, serif",
                  }}
                >
                  {article.title}
                </h1>

                <div
                  className={
                    kirtan
                      ? "mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-label text-sm text-ink-soft opacity-40 transition-opacity duration-500"
                      : "mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-label text-sm text-ink-soft"
                  }
                >
                  <span className="text-maroon">{article.author}</span>
                  {article.published && (
                    <span className="text-ink-muted">{article.published}</span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-ink-muted">
                    <ClockIcon className="h-4 w-4 text-gold-deep" />
                    {article.readingMinutes} {t.grantha.minRead}
                  </span>
                </div>

                {article.tags.length > 0 && (
                  <div
                    className={
                      kirtan
                        ? "mt-5 flex flex-wrap gap-2 opacity-40 transition-opacity duration-500"
                        : "mt-5 flex flex-wrap gap-2"
                    }
                  >
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gold/20 bg-cream-50/50 px-3 py-1 font-label text-[0.65rem] uppercase tracking-wider text-ink-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action row */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <BookmarkButton slug={article.slug} />
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream-50/70 px-5 py-3 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper backdrop-blur transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-0.5 hover:border-gold hover:shadow-glow"
                  >
                    <ShareIcon className="h-4 w-4" />
                    {t.grantha.share}
                  </button>
                  {article.pdfUrl && (
                    <a
                      href={article.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream-50/70 px-5 py-3 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper backdrop-blur transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-0.5 hover:border-gold hover:shadow-glow"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      PDF
                    </a>
                  )}
                  {/* Kirtan mode — enlarges the lyrics and lets you sing
                      straight through the book with arrows / swipes. */}
                  <button
                    type="button"
                    onClick={toggleKirtan}
                    aria-pressed={kirtan}
                    title={t.grantha.kirtanModeHint}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-label text-xs font-semibold uppercase tracking-wider backdrop-blur transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-0.5 hover:shadow-glow ${
                      kirtan
                        ? "border border-gold bg-gold-gradient text-maroon-dark shadow-glow"
                        : "border border-gold/40 bg-cream-50/70 text-gold-deeper hover:border-gold"
                    }`}
                  >
                    <KirtanIcon className="h-4 w-4" />
                    {t.grantha.kirtanMode}
                  </button>

                  {/* Script preference — only where there is Devanāgarī to
                      romanise. Cycles देवनागरी → both → Romanised. */}
                  {hasDevanagari && (
                    <button
                      type="button"
                      onClick={cycleScript}
                      title={t.grantha.scriptHint}
                      className="press-nudge inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cream-50/70 px-5 py-3 font-label text-xs font-semibold uppercase tracking-wider text-gold-deeper backdrop-blur transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-0.5 hover:border-gold hover:shadow-glow focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <ScriptIcon className="h-4 w-4" />
                      <span className="normal-case tracking-normal">
                        {SCRIPT_LABEL[script]}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="divider-lotus mt-10 w-full max-w-md" />
            </header>

            {/* ----- Body */}
            <div className="prose-grantha mt-10">
              {article.blocks.map((block, index) => (
                <BlockView
                  key={index}
                  block={block}
                  index={index}
                  onCopy={showToast}
                  kirtan={kirtan}
                  script={script}
                />
              ))}
            </div>

            {/* ----- Prev / next */}
            <nav className="mt-16 grid gap-4 sm:grid-cols-2">
              <NeighbourLink article={previous} direction="previous" />
              <NeighbourLink article={next} direction="next" />
            </nav>
          </article>

          {/* ============================================= Sticky sidebar */}
          {/* Hidden in kirtan mode so the lyrics fill the reading column. */}
          <aside className={kirtan ? "hidden" : "hidden lg:block"}>
            <div className="sticky top-28 space-y-8">
              {/* Progress ring */}
              <div className="rounded-2xl border border-gold/15 bg-cream-50/60 p-6 backdrop-blur-sm">
                <p className="font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deep">
                  {t.grantha.readingProgress}
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <ProgressRing offset={ringOffset} />
                  <div>
                    <motion.p
                      className="font-display text-2xl font-semibold tabular-nums text-maroon-dark"
                      style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                      }}
                    >
                      {readPctText}
                    </motion.p>
                    <p className="font-label text-xs text-ink-muted">
                      {article.readingMinutes} {t.grantha.minTotal}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table of contents */}
              {toc.length > 0 && (
                <div className="rounded-2xl border border-gold/15 bg-cream-50/60 p-6 backdrop-blur-sm">
                  <p className="inline-flex items-center gap-2 font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deep">
                    <ListIcon className="h-4 w-4" />
                    {t.grantha.contents}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {toc.map((entry) => (
                      <li key={entry.id}>
                        <a
                          href={`#${entry.id}`}
                          className={`link-underline block font-body text-sm text-ink-soft transition-colors hover:text-maroon ${
                            entry.level === 3 ? "pl-4 text-ink-muted" : ""
                          }`}
                        >
                          {entry.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Audio. This panel used to render unconditionally, so an
                  article whose recording was actively playing in the floating
                  player simultaneously claimed its narration "is being
                  prepared". It now only appears when there is genuinely no
                  audio — matching AudioPlayer, which already renders nothing
                  rather than a dead control. */}
              {!article.audioUrl && (
                <div className="rounded-2xl border border-gold/15 bg-cream-50/60 p-6 backdrop-blur-sm">
                  <p className="inline-flex items-center gap-2 font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deep">
                    <HeadphonesIcon className="h-4 w-4" />
                    {t.grantha.audioVersion}
                  </p>
                  <p className="mt-3 font-body text-xs leading-relaxed text-ink-muted">
                    {t.grantha.audioPending}
                  </p>
                </div>
              )}

              {/* Related */}
              {related.length > 0 && (
                <div className="rounded-2xl border border-gold/15 bg-cream-50/60 p-6 backdrop-blur-sm">
                  <p className="font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deep">
                    {t.grantha.relatedReading}
                  </p>
                  <ul className="mt-4 space-y-4">
                    {related.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/grantha-mandir/read/${item.slug}`}
                          className="group block"
                        >
                          <p
                            className="font-display text-base font-semibold leading-snug text-maroon-dark transition-colors group-hover:text-maroon"
                            style={{
                              fontFamily:
                                "var(--font-cormorant), Georgia, serif",
                            }}
                          >
                            {item.title}
                          </p>
                          <p className="mt-1 font-label text-xs text-ink-muted">
                            {item.author}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ------------------------------------------- Related (full width) */}
        {!kirtan && related.length > 0 && (
          <section className="mt-24">
            <div className="flex items-center gap-4">
              <LotusMark className="h-6 w-6 text-gold-deep" />
              <h2
                className="font-display text-2xl font-semibold text-maroon-dark sm:text-3xl"
                style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
              >
                {t.grantha.continueJourney}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, i) => (
                <ArticleCard key={item.slug} article={item} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating audio player (minimal, future-ready) */}
      <AudioPlayer title={article.title} src={article.audioUrl} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-gold/40 bg-maroon-dark/90 px-5 py-2.5 font-label text-xs font-medium tracking-wide text-cream shadow-glow backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ------------------------------- blocks ------------------------------- */

function BlockView({
  block,
  index,
  onCopy,
  kirtan,
  script,
}: {
  block: ArticleBlock;
  index: number;
  onCopy: (message: string) => void;
  kirtan: boolean;
  script: ScriptMode;
}) {
  if (block.type === "divider") {
    return <div className="divider-lotus my-12 w-full max-w-md mx-auto" />;
  }

  if (block.type === "heading") {
    const id = headingId(block.text, index);
    const Tag = block.level === 3 ? "h3" : "h2";
    const headingIsDevanagari = /[\u0900-\u097F]/.test(block.text);
    return (
      <Tag
        id={id}
        className={`scroll-mt-28 font-display font-semibold text-maroon-dark ${
          block.level === 3
            ? "mt-10 text-2xl"
            : "mt-14 text-3xl sm:text-[2rem]"
        }${headingIsDevanagari ? " leading-[1.4] pb-[0.05em]" : ""}`}
        style={{
          fontFamily: headingIsDevanagari
            ? "var(--font-hi-heading), Georgia, serif"
            : "var(--font-cormorant), Georgia, serif",
        }}
      >
        {block.text}
      </Tag>
    );
  }

  if (block.type === "quote") {
    return (
      <blockquote className="my-10 border-l-2 border-gold/50 pl-6">
        <p
          className="font-display text-xl italic leading-relaxed text-maroon sm:text-2xl"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
        >
          &ldquo;{block.text}&rdquo;
        </p>
        {block.attribution && (
          <cite className="mt-3 block font-label text-xs uppercase not-italic tracking-widest text-gold-deep">
            — {block.attribution}
          </cite>
        )}
      </blockquote>
    );
  }

  if (block.type === "verse") {
    return <VerseView block={block} onCopy={onCopy} kirtan={kirtan} script={script} />;
  }

  if (block.type === "poem") {
    return <PoemView block={block} onCopy={onCopy} kirtan={kirtan} script={script} />;
  }

  // paragraph — supports optional passage highlight on selection. Prose grows
  // modestly in kirtan mode (translations/commentary support the lyrics).
  return (
    <p
      className={
        kirtan
          ? "mt-6 font-body text-[1.2rem] leading-[2] text-ink selection:bg-gold/25 sm:text-[1.3rem]"
          : "mt-6 font-body text-[1.075rem] leading-[1.9] text-ink selection:bg-gold/25"
      }
    >
      {block.text}
    </p>
  );
}

function VerseView({
  block,
  onCopy,
  kirtan,
  script,
}: {
  block: Extract<ArticleBlock, { type: "verse" }>;
  onCopy: (message: string) => void;
  kirtan: boolean;
  script: ScriptMode;
}) {
  const copyVerse = async () => {
    const text = [block.sanskrit, block.transliteration, block.translation]
      .filter(Boolean)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      onCopy("Verse copied");
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <figure className="group relative my-10 overflow-hidden rounded-[1.5rem] border border-gold/25 bg-gradient-to-br from-cream-50/90 to-cream-200/60 p-8 backdrop-blur-sm">
      <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.06]">
        <LotusMark className="h-28 w-28 text-maroon" />
      </div>

      <button
        type="button"
        onClick={copyVerse}
        aria-label="Copy verse"
        className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-cream-50/80 text-gold-deep opacity-0 backdrop-blur transition-[opacity,border-color,box-shadow] duration-200 hover:border-gold hover:shadow-glow focus:opacity-100 focus:outline-none group-hover:opacity-100"
      >
        <CopyIcon className="h-4 w-4" />
      </button>

      {block.sanskrit && script !== "roman" && (
        <p
          className={
            kirtan
              ? "whitespace-pre-line text-center font-heading text-[1.6rem] leading-loose text-maroon-dark sm:text-[2rem] lg:text-[2.25rem]"
              : "whitespace-pre-line text-center font-heading text-xl leading-relaxed text-maroon-dark sm:text-2xl"
          }
          lang="sa"
          style={{ fontFamily: "var(--font-hi-heading), serif" }}
        >
          {block.sanskrit}
        </p>
      )}
      {/* Prefer the hand-checked transliteration when the source has one; fall
          back to romanising the Devanāgarī only when it does not. */}
      {romanFor(block.transliteration, block.sanskrit, script) && (
        <p className={
             kirtan
               ? "mt-5 whitespace-pre-line text-center font-display text-lg italic leading-relaxed text-teal sm:text-xl lg:text-2xl"
               : "mt-5 whitespace-pre-line text-center font-display text-base italic leading-relaxed text-teal sm:text-lg"
           }
           lang="sa-Latn"
           style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
          {romanFor(block.transliteration, block.sanskrit, script)}
        </p>
      )}
      {block.translation && (
        <p className={
             kirtan
               ? "mx-auto mt-5 max-w-2xl text-center font-body text-[1.15rem] leading-relaxed text-ink-soft sm:text-[1.25rem]"
               : "mx-auto mt-5 max-w-xl text-center font-body text-[1.02rem] leading-relaxed text-ink-soft"
           }>
          {block.translation}
        </p>
      )}
      {block.reference && (
        <figcaption className="mt-5 text-center font-label text-[0.65rem] uppercase tracking-widest text-gold-deep">
          {block.reference}
        </figcaption>
      )}
    </figure>
  );
}

/* A stanza of metrical poetry — blank-verse Gita, kirtans. The
   lines are centred and set in the display serif, with an optional speaker
   label as a small gold rubric above. Hovering reveals a copy affordance.
   In kirtan mode the lines grow substantially so a stanza reads from
   arm's length while singing. */
function PoemView({
  block,
  onCopy,
  kirtan,
  script,
}: {
  block: Extract<ArticleBlock, { type: "poem" }>;
  onCopy: (message: string) => void;
  kirtan: boolean;
  script: ScriptMode;
}) {
  const copyStanza = async () => {
    const text = [block.speaker, ...block.lines].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      onCopy("Stanza copied");
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <figure className="group relative my-8">
      <button
        type="button"
        onClick={copyStanza}
        aria-label="Copy stanza"
        className="absolute -right-1 top-0 grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-cream-50/80 text-gold-deep opacity-0 backdrop-blur transition-[opacity,border-color,box-shadow] duration-200 hover:border-gold hover:shadow-glow focus:opacity-100 focus:outline-none group-hover:opacity-100 sm:-right-4"
      >
        <CopyIcon className="h-4 w-4" />
      </button>

      {block.speaker && (
        <p className="mb-2 text-center font-label text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold-deep">
          {block.speaker}
        </p>
      )}
      <div
        className={
          kirtan
            ? "mx-auto max-w-2xl text-center font-display text-[1.6rem] italic leading-[2] text-maroon-dark sm:text-[2rem] lg:text-[2.25rem]"
            : "mx-auto max-w-xl text-center font-display text-[1.2rem] italic leading-[1.85] text-maroon-dark sm:text-[1.35rem]"
        }
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {block.lines.map((line, i) => {
          const isDeva = DEVANAGARI_RE.test(line);
          // Non-Devanāgarī lines (the English verse Gita, romanised kirtans)
          // are unaffected by the script preference.
          if (!isDeva || script === "deva") {
            return (
              <span key={i} className="block">
                {line || " "}
              </span>
            );
          }
          const roman = devanagariToLatin(line);
          if (script === "roman") {
            return (
              <span key={i} className="block" lang="sa-Latn">
                {roman || " "}
              </span>
            );
          }
          return (
            <span key={i} className="block">
              <span className="block">{line || " "}</span>
              <span
                className="block text-[0.78em] not-italic text-teal"
                lang="sa-Latn"
              >
                {roman}
              </span>
            </span>
          );
        })}
      </div>
    </figure>
  );
}

function NeighbourLink({
  article,
  direction,
}: {
  article?: ArticleRef;
  direction: "previous" | "next";
}) {
  if (!article) return <span className="hidden sm:block" />;
  const isNext = direction === "next";
  return (
    <Link
      href={`/grantha-mandir/read/${article.slug}`}
      className={`group flex flex-col gap-2 rounded-2xl border border-gold/15 bg-cream-50/60 p-6 backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-[240ms] ease-devotional hover:-translate-y-[3px] hover:border-gold/40 hover:shadow-glow ${
        isNext ? "sm:text-right" : ""
      }`}
    >
      <span
        className={`inline-flex items-center gap-1.5 font-label text-[0.65rem] font-semibold uppercase tracking-widest text-gold-deep ${
          isNext ? "sm:justify-end" : ""
        }`}
      >
        {!isNext && <ArrowLeftIcon className="h-3.5 w-3.5" />}
        {isNext ? "Next" : "Previous"}
        {isNext && <ArrowRightIcon className="h-3.5 w-3.5" />}
      </span>
      <span
        className="font-display text-lg font-semibold leading-snug text-maroon-dark transition-colors group-hover:text-maroon"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {article.title}
      </span>
    </Link>
  );
}

/**
 * The ring is driven by a MotionValue, so it updates outside React.
 *
 * It previously carried `transition: stroke-dashoffset 0.3s ease`, re-fired on
 * every percent change — the transition was restarted long before it could
 * finish, so the ring permanently trailed the scroll by 300ms and never
 * actually landed. The spring on `progress` already provides the smoothing.
 */
function ProgressRing({ offset }: { offset: MotionValue<number> }) {
  return (
    <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
      <circle
        cx="28"
        cy="28"
        r={RING_RADIUS}
        fill="none"
        stroke="rgba(201,162,75,0.2)"
        strokeWidth="3"
      />
      <motion.circle
        cx="28"
        cy="28"
        r={RING_RADIUS}
        fill="none"
        stroke="url(#ring-gold)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={RING_CIRCUMFERENCE}
        style={{ strokeDashoffset: offset }}
      />
      <defs>
        <linearGradient id="ring-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E3C77E" />
          <stop offset="100%" stopColor="#A8842F" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Two glyph forms side by side — the script-preference toggle. */
function ScriptIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h7M6.5 6v12" />
      <path d="M14 18l3.5-9 3.5 9M15.4 15h4.2" />
    </svg>
  );
}

/** A small beamed pair of eighth-notes for the Kirtan-mode toggle. */
function KirtanIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 17.5V6.2l10-2v9.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="6.4"
        cy="17.6"
        rx="2.9"
        ry="2.4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <ellipse
        cx="16.4"
        cy="15.5"
        rx="2.9"
        ry="2.4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
