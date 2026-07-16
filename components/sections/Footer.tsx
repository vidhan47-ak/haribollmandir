"use client";

import { usePathname, useRouter } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import LotusMark from "@/components/ui/LotusMark";
import { useSmoothScrollTo } from "@/components/SmoothScroll";
import { useLang } from "@/lib/i18n";
import { motion, useReducedMotion } from "framer-motion";

const TARGETS = ["#darshan", "#about", "#seva", "#festivals", "#gallery", "#visit"];

export default function Footer() {
  const scrollTo = useSmoothScrollTo();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLang();
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();

  const goTo = (target: string) => {
    if (pathname === "/") {
      scrollTo(target);
    } else {
      router.push("/" + target);
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
        transition={{ duration: reduce ? 0 : 1.25, ease: [0.22, 1, 0.36, 1] }}
      />

      <Reveal>
        <div className="container-temple relative py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <LotusMark className="h-10 w-10 text-gold-light" />
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
            </div>

            <nav>
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
            </nav>

            <div>
              <p className="font-body text-xs uppercase tracking-widest2 text-gold-light">
                {t.footer.connect}
              </p>
              <a
                href="https://instagram.com/hariboll_mandir"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-5 inline-flex items-center gap-2 font-body text-sm text-cream/80 transition-colors duration-300 hover:text-gold-light"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                @hariboll_mandir
              </a>
              <p className="mt-8 font-script text-3xl text-gold-light">
                {t.footer.haribol}
              </p>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/15 pt-8 text-center sm:flex-row sm:text-left">
            <p className="font-body text-xs text-cream/60">
              © {year} {t.footer.rights}
            </p>
            <p className="font-body text-xs text-cream/60">{t.footer.made}</p>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
