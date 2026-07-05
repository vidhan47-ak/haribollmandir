"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLenisInstance, useSmoothScrollTo } from "@/components/SmoothScroll";
import LotusMark from "@/components/ui/LotusMark";

type NavLink = { label: string; target?: string; href?: string };

const LINKS: NavLink[] = [
  { label: "Home", target: "#home" },
  { label: "About Temple", target: "#about" },
  { label: "Festivals", target: "#festivals" },
  { label: "Gaudiya Heritage", href: "/gaudiya-heritage" },
  { label: "Gallery", target: "#gallery" },
  { label: "Visit Us", target: "#visit" },
];

// Sections tracked for the active-link scroll-spy (homepage only).
const SPY_TARGETS = ["#home", "#about", "#festivals", "#seva", "#gallery", "#visit"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const scrollTo = useSmoothScrollTo();
  const lenis = useLenisInstance();
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
  // On interior routes there is no dark hero to sit over, so keep the navbar in
  // its solid, legible treatment rather than the transparent-over-hero look.
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, lenis]);

  const isLinkActive = (link: NavLink) =>
    link.href ? pathname === link.href : isHome && active === link.target;

  const handleNav = (link: NavLink) => {
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
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-devotional ${
          solid
            ? "border-b border-gold/15 bg-cream/5 py-3 shadow-soft backdrop-blur-md"
            : "border-b border-transparent bg-transparent py-5"
        }`}
      >
        <nav className={`container-temple flex items-center justify-between gap-4${solid ? "" : " [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]"}`}>
          {/* Brand */}
          <button
            onClick={() => handleNav({ target: "#home" })}
            className="group flex items-center gap-3 text-left -ml-1 sm:-ml-2 lg:-ml-6 xl:-ml-9"
            aria-label="Back to top"
          >
            <LotusMark
              className={`h-9 w-9 shrink-0 transition-colors duration-500 ${
                solid ? "text-maroon" : "text-gold-light"
              }`}
            />
            <span className="flex flex-col">
              <span
                className={`font-display text-base font-semibold leading-normal tracking-wide transition-colors duration-500 ${
                  solid ? "text-maroon" : "text-cream"
                }`}
              >
                Hariboll Mandir
              </span>
              <span
                className={`mt-1 font-body text-[10px] uppercase leading-none tracking-widest2 transition-colors duration-500 ${
                  solid ? "text-gold-deep" : "text-gold-light/90"
                }`}
              >
                Jalandhar, Punjab
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
                  {link.label}
                  <span
                    className={`absolute inset-x-2.5 -bottom-0.5 h-px origin-center bg-gold transition-all duration-300 ease-devotional xl:inset-x-3 ${
                      isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })}

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
                Contact Temple
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

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={`relative z-50 flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 lg:hidden ${
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
                      {link.label}
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
