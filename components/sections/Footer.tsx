"use client";

import { usePathname } from "next/navigation";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import LotusMark from "@/components/ui/LotusMark";
import { useLotusNavigate } from "@/components/ui/ViewTransitions";
import { scrollToElement } from "@/lib/scroll-helper";
import { useLang } from "@/lib/i18n";
import { motion, useReducedMotion } from "framer-motion";
import { TempleSocialIcons } from "@/components/ui/TempleLinks";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import { TEMPLE_EMAIL, aaratiSummary } from "@/lib/temple";

const TARGETS = ["#darshan", "#bhakti", "#about", "#seva", "#festivals", "/gaudiya-heritage", "/grantha-mandir", "#gallery", "#visit"];

export default function Footer() {
  const pathname = usePathname();
  const navigate = useLotusNavigate();
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();

  const goTo = (target: string) => {
    if (target.startsWith("/")) {
      navigate(target);
      return;
    }
    if (pathname === "/") {
      scrollToElement(target, -80);
    } else {
      navigate("/" + target);
    }
  };

  return (
    <footer
      id="footer"
      className="relative overflow-hidden bg-maroon-gradient text-cream"
    >
      <div className="pattern-floral pointer-events-none absolute inset-0 opacity-25" />
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-transparent via-gold to-transparent"
        initial={reduce ? false : { opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: reduce ? 0 : 1.25, ease: EASE_DEVOTIONAL }}
      />

      <div>
        <div className="container-temple relative py-16 lg:py-20">
          {/* Four columns arrive on the shared 70ms stagger rather than as one
              block — the token layer clamps this to LOTUS_BREATH_TOKENS. */}
          <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_1fr_1.4fr] lg:gap-12">
            <StaggerItem>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.png" alt="Hariboll Mandir logo" className="h-10 w-10 shrink-0 object-contain" />
                <div className="leading-tight">
                  <p className="font-display text-lg font-semibold text-cream">
                    {t.footer.brand}
                  </p>
                  <p className="font-body text-[11px] uppercase tracking-widest2 text-gold-light/80">
                    {t.footer.brandSub}
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-sm font-heading text-xl leading-relaxed text-cream/90">
                {t.footer.addressName}
              </p>
              <p className="mt-3 font-body text-sm text-cream/70">
                {t.footer.address}
              </p>
            </StaggerItem>

            <StaggerItem as="nav">
              <p className="font-body text-xs uppercase tracking-widest2 text-gold-light">
                {t.footer.explore}
              </p>
              <ul className="mt-5 space-y-3">
                {t.footer.links.map((label, i) => (
                  <li key={TARGETS[i]}>
                    <button
                      onClick={() => goTo(TARGETS[i])}
                      className="link-underline font-body text-sm text-cream/75 transition-colors duration-300 hover:text-gold-light"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </StaggerItem>

            <StaggerItem>
              <p className="font-body text-xs uppercase tracking-widest2 text-gold-light">
                {t.footer.connect}
              </p>
              {/* Icons and the email both come from lib/temple.ts. */}
              <TempleSocialIcons lang={lang} className="mt-5" />
              <p className="mt-5 font-body text-xs uppercase tracking-widest2 text-gold-light/80">
                {t.footer.writeToUs}
              </p>
              <a
                href={`mailto:${TEMPLE_EMAIL}`}
                className="link-underline mt-2 inline-block break-all font-body text-sm text-cream/80 transition-colors duration-200 hover:text-gold-light"
              >
                {TEMPLE_EMAIL}
              </a>
              <div className="-mt-8 -mb-14 -ml-3 sm:-mt-12 sm:-mb-20 sm:-ml-5">
                <img
                  src="/images/Hariboll.png"
                  alt="Haribol!"
                  draggable={false}
                  className="h-40 sm:h-52 w-auto max-w-[420px] object-contain"
                />
              </div>
            </StaggerItem>

            {/* Darshan timings — given 1.4fr width with flex wrapping so it never squishes. */}
            <StaggerItem className="min-w-0">
              <p className="font-body text-xs uppercase tracking-widest2 text-gold-light">
                {t.footer.timingsLabel}
              </p>
              <dl className="mt-5 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-cream/10 pb-3">
                  <dt className="flex items-center gap-2 font-body text-sm text-cream/75">
                    <span aria-hidden="true" className="relative flex h-2 w-2">
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300/90" />
                    </span>
                    {t.footer.liveLabel}
                  </dt>
                  <dd className="font-body text-sm tabular-nums text-gold-light">
                    {aaratiSummary(lang)}
                  </dd>
                </div>
                {t.visit.timings.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-cream/10 pb-3"
                  >
                    <dt className="font-body text-sm text-cream/75">{row.label}</dt>
                    <dd className="font-body text-sm tabular-nums text-cream/90">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </StaggerItem>
          </Stagger>

          <Reveal delay={0.12}>
            <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/15 pt-8 text-center sm:flex-row sm:text-left">
              <p className="font-body text-xs text-cream/60">
                © {year} {t.footer.rights}
              </p>
              <p className="font-body text-xs text-cream/60">{t.footer.made}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </footer>
  );
}
