/**
 * Fast, fluid smooth scrolling helper.
 * Animates scroll Y using high-performance RAF and devotional power-ease curve.
 */
export function animateScrollTo(
  targetY: number,
  durationMs = 450,
  onComplete?: () => void,
): void {
  if (typeof window === "undefined") return;

  const startY = window.scrollY;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) {
    window.scrollTo(0, targetY);
    onComplete?.();
    return;
  }

  // Adjust duration based on distance: short hops ~300ms, long hops ~520ms max
  const duration = Math.min(520, Math.max(300, Math.abs(distance) * 0.22));
  const startTime = performance.now();

  // Devotional Lotus ease curve: cubic-bezier(0.22, 1, 0.36, 1) approximation
  const easeOutDevotional = (t: number): number => {
    return 1 - Math.pow(1 - t, 3.5);
  };

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    const easedProgress = easeOutDevotional(progress);

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      window.scrollTo(0, targetY);
      onComplete?.();
    }
  };

  requestAnimationFrame(step);
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
    // Layout-settle re-check in case dynamic content/fonts loaded during motion
    const finalTop = el.getBoundingClientRect().top;
    if (Math.abs(finalTop + offset) > 6) {
      const adjustedY = Math.max(0, finalTop + window.scrollY + offset);
      window.scrollTo({ top: adjustedY, behavior: "smooth" });
    }
    onComplete?.();
  });

  return true;
}
