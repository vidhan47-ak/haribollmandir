"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import {
  useScrollController,
  useSmoothScrollTo,
} from "@/components/SmoothScroll";
import { SuspensionReason } from "@/components/scroll";
import LotusMark from "@/components/ui/LotusMark";
import { clampToViewport } from "@/lib/clamp-drag";
import {
  DRAG_ELASTIC,
  EASE_DEVOTIONAL,
  dragInertia,
  dragInertiaReduced,
  spring,
} from "@/lib/springs";
import { useLang } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import { useLotusNavigate } from "@/components/ui/ViewTransitions";

type NavKey = "home" | "daily" | "about" | "festivals" | "calendar" | "heritage" | "library" | "gallery" | "visit";
type NavLink = { key: NavKey; target?: string; href?: string };

const LINKS: NavLink[] = [
  { key: "home", target: "#home" },
  { key: "daily", target: "#bhakti" },
  { key: "about", target: "#about" },
  { key: "festivals", target: "#festivals" },
  { key: "calendar", href: "/vaishnava-calendar" },
  { key: "heritage", href: "/gaudiya-heritage" },
  { key: "library", href: "/grantha-mandir" },
  { key: "gallery", target: "#gallery" },
  { key: "visit", target: "#visit" },
];

// Sections tracked for the active-link scroll-spy (homepage only).
const SPY_TARGETS = ["#home", "#bhakti", "#about", "#festivals", "#seva", "#gallery", "#visit"];

// Home sections with dark backdrops — the bar-less home navbar shows light text
// over these (hero, festivals, gallery) and dark text over the light sections.
const HOME_DARK_SECTIONS = ["#home", "#bhakti", "#festivals", "#gallery"];

// Remembers where the user parked the draggable navbar capsule.
const NAV_POS_KEY = "hariboll-nav-pos";
// Shared with the sadhana dock: nudge the drag affordance once, ever.
const DRAG_HINT_KEY = "hariboll-drag-hint-seen";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [navDark, setNavDark] = useState(true);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");
  const [logoOk, setLogoOk] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrImgOk, setQrImgOk] = useState(true);
  const qrRef = useRef<HTMLDivElement | null>(null);
  // Live drag offset as motion values so a flicked capsule coasts on its own
  // momentum and rubber-bands at the viewport edge before settling home.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [posReady, setPosReady] = useState(false);
  const [floating, setFloating] = useState(false);
  const [dragHint, setDragHint] = useState(false);
  const reduce = useReducedMotion();
  const persistTimer = useRef<number | null>(null);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const scrollTo = useSmoothScrollTo();
  const scrollController = useScrollController();
  const pathname = usePathname();
  const navigate = useLotusNavigate();
  const { t, lang } = useLang();

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

  // Acquire and release the controller suspension with the existing body lock.
  // The cleanup also covers close-before-navigation and unmount while open.
  useEffect(() => {
    if (!open) return;

    scrollController.suspend(SuspensionReason.MOBILE_MENU);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      scrollController.resume(SuspensionReason.MOBILE_MENU);
    };
  }, [open, scrollController]);

  // Restore the last dragged position (floating capsule) on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(NAV_POS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { x?: number; y?: number };
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          x.set(parsed.x);
          y.set(parsed.y);
          setFloating(Math.abs(parsed.x) > 1 || Math.abs(parsed.y) > 1);
        }
      }
    } catch {
      // A missing/blocked store just keeps the nav docked at the top.
    }
    setPosReady(true);
  }, []);

  // Keep the restored/parked capsule inside the frame — a position saved on a
  // wide screen (or before a rotate/resize) could otherwise sit partly off it.
  useEffect(() => {
    if (!posReady) return;
    const reclamp = () => {
      const cx = x.get();
      const cy = y.get();
      const next = clampToViewport(navRef.current, cx, cy, cx, cy);
      if (next.x === cx && next.y === cy) return;
      animate(x, next.x, spring.default);
      animate(y, next.y, spring.default);
      persistPos(next);
    };
    reclamp();
    window.addEventListener("resize", reclamp);
    return () => window.removeEventListener("resize", reclamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posReady]);

  // Pulse the grip once, ever, so the drag affordance is discoverable.
  useEffect(() => {
    let seen = true;
    try {
      seen = window.localStorage.getItem(DRAG_HINT_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen) return;

    const start = window.setTimeout(() => setDragHint(true), 1600);
    const stop = window.setTimeout(() => {
      setDragHint(false);
      try {
        window.localStorage.setItem(DRAG_HINT_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 6300);
    return () => {
      window.clearTimeout(start);
      window.clearTimeout(stop);
    };
  }, []);

  // Close the donation-QR popover on outside click or Escape. Escape was
  // missing, so keyboard users had no way to dismiss it.
  useEffect(() => {
    if (!qrOpen) return;
    const onDown = (e: PointerEvent) => {
      if (qrRef.current && !qrRef.current.contains(e.target as Node)) {
        setQrOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQrOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [qrOpen]);

  // Escape also closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const persistPos = (next: { x: number; y: number }) => {
    try {
      window.localStorage.setItem(NAV_POS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // A thrown capsule keeps gliding after release; once it settles, persist the
  // resting place and update whether the bar now reads as floating (compact).
  const schedulePersist = () => {
    if (persistTimer.current) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      const nx = Math.round(x.get());
      const ny = Math.round(y.get());
      persistPos({ x: nx, y: ny });
      setFloating(Math.abs(nx) > 1 || Math.abs(ny) > 1);
    }, 220);
  };
  useMotionValueEvent(x, "change", schedulePersist);
  useMotionValueEvent(y, "change", schedulePersist);

  const resetPos = () => {
    animate(x, 0, spring.default);
    animate(y, 0, spring.default);
    persistPos({ x: 0, y: 0 });
    setFloating(false);
  };

  const isLinkActive = (link: NavLink) =>
    link.href ? pathname === link.href : isHome && active === link.target;

  /**
   * Mobile-menu item entrance. Declared once and gated on `reduce` — the four
   * inline copies of this were the site's largest reduced-motion hole: the CSS
   * media query cannot reach Framer's inline styles, so every menu row still
   * slid 24px with a 70ms stagger for visitors who asked for no motion.
   */
  const menuItem = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
  };
  const menuItemTransition = {
    duration: reduce ? 0.2 : 0.5,
    ease: EASE_DEVOTIONAL,
  };

  const handleNav = (link: { target?: string; href?: string }) => {
    setOpen(false);
    // Wait a tick so the menu-close scroll unlock applies first.
    setTimeout(() => {
      if (link.href) {
        navigate(link.href);
        return;
      }
      if (!link.target) return;
      if (isHome) {
        scrollTo(link.target);
      } else {
        // Return to the homepage and let it scroll to the section (e.g. "/#about").
        navigate("/" + link.target);
      }
    }, 60);
  };

  return (
    <>
      {/* Drag boundary (inset ~8px) for the floating nav capsule — Framer
          rubber-bands against this edge and springs the capsule back inside. */}
      <div ref={constraintsRef} className="pointer-events-none fixed inset-2 z-[49]" aria-hidden="true" />

      {/* Only the top padding changes here, so `transition-all` (which reaches
          off-GPU properties) is narrowed to exactly that. */}
      <header
        className={`fixed inset-x-0 top-0 z-50 px-3 transition-[padding-top] duration-300 ease-devotional sm:px-4 lg:px-6 ${
          scrolled ? "pt-2" : "pt-3 sm:pt-4"
        }`}
      >
        <motion.nav
          ref={navRef}
          drag
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={constraintsRef}
          dragElastic={reduce ? 0 : DRAG_ELASTIC}
          dragMomentum={!reduce}
          dragTransition={reduce ? dragInertiaReduced : dragInertia}
          style={{ x, y }}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => {
            setDragging(false);
            // Release velocity is handed to dragTransition (momentum + edge
            // rubber-band + settle spring); persist wherever it comes to rest.
            schedulePersist();
          }}
          data-dragging={dragging ? "true" : undefined}
          className={`mx-auto flex items-center justify-between gap-2 rounded-full px-3 py-2 sm:gap-3 sm:px-5 ${
            floating ? "w-fit max-w-[calc(100vw-1.5rem)]" : "max-w-[84rem]"
          } ${
            glass
              ? // backdrop-filter and border-color were outside this list, so the
                // glass and its hairline snapped into place while the shadow eased
                // over half a second. All four now move together, in budget.
                "nav-liquid-glass nav-liquid-glass--solid transition-[padding,background,box-shadow,border-color,backdrop-filter] duration-300 ease-devotional"
              : lightText
                ? "transition-none [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]"
                : "transition-none"
          }`}
        >
          {/* Drag grip — the only surface that starts a drag, so links keep
              clicking. Double-click snaps the bar back to the top. */}
          <button
            type="button"
            onPointerDown={(e) => dragControls.start(e)}
            onDoubleClick={resetPos}
            data-drag-hint={dragHint ? "true" : undefined}
            className={`nav-grip -ml-1 hidden shrink-0 cursor-grab touch-none rounded-full p-1.5 transition-colors duration-300 xl:flex ${
              solid ? "text-maroon/45 hover:text-maroon" : "text-cream/55 hover:text-cream"
            }`}
            aria-label={
              floating
                ? lang === "hi" ? "नेविगेशन खिसकाएँ · डबल-क्लिक: पुनः स्थान" : "Move navigation · double-click to reset"
                : lang === "hi" ? "नेविगेशन खिसकाएँ" : "Move navigation"
            }
            title={lang === "hi" ? "खींचें · डबल-क्लिक: पुनः स्थान" : "Drag · double-click to reset"}
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <circle cx="5" cy="4" r="1.3" />
              <circle cx="11" cy="4" r="1.3" />
              <circle cx="5" cy="8" r="1.3" />
              <circle cx="11" cy="8" r="1.3" />
              <circle cx="5" cy="12" r="1.3" />
              <circle cx="11" cy="12" r="1.3" />
            </svg>
          </button>

          {/* Brand */}
          <button
            onClick={() => handleNav({ target: "#home" })}
            className="group flex shrink-0 items-center gap-2 text-left sm:gap-3"
            aria-label="Back to top"
          >
            {logoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/logo.png"
                alt="Hariboll Mandir logo"
                draggable={false}
                onError={() => setLogoOk(false)}
                className={`h-9 w-auto max-w-[96px] shrink-0 object-contain transition-[transform] duration-[240ms] ease-devotional sm:max-w-[132px] ${
                  scrolled ? "scale-95 sm:h-10" : "scale-100 sm:h-10"
                }`}
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
                className={`font-display whitespace-nowrap text-sm font-semibold leading-normal tracking-wide transition-colors duration-500 sm:text-base ${
                  solid ? "text-maroon" : "text-cream"
                }`}
              >
                {t.nav.brand}
              </span>
              <span
                className={`mt-1 hidden whitespace-nowrap font-body text-[10px] uppercase leading-none tracking-widest2 transition-colors duration-500 min-[380px]:block ${
                  solid ? "text-gold-deeper" : "text-gold-light/90"
                }`}
              >
                {t.nav.location}
              </span>
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden min-w-0 items-center justify-center gap-0.5 lg:flex">
            {LINKS.filter((l) => l.key !== "home").map((link) => {
              const isActive = isLinkActive(link);
              return (
                <button
                  key={link.href ?? link.target}
                  onClick={() => handleNav(link)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group press-nudge relative whitespace-nowrap px-1.5 py-2 font-body text-[12px] font-medium transition-colors duration-200 xl:px-2.5 xl:text-[13px] ${
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
                    className={`absolute inset-x-2 -bottom-0.5 h-px origin-center bg-gold transition-[transform,opacity] duration-200 ease-devotional xl:inset-x-3 ${
                      isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })}

            {/* Language toggle */}
            <LanguageToggle className={`ml-1 xl:ml-2 ${solid ? "text-maroon" : "text-cream"}`} />

            {/* Donation QR — reserved space; drops in /images/donation-qr.webp when ready */}
            <div ref={qrRef} className="relative ml-1 xl:ml-2">
              <button
                type="button"
                onClick={() => setQrOpen((v) => !v)}
                aria-expanded={qrOpen}
                aria-label={t.nav.donate}
                className={`press-nudge flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-2 font-body text-[12px] font-medium transition-colors duration-200 xl:text-sm ${
                  solid
                    ? "border-maroon/25 text-maroon hover:border-maroon/50"
                    : "border-cream/40 text-cream hover:border-cream/70"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3h-3zM20 14v3M17 20h4" strokeLinecap="round" />
                </svg>
              </button>

              <AnimatePresence>
              {qrOpen && (
                <motion.div
                  // Scales from its trigger (top-right), not from its own centre,
                  // so the panel visibly comes FROM the button that opened it.
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: -2 }}
                  transition={reduce ? { duration: 0.15 } : spring.snappy}
                  style={{ transformOrigin: "top right" }}
                  className="absolute right-0 top-full z-50 mt-3 w-max rounded-2xl border border-gold/30 bg-cream-50 p-3 shadow-arch"
                >
                  <div className="h-40 w-40 overflow-hidden rounded-xl border border-gold/25 bg-white">
                    {qrImgOk ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/images/donation.webp"
                        alt={t.nav.donate}
                        onError={() => setQrImgOk(false)}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-maroon/25 text-maroon/55">
                        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <path d="M14 14h3v3h-3zM20 14v3M17 20h4" strokeLinecap="round" />
                        </svg>
                        <span className="font-body text-[10px] uppercase tracking-widest2">{t.nav.donate}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-center font-body text-xs text-ink-soft">{t.nav.donateScan}</p>
                </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* Glass Contact Temple pill flanked by gold ornaments */}
            <div className="ml-1.5 xl:ml-2">
              <button
                onClick={() => handleNav({ target: "#visit" })}
                className={`nav-glass-btn whitespace-nowrap ${solid ? "text-maroon" : "text-cream"}`}
              >
                {t.nav.contact}
              </button>
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
                className={`block h-0.5 w-6 bg-current transition-[transform,opacity] duration-200 ${
                  open ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-current transition-[transform,opacity] duration-200 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-current transition-[transform,opacity] duration-200 ${
                  open ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
            </button>
          </div>
        </motion.nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE_DEVOTIONAL }}
            className="fixed inset-0 z-40 flex flex-col bg-maroon-gradient pattern-floral lg:hidden"
          >
            <div className="pointer-events-none absolute inset-0 bg-maroon-dark/40" />
            {/* Scrollable content — starts below the navbar (~72px) */}
            <div className="relative flex-1 overflow-y-auto px-8 pb-10 pt-24">
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: reduce ? 0 : 0.07,
                    delayChildren: reduce ? 0 : 0.15,
                  },
                },
              }}
              className="relative space-y-1"
            >
              {LINKS.map((link) => {
                const isActive = isLinkActive(link);
                return (
                  <motion.li
                    key={link.href ?? link.target}
                    variants={menuItem}
                    transition={menuItemTransition}
                  >
                    <button
                      onClick={() => handleNav(link)}
                      className={`link-underline font-heading text-3xl font-medium transition-colors duration-300 hover:text-gold-light sm:text-4xl ${
                        isActive ? "is-active text-gold-light" : "text-cream"
                      }`}
                    >
                      {t.nav[link.key]}
                    </button>
                  </motion.li>
                );
              })}
              {/* Sadhana tools — mirrors the bottom-left dock for discoverability */}
              <motion.li
                variants={menuItem}
                transition={menuItemTransition}
                className="pt-6"
              >
                <div className="flex flex-wrap gap-3">
                  {(
                    [
                      { event: "hariboll:open-japa", labelEn: "Japa Mala", labelHi: "जप माला" },
                      { event: "hariboll:open-aarti", labelEn: "Aarti", labelHi: "आरती" },
                    ] as const
                  ).map(({ event, labelEn, labelHi }) => (
                    <button
                      key={event}
                      onClick={() => {
                        setOpen(false);
                        // Wait for the menu-close scroll unlock before the modal opens.
                        setTimeout(() => window.dispatchEvent(new Event(event)), 80);
                      }}
                      className="rounded-full border border-gold-light/40 px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-gold-light transition hover:border-gold-light hover:text-cream"
                    >
                      {lang === "hi" ? labelHi : labelEn}
                    </button>
                  ))}
                </div>
              </motion.li>
              <motion.li
                variants={menuItem}
                transition={menuItemTransition}
                className="pt-6"
              >
                <p className="mb-3 font-body text-xs uppercase tracking-[0.14em] text-gold-light/80">
                  {t.nav.donate}
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-gold-light/30 bg-white">
                    {qrImgOk ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/images/donation.webp"
                        alt={t.nav.donate}
                        onError={() => setQrImgOk(false)}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 border border-dashed border-cream/30 text-cream/60">
                        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <path d="M14 14h3v3h-3zM20 14v3M17 20h4" strokeLinecap="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="font-body text-sm text-cream/80">{t.nav.donateScan}</span>
                </div>
              </motion.li>
              <motion.li
                variants={menuItem}
                transition={menuItemTransition}
                className="pt-4"
              >
                <span className="text-living font-script text-2xl">
                  Haribol!
                </span>
              </motion.li>
            </motion.ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
