"use client";

import { useEffect } from "react";
import { useScrollController } from "@/components/SmoothScroll";
import {
  decodeLocalHashToId,
  DEFAULT_SCROLL_OFFSET,
  ScrollRefreshReason,
} from "@/components/scroll";

/**
 * Resolves homepage fragments by local element ID once both the target and the
 * scroll controller are ready. Browser history owns the hash; this helper only
 * applies the fixed-navbar clearance after a coalesced layout refresh.
 */
export default function HashScroll() {
  const controller = useScrollController();

  useEffect(() => {
    if (!controller.ready) return;

    let disposed = false;
    let cancelPendingAttempt = () => {};

    const handleHash = () => {
      cancelPendingAttempt();

      const decodedId = decodeLocalHashToId(window.location.hash);
      if (!decodedId || disposed || !controller.ready) return;
      const id = decodedId;

      let attemptCancelled = false;
      let targetObserver: MutationObserver | null = null;
      let refreshFrameId: number | null = null;
      let scrollFrameId: number | null = null;

      const isCurrentAttempt = () =>
        !disposed &&
        !attemptCancelled &&
        controller.ready &&
        decodeLocalHashToId(window.location.hash) === id;

      const disconnectTargetObserver = () => {
        targetObserver?.disconnect();
        targetObserver = null;
      };

      const cancelFrame = (frameId: number | null) => {
        if (frameId === null) return;
        try {
          window.cancelAnimationFrame(frameId);
        } catch {
          // Cancellation guards below keep a delivered callback inert.
        }
      };

      cancelPendingAttempt = () => {
        if (attemptCancelled) return;
        attemptCancelled = true;
        disconnectTargetObserver();
        cancelFrame(refreshFrameId);
        cancelFrame(scrollFrameId);
        refreshFrameId = null;
        scrollFrameId = null;
      };

      const requestRefreshAndScroll = () => {
        if (!isCurrentAttempt()) return;
        if (!document.getElementById(id)) {
          waitForTarget();
          return;
        }

        controller.requestRefresh(ScrollRefreshReason.ROUTE);

        try {
          // The first frame lets the coalesced refresh run. Scrolling on the
          // following frame prevents its position-preservation pass from
          // restoring the pre-navigation position.
          refreshFrameId = window.requestAnimationFrame(() => {
            refreshFrameId = null;
            if (!isCurrentAttempt()) return;

            try {
              scrollFrameId = window.requestAnimationFrame(() => {
                scrollFrameId = null;
                if (!isCurrentAttempt()) return;
                if (!document.getElementById(id)) return;

                controller.scrollTo(
                  { kind: "id", id },
                  { offset: DEFAULT_SCROLL_OFFSET },
                );
              });
            } catch {
              // Native fragment behavior remains available without RAF.
            }
          });
        } catch {
          // Native fragment behavior remains available without RAF.
        }
      };

      const waitForFonts = () => {
        if (!isCurrentAttempt()) return;

        let fontsReady: Promise<FontFaceSet> | null = null;
        try {
          fontsReady = document.fonts?.ready ?? null;
        } catch {
          // A missing Font Loading API uses the controller's refresh fallback.
        }

        if (!fontsReady) {
          requestRefreshAndScroll();
          return;
        }

        Promise.resolve(fontsReady).then(
          requestRefreshAndScroll,
          requestRefreshAndScroll,
        );
      };

      function waitForTarget() {
        if (!isCurrentAttempt()) return;
        if (document.getElementById(id)) {
          disconnectTargetObserver();
          waitForFonts();
          return;
        }
        if (targetObserver) return;

        const MutationObserverConstructor = window.MutationObserver;
        if (typeof MutationObserverConstructor !== "function") return;

        try {
          targetObserver = new MutationObserverConstructor(() => {
            if (!isCurrentAttempt()) {
              disconnectTargetObserver();
              return;
            }
            if (document.getElementById(id)) waitForTarget();
          });
          targetObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
          });
        } catch {
          disconnectTargetObserver();
        }
      }

      waitForTarget();
    };

    window.addEventListener("hashchange", handleHash);
    handleHash();

    return () => {
      disposed = true;
      window.removeEventListener("hashchange", handleHash);
      cancelPendingAttempt();
    };
  }, [controller]);

  return null;
}
