import type {
  SuspensionReason,
  SuspensionState,
} from "./types";
import { isFiniteNumber } from "./calculations";

export function createSuspensionState(): SuspensionState {
  return {
    reasons: new Set<SuspensionReason>(),
    positionAtFirstSuspend: null,
  };
}

export function normalizeSuspensionReason(
  reason: unknown,
): SuspensionReason | null {
  if (typeof reason !== "string") {
    return null;
  }

  const normalized = reason.trim();
  return normalized.length > 0 ? normalized : null;
}

export function isSuspended(state: SuspensionState): boolean {
  return state.reasons.size > 0;
}

export function hasSuspensionReason(
  state: SuspensionState,
  reason: unknown,
): boolean {
  const normalized = normalizeSuspensionReason(reason);
  return normalized !== null && state.reasons.has(normalized);
}

/**
 * Adds one distinct reason. Repeating a reason returns the original state and
 * cannot replace the position captured by the first suspension.
 */
export function addSuspensionReason(
  state: SuspensionState,
  reason: unknown,
  currentScrollY: unknown,
): SuspensionState {
  const normalized = normalizeSuspensionReason(reason);
  if (normalized === null || state.reasons.has(normalized)) {
    return state;
  }

  const wasSuspended = isSuspended(state);
  const reasons = new Set(state.reasons);
  reasons.add(normalized);

  return {
    reasons,
    positionAtFirstSuspend: wasSuspended
      ? state.positionAtFirstSuspend
      : isFiniteNumber(currentScrollY)
        ? currentScrollY
        : null,
  };
}

/** Removes one reason while preserving suspension until the final reason exits. */
export function removeSuspensionReason(
  state: SuspensionState,
  reason: unknown,
): SuspensionState {
  const normalized = normalizeSuspensionReason(reason);
  if (normalized === null || !state.reasons.has(normalized)) {
    return state;
  }

  const reasons = new Set(state.reasons);
  reasons.delete(normalized);

  return {
    reasons,
    positionAtFirstSuspend:
      reasons.size === 0 ? null : state.positionAtFirstSuspend,
  };
}
