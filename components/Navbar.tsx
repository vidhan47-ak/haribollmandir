"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useSmoothScrollTo } from "@/components/SmoothScroll";
import LotusMark from "@/components/ui/LotusMark";
import { useLang } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

type NavKey = "home" | "about" | "festivals" | "heritage" | "gallery" | "visit";
type NavLink = { key: NavKey; target?: string; href?: string };

const LINKS: NavLink[] = [
  { key: "home", target: "#home" },
  { key: "about", target: "#about" },
  { key: "festivals", target: "#festivals" },
  { key: "heritage", href: "/gaudiya-heritage" },
  { key: "gallery", target: "#gallery" },
  { key: "visit", target: "#visit" },
];

// Sections tracked for the active-link scroll-spy (homepage only).
const SPY_TARGETS = ["#home", "#about", "#festivals", "#seva", "#gallery", "#visit"];

// Home sections with dark backdrops — the bar-less home navbar shows light text
// over these (hero, festivals, gallery) and dark text over the light sections.
const HOME_DARK_SECTIONS = ["#home", "#festivals", "#gallery"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [navDark, setNavDark] = useState(true);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const [logoOk, setLogoOk] = useState(true);
  const scrollTo = useSmoothScrollTo();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLang();

  const isHome = pathname === "/";
  // Keep the homepage navbar bar-less only at the top of the hero. Once the
  // page moves, transition into the Apple-style liquid-glass material.
  const glass = !isHome || scrolled;
  const lightText = isHome && !scrolled && navDark;
  const solid = glass || !lightText;

  // Home only: track whether the section directly behind the nav is a dark one,
  // so the bar-less nav text stays legible as sections alternate light/dark.
  useEffect(() => {
    if (!isHome) return;
    const sections = SPY_TARGETS.map((id) =>
      document.querySelector(id),
    ).filter((el): el is HTMLElement => el !== null);
    const NAV_Y = 72;
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 56);
      let dark = false;
      for (const el of sections) {
        const r = el.getBoundingClientRect();
        if (r.top <= NAV_Y && r.bottom > NAV_Y) {
          dark = HOME_DARK_SECTIONS.includes("#" + el.id);
          break;
        }
      }
      setNavDark(dark);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isHome]);

  // Active-link scroll-spy via IntersectionObserver — homepage only.
  useEffect(() => {
    if (!isHome) return;

    const els = SPY_TARGETS.map((id) => document.querySelector(id)).filter(
      (el): el is Element => el !== null,
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isHome]);

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isLinkActive = (link: NavLink) =>
    link.href ? pathname === link.href : isHome && active === link.target;

  const handleNav = (link: { target?: string; href?: string }) => {
    setOpen(false);
    // Wait a tick so the menu-close scroll unlock applies first.
    setTimeout(() => {
      if (link.href) {
        router.push(link.href);
        return;
      }
      if (!link.target) return;
      if (isHome) {
        scrollTo(link.target);
      } else {
        // Return to the homepage and let it scroll to the section (e.g. "/#about").
        router.push("/" + link.target);
      }
    }, 60);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-all duration-500 ease-devotional sm:px-4 sm:pt-4 lg:px-6"
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-full px-3 sm:gap-4 sm:px-6 ${
            glass
              ? "nav-liquid-glass nav-liquid-glass--solid py-2.5 transition-all duration-500 ease-devotional"
              : lightText
                ? "py-4 transition-none [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]"
                : "py-4 transition-none"
          }`}
        >
          {/* Brand */}
          <button
            onClick={() => handleNav({ target: "#home" })}
            className="group flex min-w-0 items-center gap-2 text-left sm:gap-3"
            aria-label="Back to top"
          >
            {logoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/logo.png"
                alt="Hariboll Mandir logo"
                draggable={false}
                onError={() => setLogoOk(false)}
                className="h-9 w-auto max-w-[96px] shrink-0 object-contain sm:h-11 sm:max-w-[132px]"
              />
            ) : (
              <LotusMark
                className={`h-9 w-9 shrink-0 transition-colors duration-500 ${
                  solid ? "text-maroon" : "text-gold-light"
                }`}
              />
            )}
            <span className="flex flex-col">
              <span
                className={`font-display text-sm font-semibold leading-normal tracking-wide transition-colors duration-500 sm:text-base ${
                  solid ? "text-maroon" : "text-cream"
                }`}
              >
                {t.nav.brand}
              </span>
              <span
                className={`mt-1 hidden font-body text-[10px] uppercase leading-none tracking-widest2 transition-colors duration-500 min-[380px]:block ${
                  solid ? "text-gold-deeper" : "text-gold-light/90"
                }`}
              >
                {t.nav.location}
              </span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((link) => {
              const isActive = isLinkActive(link);
              return (
                <button
                  key={link.href ?? link.target}
                  onClick={() => handleNav(link)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative px-2.5 py-2 font-body text-[13px] font-medium transition-colors duration-300 xl:px-3 xl:text-sm ${
                    solid
                      ? isActive
                        ? "text-maroon"
                        : "text-ink hover:text-maroon"
                      : isActive
                        ? "text-white"
                        : "text-cream/90 hover:text-white"
                  }`}
                >
                  {t.nav[link.key]}
                  <span
                    className={`absolute inset-x-2.5 -bottom-0.5 h-px origin-center bg-gold transition-all duration-300 ease-devotional xl:inset-x-3 ${
                      isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })}

            {/* Language toggle */}
            <LanguageToggle className={`ml-2 ${solid ? "text-maroon" : "text-cream"}`} />

            {/* Glass Contact Temple pill flanked by gold ornaments */}
            <div className="ml-2 flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`text-[8px] transition-colors duration-500 ${
                  solid ? "text-gold-deep" : "text-gold-light/80"
                }`}
              >
                ◆
              </span>
              <button
                onClick={() => handleNav({ target: "#visit" })}
                className={`nav-glass-btn ${solid ? "text-maroon" : "text-cream"}`}
              >
                {t.nav.contact}
              </button>
              <span
                aria-hidden="true"
                className={`text-[8px] transition-colors duration-500 ${
                  solid ? "text-gold-deep" : "text-gold-light/80"
                }`}
              >
                ◆
              </span>
            </div>
          </div>

          {/* Mobile: language toggle + hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle className={solid || open ? "text-maroon" : "text-cream"} />
            <button
              onClick={() => setOpen((v) => !v)}
              className={`relative z-50 flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 ${
                solid || open
                  ? "border-maroon/20 text-maroon"
                  : "border-cream/40 text-cream"
              }`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className="sr-only">Menu</span>
            <div className="flex flex-col items-center justify-center gap-1.5">
              <span
                className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
                  open ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-center bg-maroon-gradient pattern-floral px-8 lg:hidden"
          >
            <div className="pointer-events-none absolute inset-0 bg-maroon-dark/40" />
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
              }}
              className="relative space-y-2"
            >
              {LINKS.map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <motion.li
                    key={link.href ?? link.target}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      show: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button
                      onClick={() => handleNav(link)}
                      className={`link-underline font-heading text-4xl font-medium transition-colors duration-300 hover:text-gold-light ${
                        isActive ? "is-active text-gold-light" : "text-cream"
                      }`}
                    >
                      {t.nav[link.key]}
                    </button>
                  </motion.li>
                );
              })}
              <motion.li
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="pt-6"
              >
                <span className="font-script text-2xl text-gold-light">
                  Haribol!
                </span>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
