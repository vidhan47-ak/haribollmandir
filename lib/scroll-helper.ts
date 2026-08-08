/**
 * Fast, accurate smooth scroll helper for page sections.
 * Calculates exact top position relative to document viewport + scrollY and clearance offset.
 */

export function scrollToSection(targetId: string, offset = -80): boolean {
  if (typeof window === "undefined") return false;

  const id = targetId.replace(/^#/, "");
  const el = document.getElementById(id);
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const targetY = Math.max(0, rect.top + window.scrollY + offset);

  window.scrollTo({
    top: targetY,
    behavior: "smooth",
  });

  return true;
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

export function scrollToElement(
  elementOrId: HTMLElement | string,
  offset = -80,
  onComplete?: () => void,
): boolean {
  if (typeof window === "undefined") return false;

  const id = typeof elementOrId === "string" ? elementOrId : elementOrId.id;
  const ok = scrollToSection(id, offset);
  if (ok && onComplete) {
    window.setTimeout(onComplete, 450);
  }
  return ok;
}
