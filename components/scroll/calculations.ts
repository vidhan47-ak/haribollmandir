import type {
  ResolvedScrollToOptions,
  ScrollToOptions,
} from "./types";

export const DEFAULT_SCROLL_OFFSET = -84;

export interface ScrollDestinationInput {
  readonly targetTop: number;
  readonly currentScrollY: number;
  readonly offset: number;
  readonly scrollLimit: number;
}

export interface ResolvedScrollDestination {
  readonly destinationY: number;
  readonly requestedY: number;
  readonly scrollLimit: number;
  readonly boundaryClamped: boolean;
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Returns a non-negative limit, or null when no safe limit can be formed. */
export function normalizeScrollLimit(limit: unknown): number | null {
  if (!isFiniteNumber(limit)) {
    return null;
  }

  return Math.max(0, limit);
}

export function resolveScrollToOptions(
  options?: ScrollToOptions | null,
): ResolvedScrollToOptions | null {
  const offset =
    options?.offset === undefined ? DEFAULT_SCROLL_OFFSET : options.offset;

  if (!isFiniteNumber(offset)) {
    return null;
  }

  return {
    offset,
    immediate: options?.immediate === true,
    updateHistory: options?.updateHistory === true,
    focusTarget: options?.focusTarget === true,
  };
}

/**
 * Applies targetTop + currentScrollY + offset and clamps it to the canonical
 * document range. A null result means a browser scroll command must not run.
 */
export function resolveScrollDestination(
  input: ScrollDestinationInput,
): ResolvedScrollDestination | null {
  if (
    !isFiniteNumber(input.targetTop) ||
    !isFiniteNumber(input.currentScrollY) ||
    !isFiniteNumber(input.offset)
  ) {
    return null;
  }

  const scrollLimit = normalizeScrollLimit(input.scrollLimit);
  if (scrollLimit === null) {
    return null;
  }

  const requestedY =
    input.targetTop + input.currentScrollY + input.offset;

  if (!isFiniteNumber(requestedY)) {
    return null;
  }

  const destinationY = Math.min(scrollLimit, Math.max(0, requestedY));

  return {
    destinationY,
    requestedY,
    scrollLimit,
    boundaryClamped: destinationY !== requestedY,
  };
}

export function calculateScrollDestination(
  targetTop: number,
  currentScrollY: number,
  offset: number,
  scrollLimit: number,
): number | null {
  return (
    resolveScrollDestination({
      targetTop,
      currentScrollY,
      offset,
      scrollLimit,
    })?.destinationY ?? null
  );
}

/**
 * Decodes only a local URL fragment. Callers can pass the returned value to
 * getElementById; this helper never interprets the fragment as a selector.
 */
export function decodeLocalHashToId(hash: unknown): string | null {
  if (typeof hash !== "string" || hash.length <= 1 || hash[0] !== "#") {
    return null;
  }

  try {
    const id = decodeURIComponent(hash.slice(1));
    return id.length > 0 && !id.includes("\0") ? id : null;
  } catch {
    return null;
  }
}

/** Normalizes invalid inputs and non-positive limits to zero. */
export function normalizeProgress(y: number, limit: number): number {
  if (!isFiniteNumber(y) || !isFiniteNumber(limit) || limit <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, y / limit));
}
