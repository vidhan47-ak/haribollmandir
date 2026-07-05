"use client";

import { usePathname, useRouter } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import LotusMark from "@/components/ui/LotusMark";
import { useSmoothScrollTo } from "@/components/SmoothScroll";

const LINKS = [
  { label: "Darshan", target: "#darshan" },
  { label: "About Temple", target: "#about" },
  { label: "Seva & Donations", target: "#seva" },
  { label: "Festivals", target: "#festivals" },
  { label: "Gallery", target: "#gallery" },
  { label: "Visit Us", target: "#visit" },
];

export default function Footer() {
  const scrollTo = useSmoothScrollTo();
  const pathname = usePathname();
  const router = useRouter();
  const year = new Date().getFullYear();

  // Smooth-scroll on the homepage; from other routes return home and scroll.
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
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

      <Reveal>
        <div className="container-temple relative py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <LotusMark className="h-10 w-10 text-gold-light" />
                <div className="leading-tight">
                  <p className="font-display text-lg font-semibold text-cream">
                    Hariboll Mandir
                  </p>
                  <p className="font-body text-[11px] uppercase tracking-widest2 text-gold-light/80">
                    Radha Madhav · Jalandhar
                  </p>
                </div>
              </div>
              <p className="mt-5 max-w-sm font-heading text-xl leading-relaxed text-cream/90">
                Sree Chaitanya Mahaprabhu
                <br />
                Sree Radha Madhav Mandir
              </p>
              <p className="mt-3 font-body text-sm text-cream/70">
                Pratap Bagh, Jalandhar, Punjab
              </p>
            </div>

            {/* Explore */}
            <nav>
              <p className="font-body text-xs uppercase tracking-widest2 text-gold-light">
                Explore
              </p>
              <ul className="mt-5 space-y-3">
                {LINKS.map((link) => (
                  <li key={link.target}>
                    <button
                      onClick={() => goTo(link.target)}
                      className="link-underline font-body text-sm text-cream/75 transition-colors duration-300 hover:text-gold-light"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Connect */}
            <div>
              <p className="font-body text-xs uppercase tracking-widest2 text-gold-light">
                Connect
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
                Haribol!
              </p>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/15 pt-8 text-center sm:flex-row sm:text-left">
            <p className="font-body text-xs text-cream/60">
              © {year} Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir,
              Jalandhar.
            </p>
            <p className="font-body text-xs text-cream/60">
              Made with devotion · Hare Krishna
            </p>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
