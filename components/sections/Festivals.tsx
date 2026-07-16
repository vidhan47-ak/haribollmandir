"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { festivalImages } from "@/lib/images";
import { useLang } from "@/lib/i18n";
import SacredCountdown from "@/components/features/SacredCountdown";
import DiyaOffering from "@/components/features/DiyaOffering";
import VeilReveal from "@/components/ui/VeilReveal";

const IMGS = [
  festivalImages.prakatUtsav,
  festivalImages.mango,
  festivalImages.ekadashi,
  festivalImages.jhulan,
  festivalImages.janmashtami,
  festivalImages.kartik,
];

export default function Festivals() {
  const { t, lang } = useLang();
  return (
    <section id="festivals" className="section-pad relative overflow-hidden bg-maroon-dark">
      <div className="parallax-section-bg pointer-events-none absolute inset-0" aria-hidden="true">
        <picture className="block h-full w-full">
          <source media="(max-width: 639px)" srcSet="/images/festivals-bg-mobile.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/festivals-bg.webp" alt="" loading="lazy" className="h-full w-full scale-[1.03] object-cover object-center" />
        </picture>
      </div>
      <div className="pattern-peacock pointer-events-none absolute inset-0 opacity-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

      <div className="container-temple relative z-10">
        <SectionHeading
          eyebrow={t.festivals.eyebrow}
          title={t.festivals.title}
          subtitle={t.festivals.subtitle}
          light
        />

        <SacredCountdown />

        <Stagger
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8"
          staggerChildren={0.1}
        >
          {t.festivals.items.map((festival, i) => {
            const img = IMGS[i];
            return (
              <StaggerItem key={i} x={i % 2 === 0 ? -28 : 28} y={10} duration={0.92}>
                <article
                  className="festival-card group relative h-full overflow-hidden rounded-[1.5rem] shadow-card ring-1 ring-gold/15"
                  onPointerMove={(event) => {
                    if (event.pointerType !== "mouse") return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    event.currentTarget.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
                    event.currentTarget.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
                  }}
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <FallbackImage
                      src={img.src}
                      alt={festival.title}
                      label={festival.title}
                      palette={img.palette}
                      className="h-full w-full object-cover transition-transform duration-[1300ms] ease-devotional group-hover:scale-110"
                    />
                    <VeilReveal tone="maroon" />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/90 via-maroon-dark/25 to-transparent" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="font-body text-[10px] uppercase tracking-widest2 text-gold-light">
                      {festival.when}
                    </span>
                    <h3 className="mt-2 font-heading text-2xl font-semibold text-cream">
                      {festival.title}
                    </h3>
                    <div className="mt-3 h-px w-10 origin-left scale-x-100 bg-gold/70 transition-all duration-500 ease-devotional group-hover:w-16" />
                    <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-cream/80">
                      {festival.blurb}
                    </p>
                    {i === 5 && <DiyaOffering lang={lang} />}
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
