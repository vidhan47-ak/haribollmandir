import {
  isFiniteNumber,
  normalizeProgress,
  resolveScrollDestination,
  resolveScrollToOptions,
} from "./calculations";
import { createScrollRuntime, measureDocumentScrollLimit } from "./runtime";
import {
  addSuspensionReason,
  createSuspensionState,
  isSuspended,
  normalizeSuspensionReason,
  removeSuspensionReason,
} from "./suspension";
import type {
  ScrollAdapter,
  ScrollAdapterFactory,
  ScrollController,
  ScrollDirection,
  ScrollRefreshReason,
  ScrollSnapshot,
  ScrollTarget,
  ScrollToOptions,
  SuspensionState,
} from "./types";
import { ScrollMode, ScrollResult } from "./types";

const SCROLL_IDLE_DELAY_MS = 140;

export interface CreateScrollControllerOptions {
  readonly browserWindow: Window;
  readonly document: Document;
  /** Optional preselected adapter retained for compatibility with Task 2.1. */
  readonly activeAdapter?: ScrollAdapter;
  readonly nativeAdapter: ScrollAdapter;
  readonly enhancedAdapterFactory?: ScrollAdapterFactory;
  readonly reducedMotion: boolean;
  readonly frameDeltaCapMs?: number;
}

type ResolvedTarget = {
  readonly status: "resolved";
  readonly element: HTMLElement | null;
  readonly targetTop: number;
};

type TargetResolution =
  | ResolvedTarget
  | { readonly status: "missing" }
  | { readonly status: "invalid" };

function isDocumentHTMLElement(
  value: unknown,
  document: Document,
): value is HTMLElement {
  const HTMLElementConstructor = document.defaultView?.HTMLElement;
  return Boolean(
    HTMLElementConstructor &&
      value instanceof HTMLElementConstructor &&
      value.ownerDocument === document,
  );
}

function resolveTarget(
  target: ScrollTarget,
  currentScrollY: number,
  document: Document,
): TargetResolution {
  if (!target || typeof target !== "object") {
    return { status: "invalid" };
  }

  const candidate = target as unknown as Record<string, unknown>;

  if (candidate.kind === "absolute") {
    if (!isFiniteNumber(candidate.y)) return { status: "invalid" };
    const targetTop = candidate.y - currentScrollY;
    return isFiniteNumber(targetTop)
      ? { status: "resolved", element: null, targetTop }
      : { status: "invalid" };
  }

  let element: HTMLElement | null = null;

  if (candidate.kind === "element") {
    if (!isDocumentHTMLElement(candidate.element, document)) {
      return { status: "invalid" };
    }
    element = candidate.element;
  } else if (candidate.kind === "id") {
    if (
      typeof candidate.id !== "string" ||
      candidate.id.length === 0 ||
      candidate.id.includes("\0")
    ) {
      return { status: "invalid" };
    }
    element = document.getElementById(candidate.id);
  } else if (candidate.kind === "selector") {
    if (
      typeof candidate.selector !== "string" ||
      candidate.selector.trim().length === 0
    ) {
      return { status: "invalid" };
    }

    try {
      const selected = document.querySelector(candidate.selector);
      if (selected !== null && !isDocumentHTMLElement(selected, document)) {
        return { status: "invalid" };
      }
      element = selected;
    } catch {
      return { status: "invalid" };
    }
  } else {
    return { status: "invalid" };
  }

  if (!element || !element.isConnected) {
    return { status: "missing" };
  }

  try {
    const targetTop = element.getBoundingClientRect().top;
    return isFiniteNumber(targetTop)
      ? { status: "resolved", element, targetTop }
      : { status: "invalid" };
  } catch {
    return { status: "invalid" };
  }
}

function getDirection(previousY: number, nextY: number): ScrollDirection {
  if (nextY > previousY) return 1;
  if (nextY < previousY) return -1;
  return 0;
}

function readScrollY(browserWindow: Window, fallback: number): number {
  try {
    return isFiniteNumber(browserWindow.scrollY)
      ? browserWindow.scrollY
      : fallback;
  } catch {
    return fallback;
  }
}

function focusWithoutScrolling(element: HTMLElement, document: Document) {
  if (!element.isConnected) return;

  const needsTemporaryTabIndex =
    !element.hasAttribute("tabindex") && element.tabIndex < 0;

  try {
    if (needsTemporaryTabIndex) element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
  } catch {
    // Focus is an optional post-settle enhancement; movement stays accepted.
  } finally {
    if (needsTemporaryTabIndex) element.removeAttribute("tabindex");
  }
}

function updateLocalHistory(
  browserWindow: Window,
  element: HTMLElement | null,
) {
  if (!element?.id) return;

  try {
    const nextHash = `#${encodeURIComponent(element.id)}`;
    const { pathname, search, hash } = browserWindow.location;
    // Already reflecting this section: skip a redundant history write.
    if (hash === nextHash) return;
    // Build the URL from the path (never the current fragment) so a bare "#id"
    // can't be appended onto an existing fragment — that produced malformed
    // URLs like "/#home#home". Use replaceState (not push) so section scrolls
    // don't stack history entries that would otherwise swallow the browser
    // Back gesture before it can return to the previous page.
    const url = `${pathname}${search}${nextHash}`;
    browserWindow.history.replaceState(browserWindow.history.state, "", url);
  } catch {
    // Browser history restrictions must not turn valid scrolling into a throw.
  }
}

/**
 * Creates the engine-neutral controller around the canonical window/document
 * position. Scroll events are published through one coalesced RAF and never
 * through React state.
 */
export function createScrollController({
  browserWindow,
  document,
  activeAdapter,
  nativeAdapter,
  enhancedAdapterFactory,
  reducedMotion,
  frameDeltaCapMs,
}: CreateScrollControllerOptions): ScrollController {
  let destroyed = false;
  let publicationFrameId: number | null = null;
  let idleTimerId: number | null = null;
  let scrolling = false;
  let suspension: SuspensionState = createSuspensionState();
  let lastPublishedFrameTimestamp: number | null = null;
  const listeners = new Set<(snapshot: ScrollSnapshot) => void>();

  const initialY = readScrollY(browserWindow, 0);
  const initialLimit =
    measureDocumentScrollLimit(browserWindow, document) ?? 0;
  let snapshot: ScrollSnapshot = {
    y: initialY,
    limit: initialLimit,
    progress: normalizeProgress(initialY, initialLimit),
    direction: 0,
    isScrolling: false,
    mode: ScrollMode.NATIVE,
  };

  let runtime: ReturnType<typeof createScrollRuntime> | null = null;

  const publish = (frameTimestamp?: number) => {
    if (destroyed) return;
    if (
      isFiniteNumber(frameTimestamp) &&
      frameTimestamp === lastPublishedFrameTimestamp
    ) {
      return;
    }
    if (isFiniteNumber(frameTimestamp)) {
      lastPublishedFrameTimestamp = frameTimestamp;
    }

    const nextY = readScrollY(browserWindow, snapshot.y);
    const nextLimit =
      runtime?.measureScrollLimit() ??
      measureDocumentScrollLimit(browserWindow, document) ??
      0;
    snapshot = {
      y: nextY,
      limit: nextLimit,
      progress: normalizeProgress(nextY, nextLimit),
      direction: getDirection(snapshot.y, nextY),
      isScrolling: scrolling,
      mode: runtime?.mode ?? ScrollMode.NATIVE,
    };

    for (const listener of [...listeners]) {
      try {
        listener(snapshot);
      } catch {
        // One visual subscriber cannot interrupt other scroll consumers.
      }
    }
  };

  const enhancedFrameOwnsPublication = () => {
    if (
      runtime?.mode !== ScrollMode.ENHANCED ||
      isSuspended(suspension)
    ) {
      return false;
    }

    try {
      return document.visibilityState !== "hidden" && !document.hidden;
    } catch {
      return true;
    }
  };

  const schedulePublication = () => {
    if (
      destroyed ||
      publicationFrameId !== null ||
      enhancedFrameOwnsPublication()
    ) {
      return;
    }

    try {
      publicationFrameId = browserWindow.requestAnimationFrame(
        (timestampMs) => {
          publicationFrameId = null;
          publish(timestampMs);
        },
      );
    } catch {
      // Native scrolling remains usable if frame publication is unavailable.
      publicationFrameId = null;
    }
  };

  runtime = createScrollRuntime({
    browserWindow,
    document,
    nativeAdapter,
    enhancedAdapterFactory,
    initialEnhancedAdapter:
      activeAdapter && activeAdapter !== nativeAdapter
        ? activeAdapter
        : null,
    reducedMotion,
    frameDeltaCapMs,
    isSuspended: () => isSuspended(suspension),
    onFrame: publish,
    onChange: schedulePublication,
  });

  snapshot = {
    ...snapshot,
    mode: runtime.mode,
  };

  const markScrollIdle = () => {
    if (destroyed) return;
    scrolling = false;
    if (idleTimerId !== null) {
      browserWindow.clearTimeout(idleTimerId);
      idleTimerId = null;
    }
    schedulePublication();
  };

  const onScroll = () => {
    if (destroyed) return;
    scrolling = true;
    schedulePublication();

    if (idleTimerId !== null) browserWindow.clearTimeout(idleTimerId);
    try {
      idleTimerId = browserWindow.setTimeout(
        markScrollIdle,
        SCROLL_IDLE_DELAY_MS,
      );
    } catch {
      idleTimerId = null;
    }
  };

  try {
    browserWindow.addEventListener("scroll", onScroll, { passive: true });
    browserWindow.addEventListener("scrollend", markScrollIdle);
  } catch {
    // Programmatic scrolling remains available without subscriptions.
  }

  const controller: ScrollController = {
    get ready() {
      return !destroyed;
    },

    get mode() {
      return runtime?.mode ?? ScrollMode.NATIVE;
    },

    getSnapshot() {
      return snapshot;
    },

    scrollTo(target: ScrollTarget, options?: ScrollToOptions) {
      if (destroyed || !runtime) {
        return ScrollResult.CONTROLLER_UNAVAILABLE;
      }

      const resolvedOptions = resolveScrollToOptions(options);
      if (!resolvedOptions) return ScrollResult.INVALID_TARGET;

      const currentScrollY = readScrollY(browserWindow, Number.NaN);
      if (!isFiniteNumber(currentScrollY)) {
        return ScrollResult.INVALID_TARGET;
      }

      const targetResolution = resolveTarget(
        target,
        currentScrollY,
        document,
      );
      if (targetResolution.status === "missing") {
        return ScrollResult.TARGET_NOT_FOUND;
      }
      if (targetResolution.status === "invalid") {
        return ScrollResult.INVALID_TARGET;
      }

      const scrollLimit = runtime.measureScrollLimit();
      if (scrollLimit === null) return ScrollResult.INVALID_TARGET;

      const destination = resolveScrollDestination({
        targetTop: targetResolution.targetTop,
        currentScrollY,
        offset: resolvedOptions.offset,
        scrollLimit,
      });
      if (!destination) return ScrollResult.INVALID_TARGET;

      let focusCompleted = false;
      const onComplete =
        resolvedOptions.focusTarget && targetResolution.element
          ? () => {
              if (focusCompleted) return;
              focusCompleted = true;
              focusWithoutScrolling(targetResolution.element!, document);
            }
          : undefined;

      const requiresImmediateNativeMovement =
        runtime.reducedMotion || resolvedOptions.immediate;
      const preferredAdapter = requiresImmediateNativeMovement
        ? nativeAdapter
        : runtime.getActiveAdapter();

      try {
        preferredAdapter.scrollTo(destination.destinationY, {
          immediate: requiresImmediateNativeMovement,
          onComplete,
        });
      } catch {
        if (preferredAdapter === nativeAdapter) {
          return ScrollResult.CONTROLLER_UNAVAILABLE;
        }

        runtime.recoverToNative();
        try {
          nativeAdapter.scrollTo(destination.destinationY, {
            immediate: requiresImmediateNativeMovement,
            onComplete,
          });
        } catch {
          return ScrollResult.CONTROLLER_UNAVAILABLE;
        }
      }

      if (resolvedOptions.updateHistory) {
        updateLocalHistory(browserWindow, targetResolution.element);
      }
      schedulePublication();
      return ScrollResult.ACCEPTED;
    },

    suspend(reason) {
      if (destroyed || !runtime) return;
      const nextSuspension = addSuspensionReason(
        suspension,
        reason,
        readScrollY(browserWindow, snapshot.y),
      );
      if (nextSuspension === suspension) return;

      suspension = nextSuspension;
      runtime.setSuspended(true);
    },

    resume(reason) {
      if (destroyed || !runtime) return;
      const normalizedReason = normalizeSuspensionReason(reason);
      if (!normalizedReason) return;

      const preservedY = suspension.positionAtFirstSuspend;
      const nextSuspension = removeSuspensionReason(
        suspension,
        normalizedReason,
      );
      if (nextSuspension === suspension) return;

      suspension = nextSuspension;
      if (isSuspended(suspension)) return;

      runtime.setSuspended(false);
      runtime.requestRefresh(
        `resume:${normalizedReason}`,
        preservedY,
      );
    },

    requestRefresh(reason: ScrollRefreshReason) {
      if (destroyed || !runtime) return;
      runtime.requestRefresh(reason);
    },

    subscribe(listener) {
      if (destroyed || typeof listener !== "function") return () => {};
      listeners.add(listener);
      let subscribed = true;
      return () => {
        if (!subscribed) return;
        subscribed = false;
        listeners.delete(listener);
      };
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;

      try {
        browserWindow.removeEventListener("scroll", onScroll);
        browserWindow.removeEventListener("scrollend", markScrollIdle);
      } catch {
        // Cleanup remains idempotent on partial browser implementations.
      }

      if (publicationFrameId !== null) {
        try {
          browserWindow.cancelAnimationFrame(publicationFrameId);
        } catch {
          // The destroyed guard keeps a delivered callback inert.
        }
        publicationFrameId = null;
      }
      if (idleTimerId !== null) {
        browserWindow.clearTimeout(idleTimerId);
        idleTimerId = null;
      }

      listeners.clear();
      suspension = createSuspensionState();
      runtime?.destroy();
      runtime = null;
    },
  };

  return controller;
}
