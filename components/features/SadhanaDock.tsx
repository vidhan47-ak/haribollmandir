"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "framer-motion";
import JapaMala from "@/components/features/JapaMala";
import AartiMode from "@/components/features/AartiMode";
import MahamantraToggle from "@/components/features/MahamantraToggle";
import TempleBell from "@/components/features/TempleBell";
import KirtanaPlayer from "@/components/features/KirtanaPlayer";
import { SACRED_EVENTS } from "@/lib/sacred-calendar";
import { clampToViewport } from "@/lib/clamp-drag";
import {
  DRAG_ELASTIC,
  dragInertia,
  dragInertiaReduced,
  spring,
} from "@/lib/springs";
import { useLang } from "@/lib/i18n";
import { LotusLink } from "@/components/ui/ViewTransitions";

/**
 * Bottom-left cluster of sadhana tools: Mahamantra, Aarti and Japa launchers.
 * Collapsible so it never has to own permanent screen space, with a one-time
 * first-visit hint and a compact "next sacred day" chip. The whole dock can be
 * dragged anywhere by its grip and remembers where it was left.
 */

const COLLAPSED_KEY = "hariboll-dock-collapsed";
const HINT_KEY = "hariboll-dock-hint-seen";
const POS_KEY = "hariboll-dock-pos";
// Shared with the navbar grip: the drag affordance is nudged once, ever.
const DRAG_HINT_KEY = "hariboll-drag-hint-seen";

type Pos = { x: number; y: number };

function useNextSacredEvent() {
  // Resolved on the client only, so SSR output stays date-independent.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  return useMemo(() => {
    if (now === null) return null;
    const next = SACRED_EVENTS.find((e) => new Date(e.date).getTime() >= now);
    if (!next) return null;
    const days = Math.max(
      0,
      Math.ceil((new Date(next.date).getTime() - now) / 86_400_000),
    );
    return { ...next, days };
  }, [now]);
}

function useScrollDirection() {
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const updateScrollDir = () => {
      const currentY = window.scrollY;
      if (Math.abs(currentY - lastY) > 8) {
        setScrollDir(currentY > lastY && currentY > 60 ? "down" : "up");
        lastY = currentY > 0 ? currentY : 0;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrollDir;
}

export default function SadhanaDock() {
  const reduce = useReducedMotion();
  const { lang } = useLang();
  const [collapsed, setCollapsed] = useState(true);
  const [ready, setReady] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollDir = useScrollDirection();
  // Live drag offset as Framer motion values so a released flick can coast on
  // its own momentum and rubber-band at the viewport edge (Apple fluid drag).
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const [dragHint, setDragHint] = useState(false);
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const persistTimer = useRef<number | null>(null);
  const nextEvent = useNextSacredEvent();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const hideOnScroll = isMobile && scrollDir === "down";

  useEffect(() => {
    let storedCollapsed = false;
    let hintSeen = true;
    try {
      storedCollapsed = window.localStorage.getItem(COLLAPSED_KEY) === "1";
      hintSeen = window.localStorage.getItem(HINT_KEY) === "1";
      const rawPos = window.localStorage.getItem(POS_KEY);
      if (rawPos) {
        const parsed = JSON.parse(rawPos) as Partial<Pos>;
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          x.set(parsed.x);
          y.set(parsed.y);
        }
      }
    } catch {
      // Defaults keep the dock usable without storage.
    }
    setCollapsed(storedCollapsed);
    setReady(true);

    if (!hintSeen && !storedCollapsed) {
      const show = window.setTimeout(() => setShowHint(true), 2200);
      const hide = window.setTimeout(() => dismissHint(), 10200);
      return () => {
        window.clearTimeout(show);
        window.clearTimeout(hide);
      };
    }
  }, []);

  // Pulse both grips once, ever, so the drag affordance is discoverable.
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

  const dismissHint = () => {
    setShowHint(false);
    try {
      window.localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // Keep the restored/parked dock inside the frame across resizes/rotations —
  // easing it home with a critically-damped spring rather than snapping.
  useEffect(() => {
    if (!ready) return;
    const reclamp = () => {
      const cx = x.get();
      const cy = y.get();
      const next = clampToViewport(dockRef.current, cx, cy, cx, cy);
      if (next.x === cx && next.y === cy) return;
      animate(x, next.x, spring.default);
      animate(y, next.y, spring.default);
      persistPos(next);
    };
    reclamp();
    window.addEventListener("resize", reclamp);
    return () => window.removeEventListener("resize", reclamp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Auto-collapse dock on scroll on mobile screens so floating controls never block content
  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth < 768 && !collapsed) {
        setCollapsed(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [collapsed]);

  // Click outside to collapse dock
  useEffect(() => {
    if (collapsed) return;
    const onClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setCollapsed(true);
      }
    };
    document.addEventListener("pointerdown", onClickOutside);
    return () => document.removeEventListener("pointerdown", onClickOutside);
  }, [collapsed]);

  const persistPos = (next: Pos) => {
    try {
      window.localStorage.setItem(POS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // A flick keeps travelling after release (momentum), so persist the dock's
  // final resting place a short beat after its position stops changing.
  const schedulePersist = useCallback(() => {
    if (persistTimer.current) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      persistPos({ x: Math.round(x.get()), y: Math.round(y.get()) });
    }, 220);
  // x and y are stable MotionValues — no re-subscription on re-render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useMotionValueEvent(x, "change", schedulePersist);
  useMotionValueEvent(y, "change", schedulePersist);

  const resetPos = () => {
    animate(x, 0, spring.default);
    animate(y, 0, spring.default);
    persistPos({ x: 0, y: 0 });
  };

  const toggleCollapsed = () => {
    dismissHint();
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (!ready) return null;

  return (
    <>
      {/* Constraint layer (inset ~8px) keeps the dock a hair off the edge and
          gives Framer the boundary its rubber-band + settle spring recoil to. */}
      <div ref={constraintsRef} className="pointer-events-none fixed inset-2 z-[74]" aria-hidden="true" />

      <motion.div
        ref={dockRef}
        className="sadhana-dock"
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
          // The release velocity is handed to dragTransition, which projects
          // the throw, rubber-bands at the edge and settles with a spring; the
          // motion-value listener persists wherever it comes to rest.
          schedulePersist();
        }}
        initial={reduce ? false : { opacity: 0, y: 0 }}
        animate={{
          opacity: hideOnScroll ? 0 : 1,
          y: hideOnScroll ? 100 : 0,
        }}
        transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onPointerDownCapture={dismissHint}
        data-dragging={dragging ? "true" : undefined}
      >
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.5 }}
              className="sadhana-hint"
              role="status"
            >
              {lang === "hi"
                ? "महामंत्र, जप माला और आरती — यहाँ से आरंभ करें"
                : "Mahamantra, japa & aarti — start here"}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {!collapsed && nextEvent && (
            <motion.div
              initial={
                reduce
                  ? false
                  : { opacity: 0, transform: "translateY(10px) scale(0.96)" }
              }
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, transform: "translateY(10px) scale(0.96)" }
              }
              transition={reduce ? { duration: 0 } : spring.default}
            >
              <LotusLink href="/#festivals" className="sadhana-event-chip max-w-[200px] xs:max-w-[240px] sm:max-w-none" onClick={dismissHint}>
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M5 1v3M11 1v3M2 7h12"/></svg>
                <span className="truncate">
                  {lang === "hi" ? nextEvent.nameHi : nextEvent.name}
                  {" · "}
                  {nextEvent.days === 0
                    ? lang === "hi" ? "आज" : "today"
                    : lang === "hi"
                      ? `${nextEvent.days} दिन`
                      : `in ${nextEvent.days}d`}
                </span>
              </LotusLink>
            </motion.div>
          )}
        </AnimatePresence>

        {/* KirtanaPlayer stays persistently mounted so audio never stops when dock collapses */}
        <KirtanaPlayer hideDockButton={collapsed} />

        {/* Persistent chrome */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={
                reduce
                  ? false
                  : { opacity: 0, transform: "translateY(10px) scale(0.96)" }
              }
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              exit={
                reduce
                  ? undefined
                  : { opacity: 0, transform: "translateY(10px) scale(0.96)" }
              }
              transition={reduce ? { duration: 0 } : spring.default}
              className="flex flex-col items-start gap-2.5"
            >
              <TempleBell />
              <MahamantraToggle />
              <AartiMode />
              <JapaMala />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5">
          {/* Drag grip — the only surface that starts a drag, so the tool
              buttons keep clicking normally. Double-click snaps home. */}
          <button
            type="button"
            className="sadhana-dock-grip"
            data-drag-hint={dragHint ? "true" : undefined}
            aria-label={lang === "hi" ? "साधना डॉक खिसकाएँ" : "Move sadhana dock"}
            title={lang === "hi" ? "खींचें · डबल-क्लिक: पुनः स्थान" : "Drag · double-click to reset"}
            onPointerDown={(e) => dragControls.start(e)}
            onDoubleClick={resetPos}
            style={{ touchAction: "none" }}
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

          <motion.button
            type="button"
            onClick={toggleCollapsed}
            className="sadhana-dock-btn sadhana-dock-toggle"
            aria-expanded={!collapsed}
            aria-label={
              collapsed
                ? lang === "hi" ? "साधना साधन खोलें" : "Open sadhana tools"
                : lang === "hi" ? "साधना साधन समेटें" : "Collapse sadhana tools"
            }
            title={lang === "hi" ? "साधना" : "Sadhana"}
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            {collapsed ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#f3d78e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 4c1.6 2.5 1.6 6 0 9-1.6-3-1.6-6.5 0-9Z" />
                <path d="M12 13c-1.5-2.2-4-3.2-6.5-3 .5 2.5 2.5 4.5 5.2 5.2" />
                <path d="M12 13c1.5-2.2 4-3.2 6.5-3-.5 2.5-2.5 4.5-5.2 5.2" />
                <path d="M5 18c2 1.2 4.5 1.8 7 1.8S17 19.2 19 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#f3d78e" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="m6 14 6-6 6 6" transform="rotate(180 12 11)" />
              </svg>
            )}
            {collapsed && (
              <span className="hidden whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.15em] sm:block">
                {lang === "hi" ? "साधना" : "Sadhana"}
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
