/* ------------------------------------------------------------------ */
/*  Motion foundation — Apple "fluid interface" springs                 */
/*                                                                     */
/*  Apple replaced the physics triplet (mass / stiffness / damping)     */
/*  with two designer-facing parameters — DAMPING RATIO (overshoot)     */
/*  and RESPONSE (how quickly it reaches the target, in seconds). This  */
/*  module maps those onto Framer Motion's `bounce` + `duration` spring */
/*  API so motion across the site is one deliberate, defensible system  */
/*  instead of scattered inline tweens.                                 */
/*                                                                     */
/*    • damping 1.0  (no overshoot)   → bounce 0     — graceful default  */
/*    • damping ~0.8 (slight overshoot)→ bounce ~0.2  — momentum feel     */
/*    • response 0.3–0.4s              → duration 0.3–0.4                 */
/*                                                                     */
/*  Rule of thumb (from WWDC "Designing Fluid Interfaces"): critically  */
/*  damped by default; reserve bounce for motion a gesture set going    */
/*  (a flick, a throw, a drag release) — overshoot on something that    */
/*  merely faded in feels wrong.                                        */
/* ------------------------------------------------------------------ */

import type { Transition } from "framer-motion";

/** The site's signature ease — kept for non-spring, non-gesture tweens. */
export const EASE_DEVOTIONAL = [0.22, 1, 0.36, 1] as const;

/**
 * Apple-calibrated spring presets. Use these for anything a user can touch,
 * grab, or that must animate from its current on-screen value.
 *
 * `satisfies` (not `as`) keeps each preset's narrow literal shape so it stays
 * assignable both to the `transition` prop AND to `animate(value, to, options)`,
 * whose options overload rejects the widened `Transition` union.
 */
export const spring = {
  /** Critically damped, no overshoot. The default for UI that just moves. */
  default: { type: "spring", bounce: 0, duration: 0.4 },
  /** Snappier critically damped — small controls, toggles, presses. */
  snappy: { type: "spring", bounce: 0, duration: 0.28 },
  /** Calmer critically damped — larger surfaces, reveals that must not rush. */
  gentle: { type: "spring", bounce: 0, duration: 0.55 },
  /** Slight overshoot — ONLY after a gesture carried momentum (flick/throw). */
  momentum: { type: "spring", bounce: 0.18, duration: 0.4 },
  /** Drawer / sheet arrival — a little life as it settles home. */
  drawer: { type: "spring", bounce: 0.2, duration: 0.34 },
} satisfies Record<string, Transition>;

/**
 * Framer Motion `dragTransition` for a thrown, position:fixed element.
 * `power`/`timeConstant` are the momentum PROJECTION (where the flick is going,
 * like scroll deceleration); `bounceStiffness`/`bounceDamping` are the spring
 * that eases the element back inside its constraints after a rubber-band. The
 * damping is set near-critical so it settles without a distracting wobble.
 */
export const dragInertia = {
  power: 0.26,
  timeConstant: 340,
  bounceStiffness: 320,
  bounceDamping: 38,
  restDelta: 0.5,
} as const;

/** Reduced-motion drag: no throw, no rubber-band — the element just stops. */
export const dragInertiaReduced = {
  power: 0,
  timeConstant: 200,
  bounceStiffness: 1000,
  bounceDamping: 100,
} as const;

/** How far past a boundary a drag may stretch before resisting (rubber-band). */
export const DRAG_ELASTIC = 0.16;

/**
 * Apple's momentum-projection function (from the "Designing Fluid Interfaces"
 * sample code) — the resting point a flick would coast to. Use it when you
 * must choose a snap target from a throw rather than from the release point.
 * NOTE the exponential-decay form; the physics-textbook v²/(2·decel) is *not*
 * what Apple ships.
 */
export function projectMomentum(
  velocity: number,
  decelerationRate = 0.998,
): number {
  return (velocity / 1000) * (decelerationRate / (1 - decelerationRate));
}
