"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_DEVOTIONAL } from "@/lib/springs";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { darshanGallery, type Palette } from "@/lib/images";
import { useLang } from "@/lib/i18n";
import { LotusLink } from "@/components/ui/ViewTransitions";

const EASE = EASE_DEVOTIONAL;

/* Dock geometry (desktop). The resting row spans the FULL width of the section:
   bar widths are derived from the measured width so the pills always fill the
   page. Hovering runs a constant-total-width fisheye — the bar under the cursor
   grows while its neighbours give back exactly that much, so the row never
   overflows and the edges stay put. A click blooms one photo open, tall. */
const COLLAPSED_H = 320;
const HOVER_H = 380;
const OPEN_W = 380; // opened photo — width
const OPEN_H = 480; // opened photo — height (grows upward, taller than wide)
const GAP = 12;
const MIN_BASE = 52; // clamp resting bar width on very narrow / very wide docks
const MAX_BASE = 168;
const MIN_OPEN_SIB = 40;
const WIDTH_AMP = 0.95; // hovered-bar width bonus (before width is normalised)
const INFLUENCE_FACTOR = 1.9; // magnify radius, in multiples of the base width
const BLUR = 3; // px blur applied to the resting bars when a photo is open
// Time constant (seconds) for the magnify follow. Frame-rate independent (see
// the exponential step in the rAF loop) so it feels identical at 60/120Hz.
const SMOOTH_TAU = 0.08;

const PALETTE_GLOW: Record<Palette, string> = {
  maroon: "rgba(110,30,42,0.34)",
  gold: "rgba(201,162,75,0.40)",
  forest: "rgba(35,68,55,0.32)",
  sky: "rgba(110,151,172,0.36)",
  cream: "rgba(201,162,75,0.28)",
};

// smoothstep — soft easing on the proximity factor so the peak tracks the
// cursor without a hard edge at the influence radius.
const smoothstep = (f: number) => f * f * (3 - 2 * f);

// Resting bar width + centred start offset for a dock of the measured width.
function metrics(width: number, n: number) {
  const gaps = (n - 1) * GAP;
  const baseW = Math.max(MIN_BASE, Math.min(MAX_BASE, (width - gaps) / n));
  const rowW = n * baseW + gaps;
  const startX = Math.max(0, (width - rowW) / 2);
  return { baseW, rowW, startX };
}

const heightFor = (f: number) => COLLAPSED_H + (HOVER_H - COLLAPSED_H) * f;

export default function MagneticGallery() {
  const reduce = useReducedMotion();
  const { lang, t } = useLang();

  const items = useMemo(
    () =>
      darshanGallery.map((g, i) => ({
        ...g,
        title: t.gallery.items[i]?.title ?? g.title,
        caption: t.gallery.items[i]?.caption ?? g.caption,
      })),
    [t.gallery.items],
  );
  const count = items.length;

  const [open, setOpen] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);
  // Measured dock width — drives the full-bleed bar sizing. Seeded with a sane
  // desktop default so SSR/first paint already looks full (no hydration jump).
  const [dockW, setDockW] = useState(1200);

  const dockRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // The hover magnify runs entirely off React: `cur` eases toward `target`
  // each frame and is written straight to the DOM, so no state update (and no
  // re-render of 13 bars) happens while the cursor moves.
  const curRef = useRef<number[]>(items.map(() => 0));
  const targetRef = useRef<number[]>(items.map(() => 0));
  const pointerXRef = useRef(0);
  const hoveringRef = useRef(false);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Cached dock geometry so the rAF loop never forces a synchronous layout.
  const rectRef = useRef({ left: 0, width: 1200 });

  // Mirror open/closing into refs so the rAF loop always reads fresh values.
  const openRef = useRef(open);
  openRef.current = open;
  const closingRef = useRef(closing);
  closingRef.current = closing;

  const dur = reduce ? 0.001 : 0.46;

  useEffect(() => {
    curRef.current = items.map(() => 0);
    targetRef.current = items.map(() => 0);
    barRefs.current.length = count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  // Keep the dock's full-bleed width — and the cached rect the magnify loop
  // reads — in sync with the viewport. Measuring happens here on resize and scroll.
  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      rectRef.current = { left: rect.left, width: rect.width || 1200 };
      setDockW(rect.width || 1200);
    };
    measure();

    let scrollRaf = 0;
    const onScroll = () => {
      if (!scrollRaf) {
        scrollRaf = requestAnimationFrame(() => {
          scrollRaf = 0;
          if (el) {
            const rect = el.getBoundingClientRect();
            rectRef.current = { left: rect.left, width: rect.width || 1200 };
          }
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      window.addEventListener("resize", measure);
    }

    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(closeTimer.current);
    },
    [],
  );

  // Push the current factors straight to the DOM — the resting row always sums
  // to the full width (normalised fisheye), so nothing ever overflows.
  const applyStyles = (baseW: number) => {
    const cur = curRef.current;
    const n = cur.length;
    let rawSum = 0;
    const raw = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      raw[i] = baseW * (1 + WIDTH_AMP * cur[i]);
      rawSum += raw[i];
    }
    const scale = rawSum > 0 ? (baseW * n) / rawSum : 1;
    for (let i = 0; i < n; i++) {
      const el = barRefs.current[i];
      if (!el) continue;
      el.style.width = `${raw[i] * scale}px`;
      el.style.height = `${heightFor(cur[i])}px`;
    }
  };

  const tick = (ts: number) => {
    // While a photo is open (or closing) the sizes are React + CSS owned; the
    // magnify loop stands down so the two never fight.
    if (openRef.current !== null || closingRef.current) {
      rafRef.current = 0;
      lastTsRef.current = 0;
      return;
    }

    let dt = lastTsRef.current ? (ts - lastTsRef.current) / 1000 : 1 / 60;
    lastTsRef.current = ts;
    if (dt > 0.05) dt = 0.05; // clamp after a tab-switch / long frame

    const cur = curRef.current;
    const tgt = targetRef.current;
    const dock = dockRef.current;
    if (!dock) {
      rafRef.current = 0;
      return;
    }

    /*
      The dock geometry is read from a cached rect rather than measured here.

      This loop writes width/height to thirteen bars and then, on the NEXT
      frame, called getBoundingClientRect() on their parent — which forces the
      browser to flush the layout those writes had just invalidated, every
      single frame, synchronously, for as long as the cursor moved. The rect
      only changes on resize and scroll, both of which now refresh the cache.
    */
    const rect = rectRef.current;
    const { baseW, startX } = metrics(rect.width, cur.length);

    if (hoveringRef.current) {
      const cx = pointerXRef.current - rect.left;
      const influence = baseW * INFLUENCE_FACTOR;
      for (let i = 0; i < cur.length; i++) {
        const center = startX + i * (baseW + GAP) + baseW / 2;
        const dist = Math.abs(cx - center);
        tgt[i] = smoothstep(Math.max(0, 1 - dist / influence));
      }
    } else {
      for (let i = 0; i < tgt.length; i++) tgt[i] = 0;
    }

    // Frame-rate-independent exponential approach toward the target.
    const k = 1 - Math.exp(-dt / SMOOTH_TAU);
    let moving = false;
    for (let i = 0; i < cur.length; i++) {
      const d = tgt[i] - cur[i];
      if (Math.abs(d) > 0.0004) {
        cur[i] += d * k;
        moving = true;
      } else {
        cur[i] = tgt[i];
      }
    }

    applyStyles(baseW);

    if (moving || hoveringRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = 0;
      lastTsRef.current = 0;
    }
  };

  const startLoop = () => {
    if (rafRef.current || reduce) return;
    lastTsRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  };

  const onMove = (e: React.MouseEvent) => {
    if (reduce || open !== null || closing) return;
    pointerXRef.current = e.clientX;
    hoveringRef.current = true;
    startLoop();
  };

  const onLeave = () => {
    if (open !== null || closing) return;
    hoveringRef.current = false;
    startLoop(); // eases every bar back to rest, then stops itself
  };

  const openAt = (i: number) => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    hoveringRef.current = false;
    setOpen(i);
  };

  const close = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    hoveringRef.current = false;
    curRef.current = curRef.current.map(() => 0);
    targetRef.current = targetRef.current.map(() => 0);
    setClosing(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setClosing(false), dur * 1000 + 40);
    setOpen(null);
  };

  // Sizes for a React render. Open/closing states are React-owned (and CSS
  // transitioned) and also fill the full width; the resting state reads the
  // live factor so an incidental re-render still paints the correct size.
  const { baseW, rowW } = metrics(dockW, count);
  const openSiblingW = Math.max(
    MIN_OPEN_SIB,
    (rowW - OPEN_W - (count - 1) * GAP) / (count - 1),
  );
  const restingScale = (() => {
    let sum = 0;
    for (let i = 0; i < count; i++) sum += baseW * (1 + WIDTH_AMP * (curRef.current[i] ?? 0));
    return sum > 0 ? (baseW * count) / sum : 1;
  })();

  const sizeFor = (i: number) => {
    if (open !== null) {
      return i === open
        ? { width: OPEN_W, height: OPEN_H }
        : { width: openSiblingW, height: COLLAPSED_H };
    }
    const f = curRef.current[i] ?? 0;
    return {
      width: baseW * (1 + WIDTH_AMP * f) * restingScale,
      height: heightFor(f),
    };
  };

  // Open/close eases via CSS (also animates blur + opacity); hover has NO CSS
  // transition — the rAF loop drives width/height frame by frame instead.
  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";
  const openEase = `width ${dur}s ${ease}, height ${dur}s ${ease}, filter ${dur}s ${ease}, opacity ${dur}s ${ease}`;
  const barTransition = open !== null || closing ? openEase : "none";

  const activePalette: Palette = open !== null ? items[open].palette : "gold";
  const featured = items[open ?? 0];

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-[#071d26] py-20 sm:py-28"
    >
      {/* Shared dark backdrop so the section reads as one cohesive room. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <picture className="block h-full w-full">
          <source media="(max-width: 639px)" srcSet="/images/gallery-bg-mobile.webp" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/gallery-bg.webp"
            alt=""
            loading="lazy"
            className="h-full w-full scale-[1.03] object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-[#061d25]/45" />
      </div>
      <div
        aria-hidden="true"
        className="pattern-peacock pointer-events-none absolute inset-0 opacity-10"
      />

      <div className="container-temple relative z-10">
        <Reveal>
          <SectionHeading
            eyebrow={t.gallery.eyebrow}
            title={t.gallery.title}
            subtitle={t.gallery.subtitle}
            light
          />
        </Reveal>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Desktop — the full-width magnetic dock.                            */}
      {/* ------------------------------------------------------------------ */}
      <Reveal delay={0.1} className="relative z-10 mt-14 hidden lg:block lg:mt-20">
        <div className="relative px-8 xl:px-12">
          {/* Reactive glow behind the dock, tinted to the open darshan. */}
          <AnimatePresence>
            <motion.div
              key={activePalette}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.8, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-x-0 -inset-y-16"
              style={{
                background: `radial-gradient(50% 60% at 50% 50%, ${PALETTE_GLOW[activePalette]}, transparent 72%)`,
              }}
            />
          </AnimatePresence>

          <div
            ref={dockRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="relative flex w-full items-center justify-center"
            style={{ gap: GAP, minHeight: OPEN_H }}
          >
            {/* Transparent backdrop — click outside an open darshan to close. */}
            <div
              className="absolute inset-0 z-[1]"
              style={{ pointerEvents: open !== null ? "auto" : "none" }}
              onClick={close}
              aria-hidden="true"
            />

            {items.map((item, i) => {
              const { width, height } = sizeFor(i);
              const blurred = open !== null && i !== open;
              const isOpen = open === i;
              return (
                <button
                  key={i}
                  ref={(el) => {
                    barRefs.current[i] = el;
                  }}
                  type="button"
                  aria-label={item.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (open === i) close();
                    else openAt(i);
                  }}
                  className={`group relative flex-none overflow-hidden rounded-2xl shadow-card ring-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#071d26] ${
                    isOpen ? "ring-gold/50" : "ring-gold/25"
                  }`}
                  style={{
                    width,
                    height,
                    transition: barTransition,
                    // `will-change: width, height` promised the compositor
                    // something it cannot help with — neither property can be
                    // composited, so the hint bought nothing and kept a layer
                    // alive for all thirteen bars. Only the open/close blur and
                    // opacity are worth promoting, and only while one is open.
                    willChange: open !== null || closing ? "filter, opacity" : "auto",
                    zIndex: isOpen ? 3 : 2,
                    filter: blurred ? `blur(${BLUR}px)` : "none",
                    opacity: blurred ? 0.55 : 1,
                  }}
                >
                  <FallbackImage
                    src={item.src}
                    alt={item.title}
                    label={item.title}
                    palette={item.palette}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover object-top"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"
                  />

                  {/* Title + caption bloom in only on the opened darshan. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/80 via-black/25 to-transparent px-5 pb-6 pt-16 text-center"
                    style={{
                      opacity: isOpen ? 1 : 0,
                      transition: `opacity ${dur}s ${ease}`,
                    }}
                  >
                    <span className="font-heading text-2xl text-cream [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">
                      {item.title}
                    </span>
                    <span className="mt-2 max-w-xs font-body text-sm leading-relaxed text-cream/75">
                      {item.caption}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-10 text-center font-body text-[10px] uppercase tracking-widest2 text-gold-light/65">
          {open !== null
            ? "Click away to return to the darshan row"
            : "Draw near a darshan to magnify · click to behold"}
        </p>

        <div className="mt-8 hidden lg:flex justify-center">
          <LotusLink
            href="/gallery"
            className="btn-gold group inline-flex items-center gap-2.5 px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] font-heading shadow-[0_10px_35px_rgba(201,162,75,0.3)] hover:scale-105 transition-all duration-300"
          >
            <span>{lang === "hi" ? "संपूर्ण चित्रदीर्घा देखें ➔" : "View Full Temple Gallery ➔"}</span>
          </LotusLink>
        </div>
      </Reveal>

      {/* ------------------------------------------------------------------ */}
      {/*  Mobile / touch — featured darshan + a tap-to-switch strip.         */}
      {/* ------------------------------------------------------------------ */}
      <div className="container-temple relative z-10">
        <Reveal delay={0.1} className="mt-12 lg:hidden">
          {/* `mode="wait"` serialised a 450ms exit and a 450ms entrance, so
              every thumbnail tap cost ~900ms of empty frame before the new
              darshan appeared. The two now overlap inside a fixed-size stage
              (so nothing reflows), at 280ms, with a 2px blur masking the moment
              both images are briefly visible. */}
          <div className="relative mx-auto grid max-w-sm [&>*]:col-start-1 [&>*]:row-start-1">
            <AnimatePresence initial={false}>
              <motion.div
                key={open ?? 0}
                initial={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(2px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(2px)" }}
                transition={{ duration: reduce ? 0.15 : 0.28, ease: EASE }}
                className="relative overflow-hidden rounded-3xl shadow-arch ring-1 ring-gold/30"
              >
                <div className="aspect-[4/5] w-full">
                  <FallbackImage
                    src={featured.src}
                    alt={featured.title}
                    label={featured.title}
                    palette={featured.palette}
                    loading="eager"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-1/2 flex-col items-center justify-end bg-gradient-to-t from-black/75 to-transparent px-5 pb-6 text-center">
                  <h3 className="font-heading text-2xl text-cream [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]">
                    {featured.title}
                  </h3>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mx-auto mt-6 max-w-lg text-center">
            <span className="font-display text-xs uppercase tracking-widest2 text-gold-light">
              {String((open ?? 0) + 1).padStart(2, "0")}
              <span className="text-gold-light/50">
                {" "}
                / {String(count).padStart(2, "0")}
              </span>
            </span>
            <div className="divider-lotus mt-5" />
            <p className="mt-5 font-body text-base leading-relaxed text-cream/75">
              {featured.caption}
            </p>
          </div>

          <div className="relative mt-6">
            <div
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Darshan thumbnails"
            >
              {items.map((item, i) => {
                const isActive = (open ?? 0) === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-label={item.title}
                    className={`press-nudge relative h-24 w-20 shrink-0 snap-start overflow-hidden rounded-xl transition-[opacity,box-shadow] duration-200 ease-devotional focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#071d26] ${
                      isActive
                        ? "ring-2 ring-gold"
                        : "opacity-80 ring-1 ring-gold/20"
                    }`}
                  >
                    <FallbackImage
                      src={item.src}
                      alt={item.title}
                      label={item.title}
                      palette={item.palette}
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <LotusLink
                href="/gallery"
                className="btn-gold group inline-flex items-center gap-2.5 px-6 py-3 text-xs uppercase tracking-[0.18em] font-heading shadow-[0_8px_30px_rgba(201,162,75,0.25)] hover:scale-105 transition-all duration-300"
              >
                <span>{lang === "hi" ? "संपूर्ण चित्रदीर्घा देखें ➔" : "View Full Temple Gallery ➔"}</span>
              </LotusLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
