"use client";

import { Reveal } from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { images } from "@/lib/images";
import { useLang } from "@/lib/i18n";

const ARCH_PATH =
  "M24 556 L24 200 C24 150 60 132 120 108 C175 84 194 44 200 12 C206 44 225 84 280 108 C340 132 376 150 376 200 L376 556 Z";
const ARCH_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 560' preserveAspectRatio='none'><path d='${ARCH_PATH}' fill='white'/></svg>`,
)}")`;

const ICONS = [DiyaIcon, MalaIcon, OfferingIcon, CalendarIcon];

export default function About() {
  const { t } = useLang();
  return (
    <section id="about" className="section-pad relative overflow-hidden bg-[#d6b97f]">
      {/* Warm temple-kund scene, shared with the homepage's cinematic language. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/about.webp"
          alt=""
          loading="lazy"
          className="h-full w-full scale-[1.03] object-cover object-center"
        />
      </div>

      <div className="pattern-peacock pointer-events-none absolute inset-0 opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="container-temple relative z-10">
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] border border-gold/50 bg-transparent shadow-[0_36px_90px_-28px_rgba(40,24,8,0.72)] ring-1 ring-gold/25">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {/* Pre-blurred once at build time; avoids live backdrop-filter work while scrolling. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/about-glass.webp"
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full scale-[1.06] object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,250,240,0.94),rgba(250,238,215,0.92))]" />
            </div>
            <div className="pointer-events-none absolute inset-4 rounded-[1.9rem] border border-gold/30" />

            <div className="relative z-10 grid gap-10 p-7 sm:p-10 lg:grid-cols-[0.85fr_1.2fr] lg:items-center lg:gap-14 lg:p-14">
              <div className="order-2 lg:order-1">
                <div className="relative mx-auto w-full max-w-[340px]">
                  <div className="relative aspect-[400/560] w-full">
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        maskImage: ARCH_MASK,
                        WebkitMaskImage: ARCH_MASK,
                        maskSize: "100% 100%",
                        WebkitMaskSize: "100% 100%",
                        maskRepeat: "no-repeat",
                        WebkitMaskRepeat: "no-repeat",
                      }}
                    >
                      <FallbackImage
                        src={images.temple.src}
                        alt={images.temple.alt}
                        label={images.temple.label}
                        palette="maroon"
                        className="h-full w-full object-cover object-center"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-maroon-dark/30 via-transparent to-transparent" />
                    </div>

                    <svg viewBox="0 0 400 560" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                      <defs>
                        <linearGradient id="aboutArchGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0" stopColor="#e3c77e" />
                          <stop offset="0.5" stopColor="#c9a24b" />
                          <stop offset="1" stopColor="#a8842f" />
                        </linearGradient>
                      </defs>
                      <path d={ARCH_PATH} fill="none" stroke="url(#aboutArchGold)" strokeWidth="5" />
                    </svg>
                  </div>

                </div>
              </div>

              <div className="order-1 lg:order-2">
                <p className="flex items-center gap-3 font-display text-xs font-semibold uppercase tracking-widest2 text-gold-deeper">
                  <span className="h-px w-7 bg-gradient-to-r from-transparent to-gold" />
                  {t.about.eyebrow}
                  <span className="h-px w-7 bg-gradient-to-l from-transparent to-gold" />
                </p>

                <h2 className="mt-4 font-heading text-4xl font-semibold leading-[1.04] text-maroon-dark sm:text-5xl">
                  {t.about.title}
                </h2>

                <p className="mt-6 max-w-xl font-body text-[15px] leading-relaxed text-ink sm:text-base">
                  {t.about.p1}
                </p>
                <p className="mt-4 max-w-xl font-body text-[15px] leading-relaxed text-ink sm:text-base">
                  {t.about.p2}
                </p>

                <div className="mt-7 flex items-center gap-4">
                  <p className="border-l-2 border-gold-deep/70 pl-4 font-heading text-lg font-medium italic leading-snug text-maroon">
                    {t.about.quote}
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {t.about.features.map((f, i) => {
                    const Icon = ICONS[i];
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3.5 rounded-2xl border border-gold/25 bg-white/55 p-3.5 shadow-[0_10px_24px_-16px_rgba(60,35,10,0.5)] transition-colors duration-500 hover:border-gold/50 hover:bg-white/70"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-cream-50 text-gold-deep">
                          <Icon />
                        </span>
                        <div>
                          <p className="font-heading text-[15px] font-semibold leading-tight text-maroon">
                            {f.l1}
                          </p>
                          <p className="font-heading text-[15px] font-semibold leading-tight text-maroon">
                            {f.l2}
                          </p>
                          <span className="mt-1.5 block h-px w-6 bg-gradient-to-r from-gold to-transparent" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DiyaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3c1.6 1.8 1.6 4.2 0 6-1.6-1.8-1.6-4.2 0-6Z" />
      <path d="M4 13c2.2 2.6 5 3.8 8 3.8s5.8-1.2 8-3.8c-2.4-1-5-1.5-8-1.5S6.4 12 4 13Z" />
      <path d="M7 16.5c1.6 1.6 3.2 2.3 5 2.3s3.4-.7 5-2.3" opacity="0.55" />
    </svg>
  );
}

function MalaIcon() {
  const beads = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const cx = 12 + Math.cos(angle) * 7;
    const cy = 11 + Math.sin(angle) * 7;
    return <circle key={i} cx={cx} cy={cy} r={1.15} />;
  });
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <g>{beads}</g>
      <g fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
        <path d="M12 18c0 1.6-1 2.2-1 3.6M12 18c0 1.6 1 2.2 1 3.6" />
      </g>
    </svg>
  );
}

function OfferingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5c-1 2-3 3.2-5 4.2C5 10 4.5 12 5.2 14l1.9 4.4c.4.9 1.3 1.6 2.3 1.6h5.2c1 0 1.9-.7 2.3-1.6L18.8 14c.7-2 .2-4-1.8-4.8C15 8.2 13 7 12 5Z" />
      <path d="M12 5v13" opacity="0.5" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </svg>
  );
}
