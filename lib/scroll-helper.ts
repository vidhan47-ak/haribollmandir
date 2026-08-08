/**
 * Fast, fluid smooth scrolling helper.
 * Uses exact static offsetTop calculation to bypass CSS transforms and parallax shifts.
 */

export function getElementOffsetTop(el: HTMLElement): number {
  let top = 0;
  let current: HTMLElement | null = el;
  while (current) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}

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
 * Calculates absolute static Y position of an element and scrolls smoothly to it
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

  const targetY = Math.max(0, getElementOffsetTop(el) + offset);

  animateScrollTo(targetY, 450, onComplete);

  return true;
}
