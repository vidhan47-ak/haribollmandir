"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { images } from "@/lib/images";
import { useLang } from "@/lib/i18n";

const IMGS = [images.mahaprabhu, images.radhaMadhav, images.radhaRani];

export default function Darshan() {
  const { t } = useLang();
  return (
    <section id="darshan" className="section-pad relative overflow-hidden bg-[#ead7ad]">
      {/* Govardhan scene — a calm, continuous Vrindavan backdrop. */}
      <div className="parallax-section-bg pointer-events-none absolute inset-0" aria-hidden="true">
        <picture className="block h-full w-full">
          <source media="(max-width: 639px)" srcSet="/images/darshan-mobile.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/darshan.webp" alt="" loading="lazy" className="h-full w-full scale-[1.03] object-cover object-center" />
        </picture>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,247,230,0.84)_0%,rgba(250,235,205,0.50)_28%,rgba(45,36,18,0.18)_62%,rgba(250,239,216,0.80)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(62,38,15,0.18)_100%)]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="container-temple relative z-10">
        <SectionHeading
          eyebrow={t.darshan.eyebrow}
          title={t.darshan.title}
          subtitle={t.darshan.subtitle}
        />

        <Stagger className="mt-16 grid gap-8 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-10">
          {t.darshan.deities.map((deity, i) => {
            const img = IMGS[i];
            return (
              <StaggerItem key={i}>
                <article className="card-temple group flex h-full flex-col !bg-transparent border border-white/45">
                  <div className="relative aspect-[4/5] shrink-0 overflow-hidden">
                    <FallbackImage
                      src={img.src}
                      alt={deity.name}
                      label={deity.name}
                      palette={img.palette}
                      className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-devotional group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/45 via-transparent to-transparent opacity-70" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
                  </div>

                  <div className="darshan-glass-panel flex-1 px-7 pb-9 pt-7 text-center">
                    <h3 className="font-heading text-2xl font-semibold text-maroon">
                      {deity.name}
                    </h3>
                    <div className="divider-lotus mt-4" />
                    <p className="mt-5 font-body text-[15px] leading-relaxed text-ink-soft">
                      {deity.text}
                    </p>
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
