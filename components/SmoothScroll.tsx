"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { decodeLocalHashToId } from "@/components/scroll";
import { createScrollController } from "@/components/scroll/controller";
import {
  createScrollMotionValues,
  ScrollMotionBridge,
  type ScrollMotionValues,
} from "@/components/scroll/motion-bridge";
import { createNativeScrollAdapter } from "@/components/scroll/native-adapter";
import type {
  ScrollAdapterFactory,
  ScrollController,
  ScrollSnapshot,
  ScrollTarget,
  ScrollToOptions,
} from "@/components/scroll/types";
import { ScrollMode, ScrollResult } from "@/components/scroll/types";

const UNAVAILABLE_SNAPSHOT: ScrollSnapshot = Object.freeze({
  y: 0,
  limit: 0,
  progress: 0,
  direction: 0,
  isScrolling: false,
  mode: ScrollMode.NATIVE,
});

const UNAVAILABLE_CONTROLLER: ScrollController = Object.freeze({
  ready: false,
  mode: ScrollMode.NATIVE,
  getSnapshot: () => UNAVAILABLE_SNAPSHOT,
  scrollTo: () => ScrollResult.CONTROLLER_UNAVAILABLE,
  suspend: () => {},
  resume: () => {},
  requestRefresh: () => {},
  subscribe: () => () => {},
  destroy: () => {},
});

const FALLBACK_MOTION_VALUES = createScrollMotionValues(
  UNAVAILABLE_SNAPSHOT,
);

const ScrollControllerContext = createContext<ScrollController>(
  UNAVAILABLE_CONTROLLER,
);
const ScrollMotionValuesContext = createContext<ScrollMotionValues>(
  FALLBACK_MOTION_VALUES,
);

export interface SmoothScrollProps {
  readonly children: ReactNode;
  /** Optional engine-neutral factory; Native Mode remains fully functional. */
  readonly enhancedAdapterFactory?: ScrollAdapterFactory;
}

export type SmoothScrollTarget = string | ScrollTarget;
export type SmoothScrollTo = (
  target: SmoothScrollTarget,
  offsetOrOptions?: number | ScrollToOptions,
) => ScrollResult;

function matchesMedia(query: string): boolean {
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

function reportInitializationFallback() {
  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.warn("[SmoothScroll:runtime-initialization-failed]");
  }
}

function normalizeTarget(target: SmoothScrollTarget): ScrollTarget {
  if (typeof target !== "string") return target;

  if (target.startsWith("#")) {
    return {
      kind: "id",
      id: decodeLocalHashToId(target) ?? "",
    };
  }

  return { kind: "selector", selector: target };
}

/** Returns the current engine-neutral controller, including its ready flag. */
export function useScrollController(): ScrollController {
  return useContext(ScrollControllerContext);
}

/** Returns stable MotionValues updated by the controller publication stream. */
export function useScrollMotionValues(): ScrollMotionValues {
  return useContext(ScrollMotionValuesContext);
}

/**
 * Preserves the existing `(selector, offset)` API while accepting typed targets
 * and options. Every call returns a ScrollResult instead of throwing.
 */
export function useSmoothScrollTo(): SmoothScrollTo {
  const controller = useScrollController();

  return useCallback(
    (target, offsetOrOptions) => {
      const options =
        typeof offsetOrOptions === "number"
          ? { offset: offsetOrOptions }
          : offsetOrOptions;

      return controller.scrollTo(normalizeTarget(target), options);
    },
    [controller],
  );
}

export default function SmoothScroll({
  children,
  enhancedAdapterFactory,
}: SmoothScrollProps) {
  const [controller, setController] = useState<ScrollController>(
    UNAVAILABLE_CONTROLLER,
  );
  const motionValues = useMemo(() => createScrollMotionValues(), []);

  useEffect(() => {
    const nativeAdapter = createNativeScrollAdapter(window);
    let nextController: ScrollController;

    try {
      nextController = createScrollController({
        browserWindow: window,
        document,
        nativeAdapter,
        enhancedAdapterFactory,
        reducedMotion: matchesMedia("(prefers-reduced-motion: reduce)"),
      });
    } catch {
      nativeAdapter.destroy();
      reportInitializationFallback();
      setController(UNAVAILABLE_CONTROLLER);
      return;
    }

    setController(nextController);
    return () => {
      nextController.destroy();
    };
  }, [enhancedAdapterFactory]);

  return (
    <ScrollControllerContext.Provider value={controller}>
      <ScrollMotionValuesContext.Provider value={motionValues}>
        <ScrollMotionBridge controller={controller} values={motionValues} />
        {children}
      </ScrollMotionValuesContext.Provider>
    </ScrollControllerContext.Provider>
  );
}
