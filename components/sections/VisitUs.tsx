"use client";

import { Reveal } from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { useLang } from "@/lib/i18n";
import VeilReveal from "@/components/ui/VeilReveal";
import { TempleLinkRows } from "@/components/ui/TempleLinks";
import {
  TEMPLE_EMAIL,
  TEMPLE_MAP_EMBED_URL,
  aaratiScheduleLine,
  templeLink,
} from "@/lib/temple";

const DIRECTIONS_URL = templeLink("maps").href;

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.4-7-11a7 7 0 1 1 14 0c0 4.6-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7 7.4 5.4a1.4 1.4 0 0 0 1.6 0L20.2 7" />
    </svg>
  );
}

export default function VisitUs() {
  const { t, lang } = useLang();
  return (
    <section id="visit" className="section-pad relative overflow-hidden bg-[#d8c28f]">
      <div className="parallax-section-bg pointer-events-none absolute inset-0" aria-hidden="true">
        <picture className="block h-full w-full">
          <source media="(max-width: 639px)" srcSet="/images/visit-bg-mobile.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/visit-bg.webp" alt="" loading="lazy" className="h-full w-full scale-[1.03] object-cover object-center" />
        </picture>
      </div>
      <div className="pattern-peacock pointer-events-none absolute inset-0 opacity-10" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="container-temple relative z-10">
        <SectionHeading
          eyebrow={t.visit.eyebrow}
          title={t.visit.title}
          subtitle={t.visit.subtitle}
          className="rounded-[2rem] border border-white/55 bg-[#fff8e8]/90 px-5 py-6 shadow-[0_18px_50px_-28px_rgba(45,28,8,0.55)] sm:px-10 sm:py-8"
        />

        <div className="mt-8 overflow-hidden rounded-[1.6rem] sm:rounded-[2rem] border border-gold/25 bg-cream-50 shadow-soft sm:mt-12 lg:mt-16">
          <div className="grid lg:grid-cols-2">
            <Reveal className="darshan-glass-panel p-5 xs:p-6 sm:p-10 lg:p-12">
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="mt-1 shrink-0 text-gold-deep">
                  <PinIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-xl font-semibold text-maroon sm:text-2xl">
                    {t.visit.addressName}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-soft sm:mt-3 sm:text-base">
                    {t.visit.address}
                  </p>
                </div>
              </div>

              <div className="my-6 h-px w-full bg-gradient-to-r from-gold/40 to-transparent sm:my-8" />

              <div className="flex items-start gap-3 sm:gap-4">
                <span className="mt-1 shrink-0 text-gold-deep">
                  <ClockIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-xs uppercase tracking-widest2 text-gold-deeper">
                    {t.visit.timingsLabel}
                  </p>
                  <ul className="mt-3 space-y-2.5">
                    {t.visit.timings.map((tm) => (
                      <li
                        key={tm.label}
                        className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between font-body text-xs sm:text-[15px]"
                      >
                        <span className="font-medium text-ink-soft">{tm.label}</span>
                        <span className="font-semibold tabular-nums text-maroon">{tm.value}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3.5 border-t border-gold/20 pt-3 font-body text-xs text-ink-soft sm:text-[13px]">
                    <span className="block mb-1 font-semibold text-gold-deeper">
                      {t.visit.aaratiLabel}
                    </span>
                    <span className="block leading-relaxed break-words tabular-nums text-ink">
                      {aaratiScheduleLine(lang)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="my-6 h-px w-full bg-gradient-to-r from-gold/40 to-transparent sm:my-8" />

              {/* Every way to reach the mandir — email, WhatsApp, the social
                  channels and directions, all read from lib/temple.ts. */}
              <div className="flex items-start gap-3 sm:gap-4">
                <span className="mt-1 shrink-0 text-gold-deep">
                  <MailIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-body text-xs uppercase tracking-widest2 text-gold-deeper">
                    {t.visit.reachUsLabel}
                  </p>
                  <TempleLinkRows
                    lang={lang}
                    ids={["whatsapp", "email", "instagram", "broadcast", "facebook", "youtube"]}
                    className="mt-3"
                  />
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="btn-gold">
                  {t.visit.getDirections}
                </a>
                <a href={`mailto:${TEMPLE_EMAIL}`} className="btn-outline-dark">
                  {t.visit.contactTemple}
                </a>
              </div>
            </Reveal>

            <div className="relative min-h-[360px] bg-forest/5 lg:min-h-full">
              <div className="pattern-peacock absolute inset-0 opacity-70" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-forest/50">
                <PinIcon />
                <span className="font-body text-xs uppercase tracking-widest2">
                  {t.visit.mapPin}
                </span>
              </div>
              <iframe
                title={t.visit.addressName}
                src={TEMPLE_MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
              {/* Ceremonial veil on desktop only. On mobile this cream/gold
                  gradient (z-index 6) sits over the map and would cover it. */}
              <div className="hidden lg:block">
                <VeilReveal />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
