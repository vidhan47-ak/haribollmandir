/**
 * Fast, fluid smooth scrolling helper.
 * Uses browser-native smooth scroll to avoid conflicts with CSS scroll-behavior.
 */
export function animateScrollTo(
  targetY: number,
  durationMs = 450,
  onComplete?: () => void,
): void {
  if (typeof window === "undefined") return;

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: "smooth",
  });

  if (onComplete) {
    window.setTimeout(onComplete, Math.min(600, durationMs));
  }
}

/**
 * Calculates absolute Y position of an element and scrolls smoothly to it
 * with top clearance for the fixed navbar.
 */
export function scrollToElement(
  elementOrId: HTMLElement | string,
  offset = -80,
  onComplete?: () => void,
): boolean {
  if (typeof window === "undefined") return false;

  const el =
    typeof elementOrId === "string"
      ? document.getElementById(elementOrId.replace(/^#/, ""))
      : elementOrId;

  if (!el) return false;

  const rectTop = el.getBoundingClientRect().top;
  const targetY = Math.max(0, rectTop + window.scrollY + offset);

  animateScrollTo(targetY, 450, () => {
    // Layout-settle re-check in case dynamic content/images shift position
    const finalTop = el.getBoundingClientRect().top;
    if (Math.abs(finalTop + offset) > 8) {
      const adjustedY = Math.max(0, finalTop + window.scrollY + offset);
      window.scrollTo({ top: adjustedY, behavior: "smooth" });
    }
    onComplete?.();
  });

  return true;
}
