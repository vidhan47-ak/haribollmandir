"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { scrollToElement } from "@/lib/scroll-helper";
import OrnateFrame from "@/components/ui/OrnateFrame";
import PeacockOrnament from "@/components/ui/PeacockOrnament";
import {
  LOTUS_BREATH_EASE,
  LOTUS_BREATH_TOKENS,
  useLotusBreathProfile,
} from "@/components/ui/Reveal";
import { spring } from "@/lib/springs";
import HeroBackground from "@/components/sections/HeroBackground";
import { useLang } from "@/lib/i18n";
import RippleHeading from "@/components/ui/RippleHeading";
import LiveDarshanPlayer from "@/components/features/LiveDarshanPlayer";

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
  const motionProfile = useLotusBreathProfile();
  const reduce = motionProfile.reducedMotion;
  const { t, lang } = useLang();
  const [bgError, setBgError] = useState(false);

  /*
    Removed: a timed popup that told phone visitors "for the best visual
    experience, visit on a desktop". It appeared only on mobile — where most
    Jalandhar devotees are — and apologised for the design in the first six
    seconds of a sacred space. The mobile hero is a first-class layout, not a
    fallback, so it should not introduce itself as one.
  */

  const ctaLabels = [t.hero.cta1, t.hero.cta2];
  const mobileTitleLines = lang === "hi"
    ? ["श्री", "चैतन्य", "महाप्रभु", "श्री राधा", "माधव", "मंदिर"]
    : ["Sree", "Chaitanya", "Mahaprabhu", "Sree Radha", "Madhav", "Mandir"];
  const mobileSubtitleLines = lang === "hi"
    ? ["जालंधर में हरिनाम, दर्शन और सेवा का", "पावन भक्ति धाम।"]
    : ["A sacred home for Harinam, Darshan, Seva", "and Devotion in Jalandhar."];

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : LOTUS_BREATH_TOKENS.stagger,
        delayChildren: reduce ? 0 : LOTUS_BREATH_TOKENS.stagger,
      },
    },
  };
  const item: Variants = {
    hidden: reduce
      ? { opacity: 1, y: 0 }
      : { opacity: 0, y: motionProfile.travel },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: reduce ? 0 : motionProfile.duration,
        ease: LOTUS_BREATH_EASE,
      },
    },
  };

  return (
    <section
      id="home"
      className="hero-twilight-backdrop relative min-h-[100dvh] w-full overflow-hidden bg-hero-warm flex flex-col items-center justify-center sm:min-h-screen sm:min-h-[100svh]"
    >
      <div className="absolute inset-0 bg-hero-warm" aria-hidden="true" />

      {!bgError && <HeroBackground onUnavailable={() => setBgError(true)} />}

      {bgError && (
        <>
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
        initial={false}
        animate="show"
        className="relative z-10 flex w-full flex-col items-center justify-center px-4 pb-20 pt-24 text-center sm:absolute sm:inset-0 sm:-translate-y-[3vh] sm:pb-[4vh] sm:pt-0"
      >
        <motion.div className="flex w-full flex-col items-center">
          <motion.div variants={item} className={`w-full max-w-[20rem] sm:w-[62%] ${lang === "hi" ? "sm:max-w-2xl lg:w-[54%]" : "sm:max-w-xl lg:w-[42%]"}`}>
            <h1
              aria-label={t.hero.title}
              className="font-display text-[1.5rem] font-semibold uppercase leading-[1.16] tracking-[0.045em] text-teal-dark sm:hidden"
            >
              {mobileTitleLines.map((line, i) => (
                <span key={`${line}-${i}`} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <RippleHeading
              text={t.hero.title}
              lang={lang}
              className={`hidden font-display font-semibold uppercase text-teal-dark sm:mt-3 sm:block sm:tracking-wide ${
                lang === "hi"
                  ? "sm:text-5xl sm:leading-[1.5] lg:text-6xl"
                  : "sm:text-4xl sm:leading-[1.25] lg:text-5xl"
              }`}
            />

            <p className="mx-auto mt-3 font-body text-[10px] leading-[1.45] text-teal-dark/80 sm:hidden">
              {mobileSubtitleLines.map((line) => (
                <span key={line} className="block whitespace-nowrap">
                  {line}
                </span>
              ))}
            </p>

            <p className={`mx-auto hidden font-body leading-relaxed text-teal-dark/80 sm:block ${lang === "hi" ? "mt-6 max-w-lg text-lg" : "mt-4 max-w-md text-base"}`}>
              {t.hero.subtitle}
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-3 grid w-full max-w-[11.5rem] grid-cols-1 gap-2 sm:mt-6 sm:flex sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3"
          >
            {CTAS.map(({ target, tint, Icon }, i) => (
              <motion.button
                key={target}
                type="button"
                onClick={() => scrollToElement(target)}
                whileHover={reduce ? undefined : { y: -2, scale: 1.02 }}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                // A single 250ms duration covered both hover AND press; the
                // press band is 100–160ms, so a tap felt slower than the
                // hover. spring.snappy (0.28s critically damped) answers the
                // hover, and Framer's inline transform already overrides
                // .btn-glass:active, so there is only one system on the button.
                transition={reduce ? { duration: 0 } : spring.snappy}
                className={`btn-glass ${tint} min-h-10 w-full whitespace-nowrap !gap-2 !px-2.5 !py-2 text-[9px] leading-none sm:min-h-0 sm:w-auto sm:!gap-2.5 sm:!px-5 sm:!py-2.5 sm:text-xs`}
              >
                <Icon />
                {ctaLabels[i]}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 sm:bottom-2">
        <LiveDarshanPlayer />
      </div>

    </section>
  );
}
