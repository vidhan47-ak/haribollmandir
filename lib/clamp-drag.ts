/**
 * Keeps a transform-dragged, position:fixed element fully inside the viewport.
 *
 * The element carries a translate offset (x, y) on top of its natural CSS
 * position. Given a *candidate* next offset, we work out how far the element
 * would have to shift for its bounding box to sit flush against each viewport
 * edge, then clamp the candidate into that range. An 8px inset keeps a small
 * breathing gap so the element never kisses the very edge.
 */
export type DragOffset = { x: number; y: number };

const EDGE_INSET = 8;

export function clampToViewport(
  el: HTMLElement | null,
  nextX: number,
  nextY: number,
  currentX = 0,
  currentY = 0,
): DragOffset {
  if (!el || typeof window === "undefined") {
    return { x: nextX, y: nextY };
  }

  const rect = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // The element's natural (untransformed) top-left = current rect minus the
  // offset it is already carrying. Bounds are expressed as deltas from there.
  const baseLeft = rect.left - currentX;
  const baseTop = rect.top - currentY;

  const minX = EDGE_INSET - baseLeft;
  const maxX = vw - EDGE_INSET - rect.width - baseLeft;
  const minY = EDGE_INSET - baseTop;
  const maxY = vh - EDGE_INSET - rect.height - baseTop;

  // If the element is wider/taller than the viewport, keep min ≤ max.
  const clamp = (v: number, lo: number, hi: number) =>
    hi < lo ? lo : Math.min(Math.max(v, lo), hi);

  return {
    x: clamp(nextX, minX, maxX),
    y: clamp(nextY, minY, maxY),
  };
}
