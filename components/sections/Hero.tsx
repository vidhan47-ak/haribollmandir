"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

function OfferingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5c-1 2-3 3.2-5 4.2C5 10 4.5 12 5.2 14l1.9 4.4c.4.9 1.3 1.6 2.3 1.6h5.2c1 0 1.9-.7 2.3-1.6L18.8 14c.7-2 .2-4-1.8-4.8C15 8.2 13 7 12 5Z" />
      <path d="M12 5v13" />
    </svg>
  );
}

const CTAS = [
  { target: "#darshan", tint: "btn-glass--teal", Icon: LotusIcon },
  { target: "#festivals", tint: "btn-glass--amber", Icon: CalendarIcon },
  { target: "#seva", tint: "btn-glass--green", Icon: OfferingIcon },
] as const;

export default function Hero() {
  const scrollTo = useSmoothScrollTo();
  const reduce = useReducedMotion();
  const { t, lang } = useLang();
  const [bgError, setBgError] = useState(false);

  const ctaLabels = [t.hero.cta1, t.hero.cta2, t.hero.cta3];

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
      className="hero-desktop-touch relative min-h-[100svh] w-full overflow-hidden bg-[#f3e6c9]"
    >
      {!bgError && (
        // eslint-disable-next-line @next/next/no-img-element
        <motion.img
          src={heroDecor.bg}
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onError={() => setBgError(true)}
          initial={reduce ? undefined : { scale: 1 }}
          animate={reduce ? undefined : { scale: 1.04 }}
          transition={reduce ? undefined : { duration: 14, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
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
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 pb-[4vh] text-center"
      >
        <motion.div variants={item} className="w-[86%] max-w-xl sm:w-[62%] lg:w-[42%]">
          <RippleHeading
            text={t.hero.title}
            lang={lang}
            className="mt-3 font-display text-2xl font-semibold uppercase leading-[1.25] tracking-wide text-teal-dark sm:text-4xl lg:text-5xl"
          />

          <p className="mx-auto mt-4 max-w-md font-body text-sm text-teal-dark/75 sm:text-base">
            {t.hero.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={item}
          className="mt-8 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          {CTAS.map(({ target, tint, Icon }, i) => (
            <button
              key={target}
              onClick={() => scrollTo(target)}
              className={`btn-glass ${tint} w-full sm:w-auto`}
            >
              <Icon />
              {ctaLabels[i]}
            </button>
          ))}
        </motion.div>
      </motion.div>

      <motion.button
        onClick={() => scrollTo("#darshan")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1.6, duration: 1 }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-teal/60 transition-colors hover:text-teal"
        aria-label={t.hero.scroll}
      >
        <span className="font-body text-[10px] uppercase tracking-widest2">
          {t.hero.scroll}
        </span>
        <motion.span
          animate={reduce ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="block h-10 w-px bg-gradient-to-b from-gold to-transparent"
        />
      </motion.button>
    </section>
  );
}
