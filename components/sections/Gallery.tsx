"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { darshanGallery, type Palette } from "@/lib/images";
import { useLang } from "@/lib/i18n";

const EASE = [0.22, 1, 0.36, 1] as const;

const PALETTE_GRADIENT: Record<Palette, string> = {
  maroon: "radial-gradient(1100px circle at 50% 25%, rgba(110,30,42,0.12), transparent 60%)",
  gold: "radial-gradient(1100px circle at 50% 25%, rgba(201,162,75,0.16), transparent 60%)",
  forest: "radial-gradient(1100px circle at 50% 25%, rgba(35,68,55,0.13), transparent 60%)",
  sky: "radial-gradient(1100px circle at 50% 25%, rgba(110,151,172,0.15), transparent 60%)",
  cream: "radial-gradient(1100px circle at 50% 25%, rgba(201,162,75,0.10), transparent 60%)",
};

const PALETTE_GLOW: Record<Palette, string> = {
  maroon: "rgba(110,30,42,0.30)",
  gold: "rgba(201,162,75,0.38)",
  forest: "rgba(35,68,55,0.30)",
  sky: "rgba(110,151,172,0.34)",
  cream: "rgba(201,162,75,0.26)",
};

const ARC_SLOTS: { x: number; y: number; rot: number }[] = [
  { x: 240, y: 0, rot: 8 },
  { x: -240, y: 0, rot: -8 },
  { x: 420, y: 80, rot: 16 },
  { x: -420, y: 80, rot: -16 },
  { x: 580, y: 190, rot: 26 },
  { x: -580, y: 190, rot: -26 },
];

export default function Gallery() {
  const [selected, setSelected] = useState(0);
  const reduce = useReducedMotion();
  const { t } = useLang();

  const items = darshanGallery.map((g, i) => ({
    ...g,
    title: t.gallery.items[i]?.title ?? g.title,
    caption: t.gallery.items[i]?.caption ?? g.caption,
  }));
  const active = items[selected];
  const total = items.length;

  const arcItems = ARC_SLOTS.map((slot, i) => {
    const index = (selected + i + 1) % total;
    return { index, slot, ...items[index] };
  });

  const renderFeatured = (rounded: string, aspect: string) => (
    <AnimatePresence mode="wait">
      <motion.div
        key={selected}
        initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
        transition={{ duration: reduce ? 0.001 : 0.55, ease: EASE }}
        className={`relative overflow-hidden shadow-arch ring-1 ring-gold/30 ${rounded}`}
      >
        <div className={`${aspect} w-full`}>
          <FallbackImage
            src={active.src}
            alt={active.title}
            label={active.title}
            palette={active.palette}
            loading="eager"
            className="h-full w-full object-cover object-top"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-1/2 items-end justify-center bg-gradient-to-t from-black/70 to-transparent px-5 pb-6">
          <h3 className="text-center font-heading text-2xl text-cream [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">
            {active.title}
          </h3>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  const textBlock = (
    <div className="mx-auto mt-6 max-w-lg text-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -10 }}
          transition={{ duration: reduce ? 0.001 : 0.5, ease: EASE }}
        >
          <span className="font-display text-xs uppercase tracking-widest2 text-gold-light">
            {String(selected + 1).padStart(2, "0")}
            <span className="text-gold-light/50"> / {String(total).padStart(2, "0")}</span>
          </span>
          <div className="divider-lotus mt-6" />
          <p className="mt-6 font-body text-base leading-relaxed text-cream/75">
            {active.caption}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const tabs = (
    <div role="tablist" aria-label="Darshan gallery" className="mt-10 hidden flex-wrap justify-center gap-2.5 lg:flex">
      {items.map((item, i) => {
        const isActive = selected === i;
        return (
          <button
            key={i}
            role="tab"
            aria-selected={isActive}
            onClick={() => setSelected(i)}
            className={`rounded-full border px-4 py-2 font-body text-sm transition-all duration-300 ease-devotional focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
              isActive
                ? "border-transparent bg-gold-gradient text-teal-dark shadow-soft ring-1 ring-gold"
                : "border-gold/40 text-cream/80 hover:border-gold hover:text-cream"
            }`}
          >
            {item.title}
          </button>
        );
      })}
    </div>
  );

  return (
    <section id="gallery" className="section-pad relative overflow-hidden bg-[#071d26]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/gallery-bg.webp"
          alt=""
          loading="lazy"
          className="h-full w-full scale-[1.03] object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#061d25]/35" />
      </div>
      <div aria-hidden className="pattern-peacock pointer-events-none absolute inset-0 opacity-10" />

      <AnimatePresence>
        <motion.div
          key={active.palette}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.8, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: PALETTE_GRADIENT[active.palette] }}
        />
      </AnimatePresence>

      <div className="container-temple relative z-10">
        <Reveal>
          <SectionHeading
            eyebrow={t.gallery.eyebrow}
            title={t.gallery.title}
            subtitle={t.gallery.subtitle}
            light
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-14 lg:mt-20">
          <div className="relative mx-auto hidden h-[480px] w-full max-w-[1040px] lg:block xl:h-[520px]">
            <AnimatePresence>
              <motion.div
                key={active.palette}
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.8, ease: "easeInOut" }}
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-[58%] rounded-full"
                style={{ background: `radial-gradient(circle, ${PALETTE_GLOW[active.palette]}, transparent 70%)` }}
              />
            </AnimatePresence>

            {arcItems.map((item, i) => (
              <div
                key={`arc-${item.index}-${i}`}
                className="pointer-events-auto absolute left-1/2 top-1/2 z-20"
                style={{ transform: `translate(-50%, -50%) translate(${item.slot.x}px, ${item.slot.y}px) rotate(${item.slot.rot}deg)` }}
              >
                <motion.button
                  onClick={() => setSelected(item.index)}
                  aria-label={item.title}
                  whileHover={reduce ? undefined : { y: -6, scale: 1.035 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="relative block h-40 w-36 overflow-hidden rounded-[1.5rem] shadow-card ring-1 ring-gold/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                >
                  <FallbackImage
                    key={item.src}
                    src={item.src}
                    alt={item.title}
                    label={item.title}
                    palette={item.palette}
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
                  />
                  <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/10" />
                </motion.button>
              </div>
            ))}

            <div className="absolute left-1/2 top-1/2 z-30 flex w-[360px] -translate-x-1/2 -translate-y-[55%] flex-col items-center xl:w-[400px]">
              <div className="w-full">{renderFeatured("rounded-[2rem]", "aspect-[3/4]")}</div>
            </div>
          </div>

          <div className="mx-auto max-w-sm lg:hidden">
            {renderFeatured("rounded-3xl", "aspect-[4/5]")}
          </div>

          {textBlock}

          {tabs}

          <p className="mt-8 text-center font-body text-[10px] uppercase tracking-widest2 text-gold-light/65 lg:hidden">
            Swipe to explore darshan
          </p>
          <div className="relative mt-3 lg:hidden">
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 z-10 h-20 w-10 bg-gradient-to-l from-[#0b2f2a] to-transparent" />
            <div
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Darshan thumbnails"
            >
            {items.map((item, i) => {
              const isActive = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  aria-label={item.title}
                  className={`relative h-20 w-20 shrink-0 snap-start overflow-hidden rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                    isActive ? "ring-2 ring-gold" : "opacity-80 ring-1 ring-gold/20"
                  }`}
                >
                  <FallbackImage
                    src={item.src}
                    alt={item.title}
                    label={item.title}
                    palette={item.palette}
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
                  />
                </button>
              );
            })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
