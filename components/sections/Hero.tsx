"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSmoothScrollTo } from "@/components/SmoothScroll";
import OrnateFrame from "@/components/ui/OrnateFrame";
import PeacockOrnament from "@/components/ui/PeacockOrnament";
import { heroDecor } from "@/lib/images";
import { useLang } from "@/lib/i18n";
import RippleHeading from "@/components/ui/RippleHeading";

const EASE = [0.22, 1, 0.36, 1] as const;

function LotusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4c1.6 2.5 1.6 6 0 9-1.6-3-1.6-6.5 0-9Z" />
      <path d="M12 13c-1.5-2.2-4-3.2-6.5-3 .5 2.5 2.5 4.5 5.2 5.2" />
      <path d="M12 13c1.5-2.2 4-3.2 6.5-3-.5 2.5-2.5 4.5-5.2 5.2" />
      <path d="M5 18c2 1.2 4.5 1.8 7 1.8S17 19.2 19 18" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </svg>
  );
}

const CTAS = [
  { target: "#darshan", tint: "btn-glass--teal", Icon: LotusIcon },
  { target: "#festivals", tint: "btn-glass--amber", Icon: CalendarIcon },
] as const;

export default function Hero() {
  const scrollTo = useSmoothScrollTo();
  const reduce = useReducedMotion();
  const { t, lang } = useLang();
  const [bgError, setBgError] = useState(false);
  const [showDesktopNote, setShowDesktopNote] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 639px)").matches) return;

    const showTimer = window.setTimeout(() => setShowDesktopNote(true), 600);
    const hideTimer = window.setTimeout(() => setShowDesktopNote(false), 6600);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const ctaLabels = [t.hero.cta1, t.hero.cta2];
  const mobileTitleLines = lang === "hi"
    ? ["श्री", "चैतन्य", "महाप्रभु", "श्री राधा", "माधव मंदिर"]
    : ["Sree", "Chaitanya", "Mahaprabhu", "Sree Radha", "Madhav Mandir"];
  const mobileSubtitleLines = lang === "hi"
    ? ["जालंधर में हरिनाम, दर्शन और सेवा का", "पावन भक्ति धाम।"]
    : ["A sacred home of Harinam, Darshan, Seva", "and Devotion in Jalandhar."];

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.18,
        delayChildren: reduce ? 0 : 0.35,
      },
    },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 26 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 1, ease: EASE },
    },
  };

  return (
    <section
      id="home"
      className="relative aspect-[9/16] h-auto min-h-0 w-full overflow-hidden bg-[#f3e6c9] sm:aspect-auto sm:min-h-[100svh]"
    >
      {!bgError && (
        <picture className="parallax-section-bg block h-full w-full">
          <source media="(max-width: 639px)" srcSet="/images/hero-bg-mobile.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={heroDecor.bg}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onError={() => setBgError(true)}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain object-top sm:object-cover sm:object-center"
          />
        </picture>
      )}

      {bgError && (
        <>
          <div className="absolute inset-0 bg-hero-warm" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_42%,rgba(255,244,214,0.55),transparent_62%)]"
            aria-hidden="true"
          />
          <PeacockOrnament side="left" className="pointer-events-none absolute bottom-0 left-0 hidden h-[70vh] w-auto lg:block" />
          <PeacockOrnament side="right" className="pointer-events-none absolute bottom-0 right-0 hidden h-[70vh] w-auto lg:block" />
          <OrnateFrame />
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-32 bg-gradient-to-b from-black/45 via-black/10 to-transparent" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="absolute inset-x-0 bottom-0 top-[25%] z-10 flex flex-col items-center justify-start px-4 pb-16 text-center sm:inset-0 sm:justify-center sm:pb-[4vh]"
      >
        <motion.div variants={item} className="w-full max-w-[19rem] sm:w-[62%] sm:max-w-xl lg:w-[42%]">
          <h1
            aria-label={t.hero.title}
            className="font-display text-[1.35rem] font-semibold uppercase leading-[1.12] tracking-[0.045em] text-teal-dark sm:hidden"
          >
            {mobileTitleLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <RippleHeading
            text={t.hero.title}
            lang={lang}
            className="hidden font-display font-semibold uppercase text-teal-dark sm:mt-3 sm:block sm:text-4xl sm:leading-[1.25] sm:tracking-wide lg:text-5xl"
          />

          <p className="mx-auto mt-3 font-body text-[10px] leading-[1.45] text-teal-dark/80 sm:hidden">
            {mobileSubtitleLines.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </p>

          <p className="mx-auto mt-4 hidden max-w-md font-body text-base leading-relaxed text-teal-dark/80 sm:block">
            {t.hero.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-3.5 grid w-full max-w-[12.5rem] grid-cols-1 gap-2.5 sm:mt-8 sm:flex sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4"
        >
          {CTAS.map(({ target, tint, Icon }, i) => (
            <button
              key={target}
              onClick={() => scrollTo(target)}
              className={`btn-glass ${tint} min-h-11 w-full whitespace-nowrap !gap-2 !px-3 !py-2.5 text-[10px] leading-none sm:min-h-0 sm:w-auto sm:!gap-3 sm:!px-7 sm:!py-3.5 sm:text-sm`}
            >
              <Icon />
              {ctaLabels[i]}
            </button>
          ))}
        </motion.div>

      </motion.div>

      <AnimatePresence>
        {showDesktopNote && (
          <motion.p
            initial={{ opacity: 0, x: -16, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -12, y: 6 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
            className="absolute bottom-4 left-4 z-10 max-w-[11rem] rounded-xl border border-gold/25 bg-[#fff8e8]/90 px-3 py-2 text-left font-body text-[9px] leading-relaxed text-teal-dark/75 shadow-soft sm:hidden"
          >
            {lang === "hi"
              ? "सर्वोत्तम दृश्य अनुभव के लिए डेस्कटॉप पर देखें।"
              : "For the best visual experience, visit on a desktop."}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => scrollTo("#darshan")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.6, duration: 1 }}
        className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-teal/60 transition-colors hover:text-teal sm:bottom-6 sm:gap-2"
        aria-label={t.hero.scroll}
      >
        <span className="font-body text-[10px] uppercase tracking-widest2">
          {t.hero.scroll}
        </span>
        <motion.span
          animate={reduce ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="block h-6 w-px bg-gradient-to-b from-gold to-transparent sm:h-10"
        />
      </motion.button>
    </section>
  );
}
