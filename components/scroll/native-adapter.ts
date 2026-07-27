import { isFiniteNumber } from "./calculations";
import type { ScrollAdapter } from "./types";
import { ScrollMode } from "./types";

const NATIVE_SETTLE_TOLERANCE_PX = 2;
const NATIVE_SETTLE_DELAY_MS = 80;
const NATIVE_SETTLE_TIMEOUT_MS = 1_500;

/**
 * Uses the browser's canonical document scrolling APIs. It never changes root
 * geometry, intercepts input, or owns a continuous animation loop.
 */
export function createNativeScrollAdapter(browserWindow: Window): ScrollAdapter {
  let destroyed = false;
  let cancelPendingCompletion: (() => void) | null = null;

  const cancelCompletion = () => {
    cancelPendingCompletion?.();
    cancelPendingCompletion = null;
  };

  const completeAfterImmediateMovement = (onComplete: () => void) => {
    let frameId: number | null = null;
    let cancelled = false;

    const cancel = () => {
      cancelled = true;
      if (frameId !== null) {
        browserWindow.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    frameId = browserWindow.requestAnimationFrame(() => {
      frameId = null;
      if (cancelled || destroyed) return;
      if (cancelPendingCompletion === cancel) {
        cancelPendingCompletion = null;
      }
      onComplete();
    });

    cancelPendingCompletion = cancel;
  };

  const completeAfterSmoothMovement = (
    destinationY: number,
    onComplete: () => void,
  ) => {
    let finished = false;
    let settleTimerId: number | null = null;
    let timeoutId: number | null = null;
    let cancel = () => {};

    const cleanup = () => {
      browserWindow.removeEventListener("scroll", onScroll);
      browserWindow.removeEventListener("scrollend", finish);
      if (settleTimerId !== null) {
        browserWindow.clearTimeout(settleTimerId);
        settleTimerId = null;
      }
      if (timeoutId !== null) {
        browserWindow.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      cleanup();
      if (cancelPendingCompletion === cancel) {
        cancelPendingCompletion = null;
      }
      if (!destroyed) onComplete();
    };

    const onScroll = () => {
      if (
        !isFiniteNumber(browserWindow.scrollY) ||
        Math.abs(browserWindow.scrollY - destinationY) >
          NATIVE_SETTLE_TOLERANCE_PX
      ) {
        return;
      }

      if (settleTimerId !== null) {
        browserWindow.clearTimeout(settleTimerId);
      }
      settleTimerId = browserWindow.setTimeout(
        finish,
        NATIVE_SETTLE_DELAY_MS,
      );
    };

    cancel = () => {
      if (finished) return;
      finished = true;
      cleanup();
    };

    browserWindow.addEventListener("scroll", onScroll, { passive: true });
    browserWindow.addEventListener("scrollend", finish);
    timeoutId = browserWindow.setTimeout(finish, NATIVE_SETTLE_TIMEOUT_MS);
    cancelPendingCompletion = cancel;
    onScroll();
  };

  return {
    mode: ScrollMode.NATIVE,

    scrollTo(destinationY, options) {
      if (destroyed || !isFiniteNumber(destinationY)) return;

      cancelCompletion();
      const left = isFiniteNumber(browserWindow.scrollX)
        ? browserWindow.scrollX
        : 0;

      browserWindow.scrollTo({
        top: destinationY,
        left,
        // `auto` can inherit `html { scroll-behavior: smooth }`, so use the
        // explicit CSSOM instant mode for reduced-motion, refresh, and other
        // immediate controller requests.
        behavior: options.immediate ? "instant" : "smooth",
      });

      if (!options.onComplete) return;
      if (options.immediate) {
        completeAfterImmediateMovement(options.onComplete);
      } else {
        completeAfterSmoothMovement(destinationY, options.onComplete);
      }
    },

    start() {},
    stop() {},
    resize() {},

    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelCompletion();
    },
  };
}
