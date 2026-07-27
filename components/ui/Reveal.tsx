"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { EASE_DEVOTIONAL } from "@/lib/springs";

/**
 * The site's signature curve. Re-exported from lib/springs.ts rather than
 * re-declared: this constant, `EASE_DEVOTIONAL`, the Tailwind `ease-devotional`
 * token and the CSS `--ease-devotional` custom property are now all the same
 * four numbers stated once each per language, instead of the twenty-odd
 * hand-typed copies that were scattered across the components.
 */
export const LOTUS_BREATH_EASE = EASE_DEVOTIONAL;

export const LOTUS_BREATH_TOKENS = Object.freeze({
  desktop: Object.freeze({
    travel: 18,
    blur: 4,
    duration: 0.82,
    minDuration: 0.72,
    maxDuration: 0.92,
  }),
  mobile: Object.freeze({
    travel: 10,
    blur: 0,
    duration: 0.56,
    maxDuration: 0.6,
  }),
  stagger: 0.07,
});

interface LotusBreathProfile {
  reducedMotion: boolean;
  mobile: boolean;
  ready: boolean;
  travel: number;
  blur: number;
  duration: number;
}

interface ViewportRevealState {
  ref: (element: HTMLElement | null) => void;
  state: "hidden" | "show";
}

function subscribeToMediaQuery(
  query: MediaQueryList,
  listener: () => void,
): () => void {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }

  query.addListener(listener);
  return () => query.removeListener(listener);
}

/**
 * Resolves the same compact reveal policy used by the scroll runtime: narrow
 * viewports and coarse pointers receive the mobile Lotus Breath profile.
 */
export function useLotusBreathProfile(): LotusBreathProfile {
  const reducedMotion = useReducedMotion() === true;
  const [capabilities, setCapabilities] = useState({
    mobile: true,
    ready: false,
  });

  useEffect(() => {
    let narrowViewport: MediaQueryList;
    let coarsePointer: MediaQueryList;

    try {
      narrowViewport = window.matchMedia("(max-width: 767px)");
      coarsePointer = window.matchMedia("(pointer: coarse)");
    } catch {
      setCapabilities({ mobile: true, ready: true });
      return;
    }

    const update = () => {
      const mobile = narrowViewport.matches || coarsePointer.matches;
      setCapabilities((current) =>
        current.ready && current.mobile === mobile
          ? current
          : { mobile, ready: true },
      );
    };

    update();
    const unsubscribeViewport = subscribeToMediaQuery(narrowViewport, update);
    const unsubscribePointer = subscribeToMediaQuery(coarsePointer, update);

    return () => {
      unsubscribeViewport();
      unsubscribePointer();
    };
  }, []);

  const tokens = capabilities.mobile
    ? LOTUS_BREATH_TOKENS.mobile
    : LOTUS_BREATH_TOKENS.desktop;

  return {
    reducedMotion,
    mobile: capabilities.mobile,
    ready: capabilities.ready,
    travel: reducedMotion ? 0 : tokens.travel,
    blur: reducedMotion ? 0 : tokens.blur,
    duration: reducedMotion ? 0 : tokens.duration,
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function finiteOr(value: number | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function resolveTravel(
  requested: number | undefined,
  profile: LotusBreathProfile,
): number {
  if (profile.reducedMotion) return 0;

  const value = finiteOr(requested, profile.travel);
  return Math.sign(value) * Math.min(Math.abs(value), profile.travel);
}

function resolveDuration(
  requested: number | undefined,
  profile: LotusBreathProfile,
): number {
  if (profile.reducedMotion) return 0;

  const value = finiteOr(requested, profile.duration);
  if (profile.mobile) {
    return clamp(value, 0, LOTUS_BREATH_TOKENS.mobile.maxDuration);
  }

  return clamp(
    value,
    LOTUS_BREATH_TOKENS.desktop.minDuration,
    LOTUS_BREATH_TOKENS.desktop.maxDuration,
  );
}

function resolveScale(requested: number, profile: LotusBreathProfile): number {
  if (profile.reducedMotion || profile.mobile || !Number.isFinite(requested)) {
    return 1;
  }

  return clamp(requested, 0.98, 1.02);
}

function resolveDelay(requested: number): number {
  return Number.isFinite(requested) ? Math.max(0, requested) : 0;
}

function useViewportReveal(
  profile: LotusBreathProfile,
  once: boolean,
): ViewportRevealState {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [state, setState] = useState<"hidden" | "show">("show");
  const completed = useRef(false);

  const ref = useCallback((nextElement: HTMLElement | null) => {
    setElement((current) =>
      current === nextElement ? current : nextElement,
    );
  }, []);

  useEffect(() => {
    if (profile.reducedMotion) {
      completed.current = true;
      setState("show");
      return;
    }

    if (!profile.ready || !element || (once && completed.current)) {
      setState("show");
      return;
    }

    if (typeof window.IntersectionObserver !== "function") {
      completed.current = true;
      setState("show");
      return;
    }

    let observer: IntersectionObserver | null = null;

    try {
      observer = new window.IntersectionObserver(
        ([entry]) => {
          if (!entry) return;

          // Treat restored-scroll content above the viewport as already read.
          const hasPassedViewport = entry.boundingClientRect.bottom <= 48;
          if (entry.isIntersecting || (once && hasPassedViewport)) {
            completed.current = once;
            setState("show");
            if (once) observer?.disconnect();
            return;
          }

          if (!completed.current || !once) setState("hidden");
        },
        { rootMargin: "-48px 0px -48px 0px" },
      );
      observer.observe(element);
    } catch {
      completed.current = true;
      setState("show");
    }

    return () => observer?.disconnect();
  }, [element, once, profile.ready, profile.reducedMotion]);

  return { ref, state };
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  blur?: boolean;
  once?: boolean;
  as?: "div" | "section" | "span" | "li" | "figure";
}

/** Restrained, once-only opacity + slide-up reveal. */
export function Reveal({
  children,
  className,
  delay = 0,
  y,
  duration,
  blur = false,
  once = true,
  as = "div",
}: RevealProps) {
  const profile = useLotusBreathProfile();
  const viewportReveal = useViewportReveal(profile, once);
  const MotionTag = motion[as];
  const travel = resolveTravel(y, profile);
  const revealDuration = resolveDuration(duration, profile);
  const revealBlur = blur ? profile.blur : 0;

  const variants: Variants = {
    hidden: profile.reducedMotion
      ? { opacity: 1, y: 0, filter: "blur(0px)" }
      : {
          opacity: 0,
          y: travel,
          filter: `blur(${revealBlur}px)`,
          transition: { duration: 0 },
        },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: revealDuration,
        delay: profile.reducedMotion ? 0 : resolveDelay(delay),
        ease: LOTUS_BREATH_EASE,
      },
    },
  };

  return (
    <MotionTag
      ref={viewportReveal.ref}
      className={className}
      variants={variants}
      initial={false}
      animate={profile.reducedMotion ? "show" : viewportReveal.state}
    >
      {children}
    </MotionTag>
  );
}

/** Container that staggers its <StaggerItem> children in DOM order. */
export function Stagger({
  children,
  className,
  delayChildren = 0.1,
  staggerChildren = LOTUS_BREATH_TOKENS.stagger,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
  once?: boolean;
}) {
  const profile = useLotusBreathProfile();
  const viewportReveal = useViewportReveal(profile, once);
  const stagger = clamp(
    resolveDelay(staggerChildren),
    0,
    LOTUS_BREATH_TOKENS.stagger,
  );

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        delayChildren: profile.reducedMotion
          ? 0
          : resolveDelay(delayChildren),
        staggerChildren: profile.reducedMotion ? 0 : stagger,
      },
    },
  };

  return (
    <motion.div
      ref={viewportReveal.ref}
      className={className}
      variants={container}
      initial={false}
      animate={profile.reducedMotion ? "show" : viewportReveal.state}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y,
  x = 0,
  scale = 1,
  duration,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  x?: number;
  scale?: number;
  duration?: number;
  /** Preserve semantics (e.g. a <nav> landmark) while still staggering. */
  as?: "div" | "li" | "nav" | "section" | "article" | "figure";
}) {
  const profile = useLotusBreathProfile();
  const MotionTag = motion[as];
  const travel = resolveTravel(y, profile);
  const horizontalTravel = resolveTravel(x, profile);
  const initialScale = resolveScale(scale, profile);
  const revealDuration = resolveDuration(duration, profile);

  const item: Variants = {
    hidden: profile.reducedMotion
      ? { opacity: 1, y: 0, x: 0, scale: 1 }
      : {
          opacity: 0,
          y: travel,
          x: horizontalTravel,
          scale: initialScale,
          transition: { duration: 0 },
        },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: revealDuration,
        ease: LOTUS_BREATH_EASE,
      },
    },
  };

  return (
    <MotionTag className={className} variants={item}>
      {children}
    </MotionTag>
  );
}
