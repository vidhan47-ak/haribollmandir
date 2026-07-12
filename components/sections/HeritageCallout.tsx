"use client";

import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import HeritageFigures from "@/components/sections/HeritageFigures";
import { useLang } from "@/lib/i18n";

/**
 * Homepage invitation band that links out to the dedicated Gaudiya Heritage
 * page. Keeps id="seva" so the Hero CTA and footer still land here.
 */
export default function HeritageCallout() {
  const { t } = useLang();
  return (
    <section id="seva" className="section-pad relative overflow-hidden bg-[#f5dfac] lg:min-h-[44rem]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/harinam-bg.webp"
          alt=""
          loading="lazy"
          className="h-full w-full scale-[1.03] object-cover object-center"
        />
      </div>
      <div className="pattern-peacock pointer-events-none absolute inset-0 opacity-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <HeritageFigures />

      <div className="container-temple relative z-10">
        <SectionHeading
          eyebrow={t.seva.eyebrow}
          title={t.seva.title}
          subtitle={t.seva.subtitle}
        />

        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-7 text-center">
            <p className="max-w-2xl font-body text-[15px] leading-relaxed text-ink-soft">
              {t.seva.body}
            </p>
            <Link href="/gaudiya-heritage" className="btn-gold">
              {t.seva.cta}
              <span aria-hidden="true" className="text-lg leading-none">
                →
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
