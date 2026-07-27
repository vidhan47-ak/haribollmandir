import type { MotionCapabilities, MotionPolicy } from "./types";
import { ScrollMode } from "./types";
import { isFiniteNumber } from "./calculations";

export const DESKTOP_SCROLL_MIN_WIDTH = 768;

const REDUCED_MOTION_POLICY: MotionPolicy = Object.freeze({
  scrollMode: ScrollMode.NATIVE,
  revealTravel: 0,
  revealBlur: 0,
  parallaxEnabled: false,
  progressEnabled: false,
  continuousMotionEnabled: false,
});

const MOBILE_NATIVE_POLICY: MotionPolicy = Object.freeze({
  scrollMode: ScrollMode.NATIVE,
  revealTravel: 10,
  revealBlur: 0,
  parallaxEnabled: false,
  progressEnabled: false,
  continuousMotionEnabled: true,
});

const DESKTOP_NATIVE_POLICY: MotionPolicy = Object.freeze({
  scrollMode: ScrollMode.NATIVE,
  revealTravel: 18,
  revealBlur: 4,
  parallaxEnabled: true,
  progressEnabled: true,
  continuousMotionEnabled: true,
});

const DESKTOP_ENHANCED_POLICY: MotionPolicy = Object.freeze({
  ...DESKTOP_NATIVE_POLICY,
  scrollMode: ScrollMode.ENHANCED,
});

/**
 * Selects feature capabilities without consulting browser globals. Invalid
 * viewport measurements use the conservative mobile/native policy.
 */
export function selectMotionPolicy(
  capabilities: MotionCapabilities,
): MotionPolicy {
  if (capabilities.reducedMotion) {
    return REDUCED_MOTION_POLICY;
  }

  const hasDesktopViewport =
    isFiniteNumber(capabilities.viewportWidth) &&
    capabilities.viewportWidth >= DESKTOP_SCROLL_MIN_WIDTH;

  if (capabilities.coarsePointer || !hasDesktopViewport) {
    return MOBILE_NATIVE_POLICY;
  }

  if (
    capabilities.finePointer &&
    capabilities.enhancedEngineAvailable
  ) {
    return DESKTOP_ENHANCED_POLICY;
  }

  return DESKTOP_NATIVE_POLICY;
}
