export const ScrollMode = {
  NATIVE: "native",
  ENHANCED: "enhanced",
} as const;

export type ScrollMode = (typeof ScrollMode)[keyof typeof ScrollMode];

export interface MotionCapabilities {
  readonly reducedMotion: boolean;
  readonly coarsePointer: boolean;
  readonly finePointer: boolean;
  readonly viewportWidth: number;
  readonly documentVisible: boolean;
  readonly enhancedEngineAvailable: boolean;
}

export interface MotionPolicy {
  readonly scrollMode: ScrollMode;
  readonly revealTravel: number;
  readonly revealBlur: number;
  readonly parallaxEnabled: boolean;
  readonly progressEnabled: boolean;
  readonly continuousMotionEnabled: boolean;
}

export const ScrollResult = {
  ACCEPTED: "accepted",
  TARGET_NOT_FOUND: "target-not-found",
  INVALID_TARGET: "invalid-target",
  CONTROLLER_UNAVAILABLE: "controller-unavailable",
} as const;

export type ScrollResult = (typeof ScrollResult)[keyof typeof ScrollResult];

export type ScrollTarget =
  | { readonly kind: "id"; readonly id: string }
  | { readonly kind: "element"; readonly element: HTMLElement }
  | { readonly kind: "absolute"; readonly y: number }
  | { readonly kind: "selector"; readonly selector: string };

export interface ScrollToOptions {
  readonly offset?: number;
  readonly immediate?: boolean;
  readonly updateHistory?: boolean;
  readonly focusTarget?: boolean;
}

export interface ResolvedScrollToOptions {
  readonly offset: number;
  readonly immediate: boolean;
  readonly updateHistory: boolean;
  readonly focusTarget: boolean;
}

export type ScrollDirection = -1 | 0 | 1;

export interface ScrollSnapshot {
  readonly y: number;
  readonly limit: number;
  readonly progress: number;
  readonly direction: ScrollDirection;
  readonly isScrolling: boolean;
  readonly mode: ScrollMode;
}

export type ScrollSnapshotListener = (snapshot: ScrollSnapshot) => void;
export type Unsubscribe = () => void;

export const ScrollRefreshReason = {
  ROUTE: "route",
  LANGUAGE: "language",
  FONT: "font",
  IMAGE: "image",
  RESIZE: "resize",
  VIEWPORT: "viewport",
  VISIBILITY: "visibility",
  POLICY: "policy",
  CONTENT: "content",
  SUSPENSION: "suspension",
  RESUME: "resume",
  MANUAL: "manual",
} as const;

export type KnownScrollRefreshReason =
  (typeof ScrollRefreshReason)[keyof typeof ScrollRefreshReason];

export type ScrollRefreshReason =
  | KnownScrollRefreshReason
  | `resume:${string}`;

export const SuspensionReason = {
  MOBILE_MENU: "mobile-menu",
} as const;

export type SuspensionReason = string;

export interface SuspensionState {
  readonly reasons: ReadonlySet<SuspensionReason>;
  readonly positionAtFirstSuspend: number | null;
}

export interface AdapterScrollToOptions {
  readonly immediate: boolean;
  readonly onComplete?: () => void;
}

/**
 * Engine-neutral operations required by the runtime. Implementations may use
 * no-ops for frame advancement or lifecycle controls when native scrolling is
 * active.
 */
export interface ScrollAdapter {
  readonly mode: ScrollMode;
  scrollTo(destinationY: number, options: AdapterScrollToOptions): void;
  start(): void;
  stop(): void;
  resize(): void;
  advance?(timestampMs: number, deltaMs: number): void;
  destroy(): void;
}

export type ScrollAdapterFactory = () => ScrollAdapter | null;

export interface ScrollController {
  readonly ready: boolean;
  readonly mode: ScrollMode;
  getSnapshot(): ScrollSnapshot;
  scrollTo(target: ScrollTarget, options?: ScrollToOptions): ScrollResult;
  suspend(reason: SuspensionReason): void;
  resume(reason: SuspensionReason): void;
  requestRefresh(reason: ScrollRefreshReason): void;
  subscribe(listener: ScrollSnapshotListener): Unsubscribe;
  destroy(): void;
}
