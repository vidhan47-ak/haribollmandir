"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import SectionHeading from "@/components/ui/SectionHeading";
import { aaratiScheduleLine } from "@/lib/temple";
import FallbackImage from "@/components/ui/FallbackImage";
import { darshanGallery } from "@/lib/images";
import { useLang, type Lang } from "@/lib/i18n";
import { SACRED_EVENTS, type SacredEventKind, getGoogleCalendarUrl } from "@/lib/sacred-calendar";
import {
  VERSES,
  KIRTANS,
  getIstMoment,
  getNextAarti,
  pickForDay,
  splitDuration,
} from "@/lib/bhakti";

// ------------------------------------------------------------------
//  Bilingual UI strings, kept local to this feature (like SacredCountdown).
// ------------------------------------------------------------------
const UI = {
  en: {
    eyebrow: "Nitya Sevā",
    title: "Daily Bhakti Companion",
    subtitle:
      "A daily shelter for the heart — darshan, a verse, a kīrtana, the Vaiṣṇava calendar and the next aarti, gathered in one quiet place.",
    verse: "Verse of the Day",
    kirtan: "Kīrtana of the Day",
    darshan: "Darshan",
    randomDarshan: "A Darshan for You",
    calendar: "Vaiṣṇava Calendar",
    aarti: "Next Aarti",
    another: "Another darshan",
    listen: "Play kīrtana",
    pause: "Pause",
    singAlong: "Sing along softly",
    liveNow: "Live now",
    beginsIn: "Begins in",
    endsIn: "Live · ends in",
    today: "Today",
    tomorrow: "Tomorrow",
    hrs: "Hrs",
    min: "Min",
    sec: "Sec",
    schedule: "Daily aarti",
    calendarNote:
      "Gauḍīya Vaiṣṇava calendar for Jalandhar. Please confirm final timings with the temple.",
    viewFull: "View full calendar",
    loading: "Preparing…",
    calendarExhausted:
      "The calendar for the coming year is being prepared. Please ask at the mandir for upcoming dates.",
  },
  hi: {
    eyebrow: "नित्य सेवा",
    title: "नित्य भक्ति सहचर",
    subtitle:
      "हृदय के लिए दैनिक आश्रय — दर्शन, एक श्लोक, एक कीर्तन, वैष्णव पंचांग और अगली आरती, सब एक शांत स्थान पर।",
    verse: "आज का श्लोक",
    kirtan: "आज का कीर्तन",
    darshan: "दर्शन",
    randomDarshan: "आपके लिए एक दर्शन",
    calendar: "वैष्णव पंचांग",
    aarti: "अगली आरती",
    another: "दूसरा दर्शन",
    listen: "कीर्तन सुनें",
    pause: "रोकें",
    singAlong: "साथ में धीरे गाएँ",
    liveNow: "अभी लाइव",
    beginsIn: "आरंभ में",
    endsIn: "लाइव · समाप्ति में",
    today: "आज",
    tomorrow: "कल",
    hrs: "घंटे",
    min: "मिनट",
    sec: "सेकंड",
    schedule: "दैनिक आरती",
    calendarNote:
      "जालंधर हेतु गौड़ीय वैष्णव पंचांग। अंतिम समय की पुष्टि मंदिर से करें।",
    viewFull: "पूरा पंचांग देखें",
    loading: "तैयार हो रहा है…",
    calendarExhausted:
      "आगामी वर्ष का पंचांग तैयार किया जा रहा है। तिथियों हेतु मंदिर से संपर्क करें।",
  },
} as const;

const KIND_META: Record<SacredEventKind, { en: string; hi: string; dot: string }> = {
  ekadashi: { en: "Ekādaśī", hi: "एकादशी", dot: "bg-gold-light" },
  festival: { en: "Festival", hi: "उत्सव", dot: "bg-rose-300" },
  appearance: { en: "Appearance", hi: "प्राकट्य", dot: "bg-emerald-300" },
  disappearance: { en: "Disappearance", hi: "तिरोभाव", dot: "bg-slate-300" },
  purnima: { en: "Pūrṇimā", hi: "पूर्णिमा", dot: "bg-amber-200" },
  amavasya: { en: "Amāvasyā", hi: "अमावस्या", dot: "bg-indigo-300" },
  vrata: { en: "Vrata", hi: "व्रत", dot: "bg-teal-300" },
  sankranti: { en: "Saṅkrānti", hi: "संक्रांति", dot: "bg-gold" },
};

function CardShell({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-[1.4rem] sm:rounded-[1.6rem] border border-gold/35 bg-gradient-to-b from-[#42141c]/55 via-[#2d0c13]/60 to-[#1a060a]/65 p-4.5 sm:p-7 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,231,165,0.2)] backdrop-blur-xl backdrop-saturate-150 transform-gpu ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-4 sm:inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
      />
      <p className="font-body text-[10px] font-semibold uppercase tracking-widest2 text-gold-light">
        {label}
      </p>
      <div className="mt-3 sm:mt-4 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

// ------------------------------------------------------------------
//  Next Aarti Countdown — self-contained per-second ticker so only this
//  card re-renders each second.
// ------------------------------------------------------------------
function NextAartiCard({ lang }: { lang: Lang }) {
  const t = UI[lang];
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const next = useMemo(() => (now ? getNextAarti(getIstMoment(now)) : null), [now]);
  const remaining = next
    ? splitDuration(next.live ? next.secondsUntilEnd : next.secondsUntilStart)
    : null;

  return (
    <CardShell label={t.aarti}>
      {next && remaining ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            {next.live && (
              <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300/70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
            )}
            <h3 className="font-heading text-xl sm:text-2xl font-semibold text-cream">
              {lang === "hi" ? next.aarti.nameHi : next.aarti.name}
            </h3>
          </div>
          <p className="mt-1 font-body text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-cream/65">
            {next.live ? t.endsIn : t.beginsIn}
          </p>

          <div role="timer" className="mt-3.5 sm:mt-4 flex items-stretch gap-1.5 sm:gap-3">
            {[
              [t.hrs, remaining.hours],
              [t.min, remaining.minutes],
              [t.sec, remaining.seconds],
            ].map(([unitLabel, value]) => (
              <div
                key={String(unitLabel)}
                className="relative flex-1 overflow-hidden rounded-xl sm:rounded-2xl border border-gold/30 bg-white/[0.08] px-1 py-2.5 sm:py-3 text-center"
              >
                <span className="block font-display text-xl font-semibold tabular-nums text-gold-light sm:text-3xl">
                  {pad(Number(value))}
                </span>
                <span className="mt-0.5 sm:mt-1 block font-body text-[7.5px] sm:text-[8px] uppercase tracking-[0.12em] text-cream/60">
                  {unitLabel}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 sm:pt-5">
            <p className="font-body text-[10px] uppercase tracking-widest2 text-gold-light/80">
              {t.schedule}
            </p>
            <p className="mt-1 font-body text-xs tabular-nums text-cream/75 leading-relaxed">
              {aaratiScheduleLine(lang)}
            </p>
          </div>
        </div>
      ) : (
        <p className="font-body text-sm text-cream/60">{t.loading}</p>
      )}
    </CardShell>
  );
}

// ------------------------------------------------------------------
//  Kīrtana of the Day (with an optional self-managed audio player).
// ------------------------------------------------------------------
function KirtanCard({ lang, dayNumber }: { lang: Lang; dayNumber: number | null }) {
  const t = UI[lang];
  const kirtan = dayNumber === null ? null : pickForDay(KIRTANS, dayNumber);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Reset the player if the day's kīrtana changes.
    setPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [kirtan?.title]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  return (
    <CardShell label={t.kirtan}>
      {kirtan ? (
        <div className="flex flex-1 flex-col">
          <h3 className="font-heading text-xl sm:text-2xl font-semibold text-cream">
            {lang === "hi" ? kirtan.titleHi : kirtan.title}
          </h3>
          <p className="mt-1 font-body text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-gold-light/90">
            {lang === "hi" ? kirtan.traditionHi : kirtan.tradition}
          </p>

          <div className="mt-3.5 sm:mt-4 space-y-1 border-l-2 border-gold/45 pl-3.5 sm:pl-4">
            {kirtan.lines.map((line, i) => (
              <p key={i} className="font-heading text-[14px] sm:text-[15px] italic leading-relaxed text-cream/95">
                {line}
              </p>
            ))}
          </div>

          <p className="mt-3 sm:mt-4 font-body text-xs sm:text-sm leading-relaxed text-cream/75">
            {lang === "hi" ? kirtan.meaningHi : kirtan.meaning}
          </p>

          <div className="mt-auto pt-4 sm:pt-5">
            {kirtan.audioSrc ? (
              <>
                <button
                  type="button"
                  onClick={toggle}
                  aria-pressed={playing}
                  className="inline-flex min-h-[42px] items-center gap-2.5 rounded-full border border-gold/50 bg-white/[0.08] px-5 py-2.5 font-body text-xs font-semibold text-gold-light transition hover:border-gold-light hover:bg-gold/10 hover:text-cream active:scale-95"
                >
                  <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
                  {playing ? t.pause : t.listen}
                </button>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio
                  ref={audioRef}
                  src={kirtan.audioSrc}
                  preload="none"
                  onEnded={() => setPlaying(false)}
                />
              </>
            ) : (
              <span className="inline-flex items-center gap-2 font-body text-xs text-cream/60">
                <span aria-hidden="true">♪</span>
                {t.singAlong}
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="font-body text-sm text-cream/60">{t.loading}</p>
      )}
    </CardShell>
  );
}

// ------------------------------------------------------------------
//  Random Darshan.
// ------------------------------------------------------------------
function RandomDarshanCard({ lang }: { lang: Lang }) {
  const { t: dict } = useLang();
  const t = UI[lang];
  const reduce = useReducedMotion();
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * darshanGallery.length));
  }, []);

  const shuffle = () => {
    if (darshanGallery.length < 2) return;
    setIndex((current) => {
      let next = current;
      while (next === current || next === null) {
        next = Math.floor(Math.random() * darshanGallery.length);
      }
      return next;
    });
  };

  const image = index === null ? null : darshanGallery[index];
  const localized =
    index === null ? null : dict.gallery.items[index] ?? null;

  return (
    <CardShell label={t.randomDarshan}>
      {image ? (
        <div className="flex flex-1 flex-col">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl ring-1 ring-gold/30 shadow-md darshan-twilight-backlight">
            <div className="aspect-[4/3] min-h-[220px] xs:min-h-[260px] sm:min-h-[360px] w-full">
              <motion.div
                key={index}
                initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reduce ? 0 : 0.8, ease: EASE_DEVOTIONAL }}
                className="h-full w-full"
              >
                <FallbackImage
                  src={image.src}
                  alt={localized?.title ?? image.alt}
                  label={localized?.title ?? image.title}
                  palette={image.palette}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-maroon-dark/80 via-transparent to-transparent" />
          </div>

          <h3 className="mt-3.5 sm:mt-4 font-heading text-lg sm:text-xl font-semibold text-cream">
            {localized?.title ?? image.title}
          </h3>
          <p className="mt-1 font-body text-xs sm:text-sm leading-relaxed text-cream/75">
            {localized?.caption ?? image.caption}
          </p>

          <div className="mt-auto pt-4 sm:pt-5">
            <button
              type="button"
              onClick={shuffle}
              className="inline-flex min-h-[42px] items-center gap-2.5 rounded-full border border-gold/50 bg-white/[0.08] px-5 py-2.5 font-body text-xs font-semibold text-gold-light transition hover:border-gold-light hover:bg-gold/10 hover:text-cream active:scale-95"
            >
              <span aria-hidden="true">❁</span>
              {t.another}
            </button>
          </div>
        </div>
      ) : (
        <p className="font-body text-sm text-cream/60">{t.loading}</p>
      )}
    </CardShell>
  );
}

// ------------------------------------------------------------------
//  Verse of the Day.
// ------------------------------------------------------------------
function VerseCard({ lang, dayNumber }: { lang: Lang; dayNumber: number | null }) {
  const t = UI[lang];
  const verse = dayNumber === null ? null : pickForDay(VERSES, dayNumber);

  const shareVerseWhatsApp = () => {
    if (!verse) return;
    const body = lang === "hi" ? verse.hi : verse.en;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://hariboll-mandir.org";
    const text = `🌸 *Hariboll Mandir — Verse of the Day* 🌸\n\n"${verse.sanskrit}"\n\n_${verse.transliteration}_\n\n${body}\n\n— *${verse.reference}*\n\n✨ *Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir, Jalandhar*\n${origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <CardShell label={t.verse} className="lg:col-span-2">
      {verse ? (
        <div className="flex flex-1 flex-col">
          <span aria-hidden="true" className="font-heading text-4xl sm:text-5xl leading-none text-gold/45 select-none">
            &ldquo;
          </span>
          <p className="-mt-2 sm:-mt-3 whitespace-pre-line font-heading text-lg sm:text-xl lg:text-2xl leading-relaxed text-cream">
            {verse.sanskrit}
          </p>
          <p className="mt-3 sm:mt-4 whitespace-pre-line font-body text-xs sm:text-sm italic leading-relaxed text-gold-light/95">
            {verse.transliteration}
          </p>
          <div className="my-3.5 sm:my-5 h-px w-full bg-gradient-to-r from-gold/50 via-gold/20 to-transparent" />
          <p className="font-body text-sm sm:text-base leading-relaxed text-cream/90">
            {lang === "hi" ? verse.hi : verse.en}
          </p>
          <div className="mt-auto pt-4 sm:pt-5 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <p className="font-body text-[10px] sm:text-[11px] uppercase tracking-widest2 text-gold-light">
              — {verse.reference}
            </p>
            <button
              type="button"
              onClick={shareVerseWhatsApp}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-950/50 px-4 py-1.5 text-xs font-medium text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-900/70 active:scale-95"
              title={lang === "hi" ? "व्हाट्सएप पर शेयर करें" : "Share on WhatsApp"}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3a9 9 0 0 0-7.7 13.6L3.2 21l4.5-1.1A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 9.3c0 3 2.4 5.4 5.4 5.4l.9-1.5-1.9-.7-.8.8a4.4 4.4 0 0 1-2-2l.8-.8-.7-1.9-1.7.7Z" />
              </svg>
              <span>{lang === "hi" ? "व्हाट्सएप शेयर" : "Share Verse"}</span>
            </button>
          </div>
        </div>
      ) : (
        <p className="font-body text-sm text-cream/60">{t.loading}</p>
      )}
    </CardShell>
  );
}

// ------------------------------------------------------------------
//  Vaiṣṇava Calendar — upcoming observances.
// ------------------------------------------------------------------
function CalendarCard({ lang, dayNumber }: { lang: Lang; dayNumber: number | null }) {
  const t = UI[lang];

  const upcoming = useMemo(() => {
    if (dayNumber === null) return [];
    return SACRED_EVENTS.map((event) => ({
      event,
      daysUntil: getIstMoment(new Date(event.date)).dayNumber - dayNumber,
    }))
      .filter((entry) => entry.daysUntil >= 0)
      .slice(0, 5);
  }, [dayNumber]);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-GB", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(new Date(iso));

  const relative = (days: number) => {
    if (days <= 0) return t.today;
    if (days === 1) return t.tomorrow;
    return lang === "hi" ? `${days} दिन में` : `in ${days} days`;
  };

  const exhausted = dayNumber !== null && upcoming.length === 0;

  return (
    <CardShell label={t.calendar}>
      {upcoming.length > 0 ? (
        <div className="flex flex-1 flex-col">
          <ul className="space-y-3">
            {upcoming.map(({ event, daysUntil }, i) => {
              const meta = KIND_META[event.kind];
              return (
                <li
                  key={event.date}
                  className={`rounded-2xl border px-4 py-3 transition ${
                    i === 0
                      ? "border-gold/45 bg-gold/[0.08]"
                      : "border-white/10 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.14em] text-cream/60">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
                      {lang === "hi" ? meta.hi : meta.en}
                    </span>
                    <span className="font-body text-[11px] font-semibold tabular-nums text-gold-light">
                      {relative(daysUntil)}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-heading text-[15px] font-semibold leading-snug text-cream">
                    {lang === "hi" ? event.nameHi : event.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="font-body text-[11px] text-cream/55">
                      {formatDate(event.date)}
                    </p>
                    <a
                      href={getGoogleCalendarUrl(event, lang)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-body text-[10px] uppercase tracking-wider text-gold-light/80 hover:text-gold transition"
                      title={lang === "hi" ? "गूगल कैलेंडर में जोड़ें" : "Add to Google Calendar"}
                    >
                      <svg className="w-3 h-3 text-gold-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{lang === "hi" ? "+ कैलेंडर" : "+ Calendar"}</span>
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto pt-5">
            <Link
              href="/vaishnava-calendar"
              className="inline-flex items-center gap-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-light transition hover:text-cream"
            >
              {t.viewFull}
              <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-3 font-body text-[10px] leading-relaxed text-cream/40">
              {t.calendarNote}
            </p>
          </div>
        </div>
      ) : exhausted ? (
        <p className="font-body text-sm leading-relaxed text-cream/70">
          {t.calendarExhausted}
        </p>
      ) : (
        <p className="font-body text-sm text-cream/60">{t.loading}</p>
      )}
    </CardShell>
  );
}

// ------------------------------------------------------------------
//  Section.
// ------------------------------------------------------------------
export default function DailyBhaktiCompanion() {
  const { lang } = useLang();
  const t = UI[lang];

  // One shared IST day number for the day-based cards; refreshed each minute so
  // the content rolls over at IST midnight without a reload.
  const [dayNumber, setDayNumber] = useState<number | null>(() => {
    try {
      return getIstMoment().dayNumber;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const sync = () => setDayNumber(getIstMoment().dayNumber);
    sync();
    const timer = window.setInterval(sync, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      id="bhakti"
      data-section-mood="maroon"
      className="section-pad relative overflow-hidden bg-maroon-gradient text-cream"
    >
      {/* Devotional backdrop — bhakti.webp shown at full strength behind the cards. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/bhakti.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full scale-[1.03] object-cover object-center"
        />
      </div>
      <div className="pattern-floral pointer-events-none absolute inset-0 opacity-[0.18]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,199,126,0.16),transparent)]"
      />

      <div className="container-temple relative z-10">
        <SectionHeading
          eyebrow={t.eyebrow}
          title={t.title}
          subtitle={t.subtitle}
          light
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-2">
            <VerseCard lang={lang} dayNumber={dayNumber} />
          </div>
          <div>
            <NextAartiCard lang={lang} />
          </div>
          <div>
            <RandomDarshanCard lang={lang} />
          </div>
          <div>
            <KirtanCard lang={lang} dayNumber={dayNumber} />
          </div>
          <div>
            <CalendarCard lang={lang} dayNumber={dayNumber} />
          </div>
        </div>
      </div>
    </section>
  );
}
