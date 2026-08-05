"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LotusLink } from "@/components/ui/ViewTransitions";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { useLang, type Lang } from "@/lib/i18n";
import {
  SACRED_EVENTS,
  VAISHNAVA_MASA_META,
  MASA_BOUNDARIES,
  masaForDate,
  GAURABDA_YEAR,
  getGoogleCalendarUrl,
  type SacredEvent,
  type SacredEventKind,
  type VaishnavaMasa,
} from "@/lib/sacred-calendar";
import { getIstMoment } from "@/lib/bhakti";
import { requestSacredNotifications } from "@/components/features/PWAClient";

// ------------------------------------------------------------------
//  Bilingual UI strings, kept local to this feature.
// ------------------------------------------------------------------
type CalendarStrings = {
  eyebrow: string;
  title: string;
  subtitle: string;
  gaurabda: string;
  nextObservance: string;
  today: string;
  tomorrow: string;
  passed: string;
  next: string;
  filterAll: string;
  filterEkadashi: string;
  filterFestival: string;
  filterAcharya: string;
  monthLabel: string;
  fast: string;
  note: string;
  empty: string;
  dailyLink: string;
  loading: string;
  inDays: (n: number) => string;
};

const UI: Record<Lang, CalendarStrings> = {
  en: {
    eyebrow: "Gauḍīya Pañcāṅga",
    title: "The Vaiṣṇava Calendar",
    subtitle:
      "Ekādaśī fasting days, holy festivals, and the appearance and disappearance days of the ācāryas — arranged by the Vaiṣṇava lunar months for the current Gaurābda.",
    gaurabda: `Gaurābda ${GAURABDA_YEAR}`,
    nextObservance: "Next observance",
    today: "Today",
    tomorrow: "Tomorrow",
    passed: "Observed",
    next: "Next",
    filterAll: "All",
    filterEkadashi: "Ekādaśī",
    filterFestival: "Festivals",
    filterAcharya: "Ācārya Days",
    monthLabel: "Month of",
    fast: "Fasting",
    note: "Dates follow the Gauḍīya Vaiṣṇava calendar for Jalandhar (temple time, IST). Please confirm final fasting and pāraṇa timings with the temple before observing.",
    empty: "No observances match this filter.",
    dailyLink: "Daily Bhakti Companion",
    loading: "Preparing the calendar…",
    inDays: (n) => `in ${n} days`,
  },
  hi: {
    eyebrow: "गौड़ीय पंचांग",
    title: "वैष्णव पंचांग",
    subtitle:
      "एकादशी व्रत, पावन उत्सव तथा आचार्यों के प्राकट्य एवं तिरोभाव दिवस — वर्तमान गौराब्द हेतु वैष्णव चंद्र-मासों के अनुसार सजाए गए।",
    gaurabda: `गौराब्द ${GAURABDA_YEAR}`,
    nextObservance: "अगला पर्व",
    today: "आज",
    tomorrow: "कल",
    passed: "सम्पन्न",
    next: "अगला",
    filterAll: "सभी",
    filterEkadashi: "एकादशी",
    filterFestival: "उत्सव",
    filterAcharya: "आचार्य दिवस",
    monthLabel: "मास",
    fast: "व्रत",
    note: "तिथियाँ जालंधर हेतु गौड़ीय वैष्णव पंचांग (मंदिर समय, IST) के अनुसार हैं। व्रत एवं पारण का अंतिम समय मंदिर से पुष्टि करके ही पालन करें।",
    empty: "इस श्रेणी में कोई पर्व नहीं है।",
    dailyLink: "नित्य भक्ति सहचर",
    loading: "पंचांग तैयार हो रहा है…",
    inDays: (n) => `${n} दिन में`,
  },
};

// Shared with the Daily Bhakti Companion's calendar card for visual continuity.
const KIND_META: Record<
  SacredEventKind,
  { en: string; hi: string; dot: string }
> = {
  ekadashi: { en: "Ekādaśī", hi: "एकादशी", dot: "bg-gold-light" },
  festival: { en: "Festival", hi: "उत्सव", dot: "bg-rose-300" },
  appearance: { en: "Appearance", hi: "प्राकट्य", dot: "bg-emerald-300" },
  disappearance: { en: "Disappearance", hi: "तिरोभाव", dot: "bg-slate-300" },
  purnima: { en: "Pūrṇimā", hi: "पूर्णिमा", dot: "bg-amber-200" },
  amavasya: { en: "Amāvasyā", hi: "अमावस्या", dot: "bg-indigo-300" },
  vrata: { en: "Vrata", hi: "व्रत", dot: "bg-teal-300" },
  sankranti: { en: "Saṅkrānti", hi: "संक्रांति", dot: "bg-gold" },
};

// The kinds surfaced in the legend, in reading order.
const LEGEND_KINDS: SacredEventKind[] = [
  "ekadashi",
  "festival",
  "purnima",
  "appearance",
  "disappearance",
  "amavasya",
  "vrata",
  "sankranti",
];

type Filter = "all" | "ekadashi" | "festival" | "acharya";

const FILTER_KINDS: Record<Filter, SacredEventKind[] | null> = {
  all: null,
  ekadashi: ["ekadashi"],
  festival: ["festival", "purnima", "amavasya", "sankranti", "vrata"],
  acharya: ["appearance", "disappearance"],
};

const FILTER_ORDER: Filter[] = ["all", "ekadashi", "festival", "acharya"];

const FILTER_LABEL: Record<Filter, keyof CalendarStrings> = {
  all: "filterAll",
  ekadashi: "filterEkadashi",
  festival: "filterFestival",
  acharya: "filterAcharya",
};

/** Day/month/weekday for an ISO date, resolved in temple time (IST). */
function istDateParts(iso: string, lang: Lang) {
  const dtf = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
  const parts = dtf.formatToParts(new Date(iso));
  const pick = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    day: pick("day"),
    month: pick("month"),
    weekday: pick("weekday"),
    year: pick("year"),
  };
}

function eventDayNumber(iso: string) {
  return getIstMoment(new Date(iso)).dayNumber;
}

export default function VaishnavaCalendar() {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const t = UI[lang];

  const [filter, setFilter] = useState<Filter>("all");

  // The shared IST day number — null until mount so the statically prerendered
  // markup (no "today" highlight) matches the first client render exactly.
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    const sync = () => setToday(getIstMoment(new Date()).dayNumber);
    sync();
    const timer = window.setInterval(sync, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  // Events grouped by Vaiṣṇava māsa, in chronological (calendar) order.
  const groups = useMemo(() => {
    const allowed = FILTER_KINDS[filter];
    const byMasa = new Map<VaishnavaMasa, SacredEvent[]>();
    for (const event of SACRED_EVENTS) {
      if (allowed && !allowed.includes(event.kind)) continue;
      const masa = masaForDate(event.date);
      const bucket = byMasa.get(masa);
      if (bucket) bucket.push(event);
      else byMasa.set(masa, [event]);
    }
    return MASA_BOUNDARIES.map((boundary) => boundary.masa)
      .filter((masa) => byMasa.has(masa))
      .map((masa) => ({ masa, events: byMasa.get(masa)! }));
  }, [filter]);

  // The next upcoming observance across the whole year (filter-independent).
  const nextEventDate = useMemo(() => {
    if (today === null) return null;
    const upcoming = SACRED_EVENTS.find(
      (event) => eventDayNumber(event.date) - today >= 0,
    );
    return upcoming?.date ?? null;
  }, [today]);

  const nextEvent = useMemo(
    () => SACRED_EVENTS.find((event) => event.date === nextEventDate) ?? null,
    [nextEventDate],
  );

  const statusFor = (iso: string) => {
    if (today === null) return null;
    const daysUntil = eventDayNumber(iso) - today;
    if (daysUntil < 0) return { kind: "past" as const, daysUntil };
    if (daysUntil === 0) return { kind: "today" as const, daysUntil };
    if (iso === nextEventDate) return { kind: "next" as const, daysUntil };
    return { kind: "upcoming" as const, daysUntil };
  };

  const relativeLabel = (daysUntil: number) => {
    if (daysUntil <= 0) return t.today;
    if (daysUntil === 1) return t.tomorrow;
    return t.inDays(daysUntil);
  };

  return (
    <section className="relative overflow-hidden bg-maroon-gradient text-cream">
      {/* Devotional backdrop */}
      <div
        className="pattern-floral pointer-events-none absolute inset-0 opacity-[0.16]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[46rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,199,126,0.16),transparent)]"
      />

      <div className="container-temple relative z-10 pb-20 pt-28 sm:pb-28 sm:pt-32 lg:pb-36">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          subtitle={t.subtitle}
          light
        />

        {/* Gaurābda badge + next observance */}
        <div className="mt-9 flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-white/[0.06] px-5 py-2 font-display text-[13px] uppercase tracking-widest2 text-gold-light">
            <span aria-hidden="true">❁</span>
            {t.gaurabda}
          </span>

          {nextEvent && (
            <Reveal>
              <div className="flex flex-col items-center gap-1 rounded-2xl border border-gold/30 bg-white/[0.05] px-6 py-4 text-center backdrop-blur-sm sm:flex-row sm:gap-4 sm:text-left">
                <span className="font-body text-[10px] uppercase tracking-widest2 text-gold-light/80">
                  {t.nextObservance}
                </span>
                <span className="hidden h-8 w-px bg-gold/25 sm:block" aria-hidden="true" />
                <span className="font-heading text-lg font-semibold text-cream">
                  {lang === "hi" ? nextEvent.nameHi : nextEvent.name}
                </span>
                <span className="font-body text-xs text-gold-light">
                  {(() => {
                    const parts = istDateParts(nextEvent.date, lang);
                    return `${parts.weekday}, ${parts.day} ${parts.month}`;
                  })()}
                </span>

                <button
                  type="button"
                  onClick={() => requestSacredNotifications(lang)}
                  className="mt-2 sm:mt-0 sm:ml-2 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-light transition hover:bg-gold/25"
                  title={lang === "hi" ? "पावन तिथियों के स्मरण पत्र सक्षम करें" : "Enable sacred day reminders"}
                >
                  🔔 {lang === "hi" ? "स्मरण पत्र लें" : "Get Reminders"}
                </button>
              </div>
            </Reveal>
          )}
        </div>

        {/* Filter chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {FILTER_ORDER.map((option) => {
            const active = filter === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 font-body text-[11px] font-semibold uppercase tracking-[0.14em] transition sm:text-xs ${
                  active
                    ? "border-gold-light bg-gold/[0.16] text-cream"
                    : "border-gold/25 bg-white/[0.04] text-cream/65 hover:border-gold/50 hover:text-cream"
                }`}
              >
                {t[FILTER_LABEL[option]] as string}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-2">
          {LEGEND_KINDS.map((kind) => (
            <span
              key={kind}
              className="flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.1em] text-cream/55"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${KIND_META[kind].dot}`}
                aria-hidden="true"
              />
              {lang === "hi" ? KIND_META[kind].hi : KIND_META[kind].en}
            </span>
          ))}
        </div>

        {/* Month sections */}
        <div className="mt-14 space-y-14">
          {groups.length === 0 && (
            <p className="text-center font-body text-sm text-cream/60">{t.empty}</p>
          )}

          {groups.map(({ masa, events }, groupIndex) => {
            const meta = VAISHNAVA_MASA_META[masa];
            const first = istDateParts(events[0].date, lang);
            const last = istDateParts(events[events.length - 1].date, lang);
            const span =
              first.month === last.month
                ? `${first.month} ${last.year}`
                : `${first.month} – ${last.month} ${last.year}`;

            return (
              <section
                key={masa}
                aria-label={`${meta.name} — ${meta.lunar}`}
                className="scroll-mt-28"
              >
                {/* Māsa heading */}
                <div className="flex flex-col items-center text-center">
                  <span className="font-body text-[10px] uppercase tracking-widest2 text-gold-light/75">
                    {t.monthLabel} {String(groupIndex + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-2 font-heading text-3xl font-semibold text-cream sm:text-4xl">
                    {lang === "hi" ? meta.nameHi : meta.name}
                  </h2>
                  <p className="mt-1.5 font-body text-xs uppercase tracking-[0.16em] text-cream/60">
                    {lang === "hi" ? meta.lunarHi : meta.lunar} · {span}
                  </p>
                  <p className="mt-1 font-body text-[11px] italic text-gold-light/70">
                    {lang === "hi" ? meta.deityHi : meta.deity}
                  </p>
                  <div className="divider-lotus mt-5" />
                </div>

                {/* Events */}
                <ul className="mx-auto mt-7 max-w-3xl space-y-3">
                  {events.map((event, index) => {
                    const parts = istDateParts(event.date, lang);
                    const kindMeta = KIND_META[event.kind];
                    const status = statusFor(event.date);
                    const isToday = status?.kind === "today";
                    const isNext = status?.kind === "next";
                    const isPast = status?.kind === "past";

                    return (
                      <motion.li
                        key={event.date}
                        initial={reduce ? false : { opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{
                          duration: reduce ? 0 : 0.5,
                          delay: reduce ? 0 : Math.min(index * 0.04, 0.2),
                          ease: EASE_DEVOTIONAL,
                        }}
                        className={`flex gap-4 rounded-2xl border px-4 py-3.5 transition ${
                          isToday
                            ? "border-gold-light bg-gold/[0.15]"
                            : isNext
                              ? "border-gold-light/70 bg-gold/[0.10]"
                              : isPast
                                ? "border-white/5 bg-white/[0.02] opacity-55"
                                : "border-white/10 bg-white/[0.035]"
                        }`}
                      >
                        {/* Date chip */}
                        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-gold/20 bg-maroon-dark/40 py-2">
                          <span className="font-display text-xl font-semibold leading-none tabular-nums text-gold-light">
                            {parts.day}
                          </span>
                          <span className="mt-1 font-body text-[9px] uppercase tracking-[0.12em] text-cream/60">
                            {parts.month}
                          </span>
                          <span className="font-body text-[9px] uppercase tracking-[0.1em] text-cream/45">
                            {parts.weekday}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <span className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-[0.14em] text-cream/60">
                              <span
                                className={`h-2 w-2 shrink-0 rounded-full ${kindMeta.dot}`}
                                aria-hidden="true"
                              />
                              {lang === "hi" ? kindMeta.hi : kindMeta.en}
                            </span>

                            {event.kind === "ekadashi" && (
                              <span className="rounded-full border border-gold/40 px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-[0.12em] text-gold-light">
                                {t.fast}
                              </span>
                            )}

                            {status && (
                              <span
                                className={`ml-auto font-body text-[10px] font-semibold uppercase tracking-[0.12em] ${
                                  isToday || isNext
                                    ? "text-gold-light"
                                    : isPast
                                      ? "text-cream/40"
                                      : "text-cream/55"
                                }`}
                              >
                                {isNext
                                  ? t.next
                                  : isPast
                                    ? t.passed
                                    : relativeLabel(status.daysUntil)}
                              </span>
                            )}
                            <a
                              href={getGoogleCalendarUrl(event, lang)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-body text-[10px] uppercase tracking-wider text-gold-light/80 hover:text-gold transition"
                              title={lang === "hi" ? "गूगल कैलेंडर में जोड़ें" : "Add to Google Calendar"}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="hidden sm:inline">{lang === "hi" ? "+ कैलेंडर" : "+ Calendar"}</span>
                            </a>
                          </div>

                          <h3 className="mt-1.5 font-heading text-[15px] font-semibold leading-snug text-cream sm:text-base">
                            {lang === "hi" ? event.nameHi : event.name}
                          </h3>
                          <p className="mt-0.5 font-body text-[12px] leading-relaxed text-cream/65">
                            {lang === "hi" ? event.noteHi : event.note}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Footnote + back link */}
        <div className="mx-auto mt-16 max-w-3xl border-t border-gold/15 pt-8 text-center">
          <p className="font-body text-[11px] leading-relaxed text-cream/45">
            {t.note}
          </p>
          <LotusLink
            href="/#bhakti"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/45 bg-white/[0.05] px-5 py-2.5 font-body text-xs font-semibold text-gold-light transition hover:border-gold-light hover:text-cream"
          >
            <span aria-hidden="true">❁</span>
            {t.dailyLink}
          </LotusLink>
        </div>
      </div>
    </section>
  );
}
