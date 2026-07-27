"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
} from "framer-motion";

export const PARALLAX_SECTION_MAX_PX = 36;
export const PARALLAX_HERO_MAX_PX = 42;

interface ParallaxSceneProps {
  children: ReactNode;
  amount?: number;
  /**
   * Retained for source compatibility. Mobile/coarse-pointer parallax is
   * policy-disabled, so this value intentionally cannot enable mobile travel.
   */
  mobileAmount?: number;
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
 * Starts conservatively disabled for SSR/initialization failure, then enables
 * only on desktop sessions whose primary pointer is not coarse.
 */
function useParallaxCapability(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let desktopViewport: MediaQueryList;
    let coarsePointer: MediaQueryList;

    try {
      desktopViewport = window.matchMedia("(min-width: 768px)");
      coarsePointer = window.matchMedia("(pointer: coarse)");
    } catch {
      setEnabled(false);
      return;
    }

    const update = () => {
      const nextEnabled =
        desktopViewport.matches && !coarsePointer.matches;
      setEnabled((current) =>
        current === nextEnabled ? current : nextEnabled,
      );
    };

    update();
    const unsubscribeViewport = subscribeToMediaQuery(
      desktopViewport,
      update,
    );
    const unsubscribePointer = subscribeToMediaQuery(
      coarsePointer,
      update,
    );

    return () => {
      unsubscribeViewport();
      unsubscribePointer();
    };
  }, []);

  return enabled;
}

function resolveRequestedAmplitude(amount: number | undefined): number {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return PARALLAX_SECTION_MAX_PX;
  }

  return Math.abs(amount);
}

export default function ParallaxScene({
  children,
  amount = PARALLAX_SECTION_MAX_PX,
}: ParallaxSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() === true;
  const capable = useParallaxCapability();
  const enabled = capable && !reducedMotion;
  const requestedAmplitude = resolveRequestedAmplitude(amount);
  const sectionAmplitude = Math.min(
    requestedAmplitude,
    PARALLAX_SECTION_MAX_PX,
  );
  const heroAmplitude = Math.min(
    requestedAmplitude,
    PARALLAX_HERO_MAX_PX,
  );
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const sectionOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [-sectionAmplitude, sectionAmplitude],
  );
  const heroOffset = useTransform(
    scrollYProgress,
    [0, 1],
    [-heroAmplitude, heroAmplitude],
  );

  /**
   * Framer Motion writes CSS custom properties RAW — it skips the unit
   * conversion it applies to ordinary style keys (see its `buildHTMLStyles`:
   * `isCSSVariableName(key)` short-circuits before `getValueAsType`). A numeric
   * MotionValue therefore landed as `--parallax-y: -36`, making the consuming
   * `translate3d(0, var(--parallax-y), 0)` invalid at computed-value time. The
   * whole `transform` declaration was dropped — taking the static
   * `scale(--parallax-static-scale)` photography crop with it — so the parallax
   * never ran AND the crop popped. Emitting an explicit `px` string fixes both.
   */
  const sectionY = useMotionTemplate`${sectionOffset}px`;
  const heroY = useMotionTemplate`${heroOffset}px`;

  return (
    <motion.div
      ref={ref}
      className="parallax-main-scene"
      data-parallax-enabled={enabled ? "true" : "false"}
      style={
        {
          "--parallax-y": enabled ? sectionY : "0px",
          "--parallax-hero-y": enabled ? heroY : "0px",
        } as MotionStyle
      }
    >
      {children}
    </motion.div>
  );
}
