import {
  isFiniteNumber,
  normalizeScrollLimit,
} from "./calculations";
import { selectMotionPolicy } from "./policy";
import type {
  ScrollAdapter,
  ScrollAdapterFactory,
  ScrollRefreshReason,
} from "./types";
import { ScrollMode, ScrollRefreshReason as RefreshReason } from "./types";

const DEFAULT_FRAME_DELTA_CAP_MS = 64;
const FONT_SETTLE_TIMEOUT_MS = 250;
const POSITION_TOLERANCE_PX = 0.5;

type RuntimeDiagnosticCode =
  | "adapter-cleanup-failed"
  | "enhanced-adapter-failed"
  | "enhanced-adapter-unavailable"
  | "enhanced-frame-unavailable"
  | "mutation-observer-unavailable"
  | "resize-observer-unavailable"
  | "signal-subscription-failed";

interface InlineStyleValue {
  readonly value: string;
  readonly priority: string;
}

interface ElementStyleSnapshot {
  readonly element: HTMLElement;
  readonly hadStyleAttribute: boolean;
  readonly properties: ReadonlyMap<string, InlineStyleValue>;
}

interface DocumentStyleGuard {
  captureAdapterState(): void;
  restore(): void;
}

export interface CreateScrollRuntimeOptions {
  readonly browserWindow: Window;
  readonly document: Document;
  readonly nativeAdapter: ScrollAdapter;
  readonly enhancedAdapterFactory?: ScrollAdapterFactory;
  readonly initialEnhancedAdapter?: ScrollAdapter | null;
  readonly reducedMotion: boolean;
  readonly frameDeltaCapMs?: number;
  readonly isSuspended: () => boolean;
  readonly onFrame: (timestampMs: number) => void;
  readonly onChange: () => void;
}

export interface ScrollRuntime {
  readonly mode: (typeof ScrollMode)[keyof typeof ScrollMode];
  readonly reducedMotion: boolean;
  getActiveAdapter(): ScrollAdapter;
  measureScrollLimit(): number | null;
  recoverToNative(): void;
  setSuspended(suspended: boolean): void;
  requestRefresh(
    reason: ScrollRefreshReason,
    preservedY?: number | null,
  ): void;
  destroy(): void;
}

function createDiagnosticReporter() {
  const emitted = new Set<RuntimeDiagnosticCode>();
  const development =
    typeof process !== "undefined" &&
    process.env.NODE_ENV !== "production";

  return (code: RuntimeDiagnosticCode) => {
    if (!development || emitted.has(code)) return;
    emitted.add(code);
    console.warn(`[SmoothScroll:${code}]`);
  };
}

function readCanonicalScrollY(
  browserWindow: Window,
  fallback = 0,
): number {
  try {
    return isFiniteNumber(browserWindow.scrollY)
      ? browserWindow.scrollY
      : fallback;
  } catch {
    return fallback;
  }
}

function readViewportWidth(browserWindow: Window): number {
  try {
    return isFiniteNumber(browserWindow.innerWidth)
      ? browserWindow.innerWidth
      : 0;
  } catch {
    return 0;
  }
}

function isDocumentVisible(document: Document): boolean {
  try {
    return document.visibilityState !== "hidden" && !document.hidden;
  } catch {
    return true;
  }
}

/** Measures the canonical document range without trusting non-finite geometry. */
export function measureDocumentScrollLimit(
  browserWindow: Window,
  document: Document,
): number | null {
  let viewportHeight: number;
  try {
    viewportHeight = browserWindow.innerHeight;
  } catch {
    return null;
  }

  if (!isFiniteNumber(viewportHeight)) return null;

  const heights: number[] = [];
  const candidates = [
    document.scrollingElement,
    document.documentElement,
    document.body,
  ];

  for (const candidate of candidates) {
    try {
      if (candidate && isFiniteNumber(candidate.scrollHeight)) {
        heights.push(candidate.scrollHeight);
      }
    } catch {
      // A usable geometry source may still remain.
    }
  }

  if (heights.length === 0) return null;
  return normalizeScrollLimit(Math.max(...heights) - viewportHeight);
}

function captureElementStyle(element: HTMLElement): ElementStyleSnapshot {
  const properties = new Map<string, InlineStyleValue>();
  const style = element.style;

  for (let index = 0; index < style.length; index += 1) {
    const property = style.item(index);
    if (!property) continue;
    properties.set(property, {
      value: style.getPropertyValue(property),
      priority: style.getPropertyPriority(property),
    });
  }

  return {
    element,
    hadStyleAttribute: element.hasAttribute("style"),
    properties,
  };
}

function sameStyleValue(
  left: InlineStyleValue | undefined,
  right: InlineStyleValue | undefined,
): boolean {
  return (
    left?.value === right?.value &&
    left?.priority === right?.priority
  );
}

function createDocumentStyleGuard(document: Document): DocumentStyleGuard {
  const targets: HTMLElement[] = [];
  const addTarget = (candidate: Element | null | undefined) => {
    if (
      candidate &&
      "style" in candidate &&
      !targets.includes(candidate as HTMLElement)
    ) {
      targets.push(candidate as HTMLElement);
    }
  };

  addTarget(document.documentElement);
  addTarget(document.body);
  addTarget(document.scrollingElement);

  const baseline = targets.map(captureElementStyle);
  let adapterState: ElementStyleSnapshot[] | null = null;

  return {
    captureAdapterState() {
      adapterState = targets.map(captureElementStyle);
    },

    restore() {
      const observed = adapterState ?? targets.map(captureElementStyle);

      for (let index = 0; index < baseline.length; index += 1) {
        const before = baseline[index];
        const after = observed[index];
        if (!before || !after) continue;

        const changedProperties = new Set([
          ...before.properties.keys(),
          ...after.properties.keys(),
        ]);

        for (const property of changedProperties) {
          const beforeValue = before.properties.get(property);
          const adapterValue = after.properties.get(property);
          if (sameStyleValue(beforeValue, adapterValue)) continue;

          const currentValue: InlineStyleValue | undefined =
            before.element.style.getPropertyValue(property) ||
            before.element.style.getPropertyPriority(property)
              ? {
                  value: before.element.style.getPropertyValue(property),
                  priority:
                    before.element.style.getPropertyPriority(property),
                }
              : undefined;

          // Do not overwrite a value another feature changed after activation.
          if (!sameStyleValue(currentValue, adapterValue)) continue;

          if (beforeValue) {
            before.element.style.setProperty(
              property,
              beforeValue.value,
              beforeValue.priority,
            );
          } else {
            before.element.style.removeProperty(property);
          }
        }

        if (
          !before.hadStyleAttribute &&
          before.element.style.length === 0
        ) {
          before.element.removeAttribute("style");
        }
      }

      adapterState = null;
    },
  };
}

function isEnhancedAdapter(value: unknown): value is ScrollAdapter {
  if (!value || typeof value !== "object") return false;

  try {
    const adapter = value as ScrollAdapter;
    return (
      adapter.mode === ScrollMode.ENHANCED &&
      typeof adapter.scrollTo === "function" &&
      typeof adapter.start === "function" &&
      typeof adapter.stop === "function" &&
      typeof adapter.resize === "function" &&
      typeof adapter.advance === "function" &&
      typeof adapter.destroy === "function"
    );
  } catch {
    return false;
  }
}

/**
 * Owns policy signals, adapter migration, enhanced frame work, and layout
 * refreshes while leaving window/document as the canonical scroll container.
 */
export function createScrollRuntime({
  browserWindow,
  document,
  nativeAdapter,
  enhancedAdapterFactory,
  initialEnhancedAdapter = null,
  reducedMotion: reducedMotionFallback,
  frameDeltaCapMs,
  isSuspended: readSuspended,
  onFrame,
  onChange,
}: CreateScrollRuntimeOptions): ScrollRuntime {
  const diagnose = createDiagnosticReporter();
  const cleanupCallbacks: Array<() => void> = [];
  const refreshReasons = new Set<ScrollRefreshReason>();
  const deltaCap =
    isFiniteNumber(frameDeltaCapMs) && frameDeltaCapMs > 0
      ? frameDeltaCapMs
      : DEFAULT_FRAME_DELTA_CAP_MS;

  let destroyed = false;
  let suspended = readSuspended();
  let activeAdapter = nativeAdapter;
  let activeMode: (typeof ScrollMode)[keyof typeof ScrollMode] =
    ScrollMode.NATIVE;
  let enhancedAdapter: ScrollAdapter | null = null;
  let queuedInitialAdapter = initialEnhancedAdapter;
  let enhancedUnavailable = false;
  let adapterRunning = false;
  let styleGuard: DocumentStyleGuard | null = null;
  let enhancedFrameId: number | null = null;
  let lastFrameTimestamp: number | null = null;

  let refreshPending = false;
  let refreshPreservedY: number | null = null;
  let refreshFrameId: number | null = null;
  let refreshFallbackTimerId: number | null = null;
  let fontSettleTimerId: number | null = null;
  let refreshGeneration = 0;

  const safeMatchMedia = (query: string): MediaQueryList | null => {
    try {
      return typeof browserWindow.matchMedia === "function"
        ? browserWindow.matchMedia(query)
        : null;
    } catch {
      return null;
    }
  };

  const reducedMotionQuery = safeMatchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const coarsePointerQuery = safeMatchMedia("(pointer: coarse)");
  const finePointerQuery = safeMatchMedia("(pointer: fine)");
  let currentReducedMotion =
    reducedMotionQuery?.matches ?? reducedMotionFallback;

  const ownCleanup = (cleanup: () => void) => {
    let active = true;
    cleanupCallbacks.push(() => {
      if (!active) return;
      active = false;
      cleanup();
    });
  };

  const addOwnedEventListener = (
    target: EventTarget | null | undefined,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions | boolean,
  ): boolean => {
    if (!target) return false;

    try {
      target.addEventListener(type, listener, options);
      ownCleanup(() => {
        try {
          target.removeEventListener(type, listener, options);
        } catch {
          diagnose("signal-subscription-failed");
        }
      });
      return true;
    } catch {
      diagnose("signal-subscription-failed");
      return false;
    }
  };

  const subscribeMediaQuery = (
    query: MediaQueryList | null,
    listener: (event: MediaQueryListEvent) => void,
  ) => {
    if (!query) return;

    try {
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", listener);
        ownCleanup(() => query.removeEventListener("change", listener));
      } else if (typeof query.addListener === "function") {
        query.addListener(listener);
        ownCleanup(() => query.removeListener(listener));
      }
    } catch {
      diagnose("signal-subscription-failed");
    }
  };

  const cancelEnhancedFrame = () => {
    if (enhancedFrameId !== null) {
      try {
        browserWindow.cancelAnimationFrame(enhancedFrameId);
      } catch {
        // The frame is still made inert by the state reset below.
      }
      enhancedFrameId = null;
    }
    lastFrameTimestamp = null;
  };

  const safeDestroyAdapter = (adapter: ScrollAdapter | null) => {
    if (!adapter) return;
    try {
      adapter.destroy();
    } catch {
      diagnose("adapter-cleanup-failed");
    }
  };

  const preserveCanonicalPosition = (preservedY: number) => {
    if (!isFiniteNumber(preservedY)) return;
    const limit = measureDocumentScrollLimit(browserWindow, document);
    if (limit === null) return;

    const clampedY = Math.min(limit, Math.max(0, preservedY));
    const currentY = readCanonicalScrollY(browserWindow, clampedY);
    if (Math.abs(currentY - clampedY) <= POSITION_TOLERANCE_PX) {
      return;
    }

    try {
      nativeAdapter.scrollTo(clampedY, { immediate: true });
    } catch {
      // Native input remains available even if a programmatic command fails.
    }
  };

  const teardownEnhancedAdapter = (
    preservedY: number,
    disableFutureAttempts: boolean,
  ) => {
    cancelEnhancedFrame();

    const adapter = enhancedAdapter;
    enhancedAdapter = null;
    activeAdapter = nativeAdapter;
    activeMode = ScrollMode.NATIVE;
    adapterRunning = false;
    if (disableFutureAttempts) enhancedUnavailable = true;

    if (adapter) {
      try {
        adapter.stop();
      } catch {
        diagnose("adapter-cleanup-failed");
      }
      safeDestroyAdapter(adapter);
    }

    styleGuard?.restore();
    styleGuard = null;
    preserveCanonicalPosition(preservedY);
  };

  const recoverToNative = () => {
    if (destroyed || activeMode !== ScrollMode.ENHANCED) return;
    const preservedY = readCanonicalScrollY(browserWindow);
    diagnose("enhanced-adapter-failed");
    teardownEnhancedAdapter(preservedY, true);
    onChange();
  };

  const shouldRunEnhancedAdapter = () =>
    !destroyed &&
    activeMode === ScrollMode.ENHANCED &&
    isDocumentVisible(document) &&
    !suspended;

  const scheduleEnhancedFrame = () => {
    if (
      !shouldRunEnhancedAdapter() ||
      enhancedFrameId !== null ||
      !enhancedAdapter?.advance
    ) {
      return;
    }

    try {
      enhancedFrameId = browserWindow.requestAnimationFrame(
        runEnhancedFrame,
      );
    } catch {
      enhancedFrameId = null;
      diagnose("enhanced-frame-unavailable");
      recoverToNative();
    }
  };

  function runEnhancedFrame(timestampMs: number) {
    enhancedFrameId = null;
    if (!shouldRunEnhancedAdapter() || !enhancedAdapter?.advance) {
      lastFrameTimestamp = null;
      return;
    }

    if (
      refreshPending &&
      refreshFrameId === null &&
      refreshFallbackTimerId === null &&
      fontSettleTimerId === null
    ) {
      waitForFontsThenRefresh();
    }

    if (!shouldRunEnhancedAdapter() || !enhancedAdapter?.advance) {
      lastFrameTimestamp = null;
      return;
    }

    if (!isFiniteNumber(timestampMs)) {
      lastFrameTimestamp = null;
      scheduleEnhancedFrame();
      return;
    }

    let deltaMs = 0;
    if (lastFrameTimestamp !== null) {
      const elapsed = timestampMs - lastFrameTimestamp;
      // A long task receives a fresh baseline rather than accumulated motion.
      if (isFiniteNumber(elapsed) && elapsed > 0 && elapsed <= deltaCap) {
        deltaMs = elapsed;
      }
    }
    lastFrameTimestamp = timestampMs;

    try {
      enhancedAdapter.advance(timestampMs, deltaMs);
    } catch {
      recoverToNative();
      return;
    }

    onFrame(timestampMs);
    scheduleEnhancedFrame();
  }

  const reconcileEnhancedActivity = () => {
    if (activeMode !== ScrollMode.ENHANCED || !enhancedAdapter) {
      cancelEnhancedFrame();
      adapterRunning = false;
      return;
    }

    if (!shouldRunEnhancedAdapter()) {
      cancelEnhancedFrame();
      if (adapterRunning) {
        try {
          enhancedAdapter.stop();
          adapterRunning = false;
        } catch {
          recoverToNative();
        }
      }
      return;
    }

    if (!adapterRunning) {
      try {
        enhancedAdapter.start();
        adapterRunning = true;
      } catch {
        recoverToNative();
        return;
      }
    }

    scheduleEnhancedFrame();
  };

  const createEnhancedAdapter = (preservedY: number): boolean => {
    const guard = createDocumentStyleGuard(document);
    let candidate: ScrollAdapter | null = null;

    try {
      if (queuedInitialAdapter) {
        candidate = queuedInitialAdapter;
        queuedInitialAdapter = null;
      } else if (enhancedAdapterFactory) {
        candidate = enhancedAdapterFactory();
      }

      if (!isEnhancedAdapter(candidate)) {
        safeDestroyAdapter(candidate);
        candidate = null;
        throw new Error("invalid-enhanced-adapter");
      }

      activeAdapter = candidate;
      enhancedAdapter = candidate;
      activeMode = ScrollMode.ENHANCED;
      adapterRunning = false;

      if (shouldRunEnhancedAdapter()) {
        candidate.start();
        adapterRunning = true;
      } else {
        candidate.stop();
      }

      guard.captureAdapterState();
      styleGuard = guard;
      preserveCanonicalPosition(preservedY);
      scheduleEnhancedFrame();
      return activeMode === ScrollMode.ENHANCED;
    } catch {
      guard.captureAdapterState();
      cancelEnhancedFrame();

      if (candidate) {
        try {
          candidate.stop();
        } catch {
          diagnose("adapter-cleanup-failed");
        }
        safeDestroyAdapter(candidate);
      }

      guard.restore();
      activeAdapter = nativeAdapter;
      enhancedAdapter = null;
      activeMode = ScrollMode.NATIVE;
      adapterRunning = false;
      enhancedUnavailable = true;
      preserveCanonicalPosition(preservedY);
      diagnose("enhanced-adapter-failed");
      return false;
    }
  };

  const hasEnhancedAdapterAvailable = () =>
    !enhancedUnavailable &&
    Boolean(
      activeMode === ScrollMode.ENHANCED ||
        queuedInitialAdapter ||
        enhancedAdapterFactory,
    );

  const evaluatePolicy = (): boolean => {
    currentReducedMotion =
      reducedMotionQuery?.matches ?? reducedMotionFallback;
    const policy = selectMotionPolicy({
      reducedMotion: currentReducedMotion,
      coarsePointer: coarsePointerQuery?.matches ?? false,
      finePointer: finePointerQuery?.matches ?? false,
      viewportWidth: readViewportWidth(browserWindow),
      documentVisible: isDocumentVisible(document),
      enhancedEngineAvailable: hasEnhancedAdapterAvailable(),
    });
    const previousMode = activeMode;
    const preservedY = readCanonicalScrollY(browserWindow);

    if (policy.scrollMode === ScrollMode.ENHANCED) {
      if (activeMode !== ScrollMode.ENHANCED) {
        createEnhancedAdapter(preservedY);
      } else {
        reconcileEnhancedActivity();
      }
    } else if (activeMode === ScrollMode.ENHANCED) {
      teardownEnhancedAdapter(preservedY, false);
    } else {
      if (queuedInitialAdapter) {
        try {
          queuedInitialAdapter.stop();
        } catch {
          safeDestroyAdapter(queuedInitialAdapter);
          queuedInitialAdapter = null;
          if (!enhancedAdapterFactory) enhancedUnavailable = true;
        }
      }

      if (
        !hasEnhancedAdapterAvailable() &&
        !currentReducedMotion &&
        (finePointerQuery?.matches ?? false)
      ) {
        diagnose("enhanced-adapter-unavailable");
      }
    }

    return previousMode !== activeMode;
  };

  const clearRefreshScheduling = (clearPending: boolean) => {
    refreshGeneration += 1;

    if (refreshFrameId !== null) {
      try {
        browserWindow.cancelAnimationFrame(refreshFrameId);
      } catch {
        // Generation invalidation keeps a delivered callback inert.
      }
      refreshFrameId = null;
    }
    if (refreshFallbackTimerId !== null) {
      browserWindow.clearTimeout(refreshFallbackTimerId);
      refreshFallbackTimerId = null;
    }
    if (fontSettleTimerId !== null) {
      browserWindow.clearTimeout(fontSettleTimerId);
      fontSettleTimerId = null;
    }

    if (clearPending) {
      refreshPending = false;
      refreshPreservedY = null;
      refreshReasons.clear();
    }
  };

  const completeRefresh = () => {
    if (destroyed || !refreshPending) return;
    if (!isDocumentVisible(document)) {
      clearRefreshScheduling(false);
      return;
    }

    const preservedY =
      refreshPreservedY ?? readCanonicalScrollY(browserWindow);
    refreshPending = false;
    refreshPreservedY = null;
    refreshReasons.clear();

    try {
      activeAdapter.resize();
    } catch {
      if (activeMode === ScrollMode.ENHANCED) {
        recoverToNative();
      }
    }

    preserveCanonicalPosition(preservedY);
    onChange();
  };

  function waitForFontsThenRefresh() {
    refreshFrameId = null;
    refreshFallbackTimerId = null;
    if (destroyed || !refreshPending) return;
    if (!isDocumentVisible(document)) return;

    let fonts: FontFaceSet | undefined;
    try {
      fonts = document.fonts;
    } catch {
      completeRefresh();
      return;
    }

    if (!fonts?.ready) {
      completeRefresh();
      return;
    }

    const generation = ++refreshGeneration;
    let completed = false;
    const finish = () => {
      if (completed || destroyed || generation !== refreshGeneration) {
        return;
      }
      completed = true;
      if (fontSettleTimerId !== null) {
        browserWindow.clearTimeout(fontSettleTimerId);
        fontSettleTimerId = null;
      }
      if (!isDocumentVisible(document)) {
        clearRefreshScheduling(false);
        return;
      }
      completeRefresh();
    };

    try {
      fontSettleTimerId = browserWindow.setTimeout(
        finish,
        FONT_SETTLE_TIMEOUT_MS,
      );
      Promise.resolve(fonts.ready).then(finish, finish);
    } catch {
      finish();
    }
  }

  const scheduleRefresh = () => {
    if (
      destroyed ||
      !refreshPending ||
      refreshFrameId !== null ||
      refreshFallbackTimerId !== null ||
      fontSettleTimerId !== null ||
      !isDocumentVisible(document)
    ) {
      return;
    }

    if (shouldRunEnhancedAdapter()) {
      scheduleEnhancedFrame();
      return;
    }

    try {
      refreshFrameId = browserWindow.requestAnimationFrame(() => {
        waitForFontsThenRefresh();
      });
      return;
    } catch {
      diagnose("enhanced-frame-unavailable");
    }

    try {
      refreshFallbackTimerId = browserWindow.setTimeout(
        waitForFontsThenRefresh,
        0,
      );
    } catch {
      waitForFontsThenRefresh();
    }
  };

  const requestRefresh = (
    reason: ScrollRefreshReason,
    preservedY?: number | null,
  ) => {
    if (destroyed) return;
    refreshReasons.add(reason);

    if (!refreshPending) {
      refreshPending = true;
      refreshPreservedY = isFiniteNumber(preservedY)
        ? preservedY
        : readCanonicalScrollY(browserWindow);
    }

    scheduleRefresh();
  };

  const handlePolicySignal = () => {
    if (destroyed) return;
    const changed = evaluatePolicy();
    if (changed) clearRefreshScheduling(true);
    requestRefresh(
      changed ? RefreshReason.POLICY : RefreshReason.VIEWPORT,
    );
  };

  subscribeMediaQuery(reducedMotionQuery, handlePolicySignal);
  subscribeMediaQuery(coarsePointerQuery, handlePolicySignal);
  subscribeMediaQuery(finePointerQuery, handlePolicySignal);

  addOwnedEventListener(browserWindow, "resize", handlePolicySignal);
  addOwnedEventListener(browserWindow, "orientationchange", handlePolicySignal);

  try {
    addOwnedEventListener(
      browserWindow.visualViewport,
      "resize",
      () => {
        requestRefresh(RefreshReason.VIEWPORT);
      },
    );
  } catch {
    diagnose("signal-subscription-failed");
  }

  const handleVisibilityChange = () => {
    if (destroyed) return;
    if (!isDocumentVisible(document)) {
      cancelEnhancedFrame();
      reconcileEnhancedActivity();
      clearRefreshScheduling(false);
      return;
    }

    lastFrameTimestamp = null;
    const changed = evaluatePolicy();
    if (changed) clearRefreshScheduling(true);
    reconcileEnhancedActivity();
    requestRefresh(RefreshReason.VISIBILITY);
    scheduleRefresh();
  };
  addOwnedEventListener(
    document,
    "visibilitychange",
    handleVisibilityChange,
  );

  const handleRouteSignal = () => requestRefresh(RefreshReason.ROUTE);
  addOwnedEventListener(browserWindow, "popstate", handleRouteSignal);
  addOwnedEventListener(browserWindow, "hashchange", handleRouteSignal);
  addOwnedEventListener(browserWindow, "pageshow", handleRouteSignal);

  const navigation = (
    browserWindow as Window & { readonly navigation?: EventTarget }
  ).navigation;
  addOwnedEventListener(navigation, "navigate", handleRouteSignal);

  const handleImageSignal = (event: Event) => {
    const target = event.target;
    const ImageConstructor = (
      browserWindow as Window & {
        readonly HTMLImageElement?: typeof HTMLImageElement;
      }
    ).HTMLImageElement;
    const ElementConstructor = document.defaultView?.Element;
    if (
      (typeof ImageConstructor === "function" &&
        target instanceof ImageConstructor) ||
      (ElementConstructor &&
        target instanceof ElementConstructor &&
        target.tagName === "IMG")
    ) {
      requestRefresh(RefreshReason.IMAGE);
    }
  };
  addOwnedEventListener(document, "load", handleImageSignal, true);
  addOwnedEventListener(document, "error", handleImageSignal, true);

  try {
    const fonts = document.fonts;
    addOwnedEventListener(fonts, "loadingdone", () => {
      requestRefresh(RefreshReason.FONT);
    });
    addOwnedEventListener(fonts, "loadingerror", () => {
      requestRefresh(RefreshReason.FONT);
    });
  } catch {
    diagnose("signal-subscription-failed");
  }

  const ResizeObserverConstructor = (
    browserWindow as Window & {
      readonly ResizeObserver?: typeof ResizeObserver;
    }
  ).ResizeObserver;
  if (typeof ResizeObserverConstructor === "function") {
    try {
      const resizeObserver = new ResizeObserverConstructor(() => {
        requestRefresh(RefreshReason.RESIZE);
      });
      resizeObserver.observe(document.documentElement);
      if (document.body) resizeObserver.observe(document.body);
      ownCleanup(() => resizeObserver.disconnect());
    } catch {
      diagnose("resize-observer-unavailable");
    }
  } else {
    diagnose("resize-observer-unavailable");
  }

  const MutationObserverConstructor = (
    browserWindow as Window & {
      readonly MutationObserver?: typeof MutationObserver;
    }
  ).MutationObserver;
  if (typeof MutationObserverConstructor === "function") {
    try {
      const mutationObserver = new MutationObserverConstructor((records) => {
        const languageChanged = records.some(
          (record) =>
            record.type === "attributes" &&
            record.target === document.documentElement &&
            record.attributeName === "lang",
        );
        requestRefresh(
          languageChanged ? RefreshReason.LANGUAGE : RefreshReason.CONTENT,
        );
      });
      mutationObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"],
      });
      if (document.body) {
        mutationObserver.observe(document.body, {
          childList: true,
          subtree: true,
        });
      }
      ownCleanup(() => mutationObserver.disconnect());
    } catch {
      diagnose("mutation-observer-unavailable");
    }
  } else {
    diagnose("mutation-observer-unavailable");
  }

  evaluatePolicy();

  const runtime: ScrollRuntime = {
    get mode() {
      return activeMode;
    },

    get reducedMotion() {
      return currentReducedMotion;
    },

    getActiveAdapter() {
      return activeAdapter;
    },

    measureScrollLimit() {
      return measureDocumentScrollLimit(browserWindow, document);
    },

    recoverToNative,

    setSuspended(nextSuspended) {
      if (destroyed || suspended === nextSuspended) return;
      suspended = nextSuspended;
      reconcileEnhancedActivity();
    },

    requestRefresh,

    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearRefreshScheduling(true);
      cancelEnhancedFrame();

      for (let index = cleanupCallbacks.length - 1; index >= 0; index -= 1) {
        try {
          cleanupCallbacks[index]?.();
        } catch {
          diagnose("signal-subscription-failed");
        }
      }
      cleanupCallbacks.length = 0;

      const adapter = enhancedAdapter;
      enhancedAdapter = null;
      activeAdapter = nativeAdapter;
      activeMode = ScrollMode.NATIVE;
      adapterRunning = false;
      suspended = false;

      if (adapter) {
        try {
          adapter.stop();
        } catch {
          diagnose("adapter-cleanup-failed");
        }
        safeDestroyAdapter(adapter);
      }
      if (queuedInitialAdapter && queuedInitialAdapter !== adapter) {
        safeDestroyAdapter(queuedInitialAdapter);
      }
      queuedInitialAdapter = null;

      styleGuard?.restore();
      styleGuard = null;
      safeDestroyAdapter(nativeAdapter);
    },
  };

  return runtime;
}
