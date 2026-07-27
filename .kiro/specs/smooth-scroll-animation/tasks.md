# Implementation Plan: Smooth Scroll Animation

## Overview

Implement the feature in TypeScript through the existing `SmoothScroll` and `useSmoothScrollTo` boundary. Keep the current checkout native-first because no enhanced scroll engine is installed; provide an injectable Lenis-compatible adapter seam without adding a dependency. The DAG separates core/runtime work from three conflict-free integration lanes so navigation, visual motion, and the Sacred Thread can proceed in parallel after the controller is ready.

## DAG Execution Notes

- A task may start when every predecessor in the leaf dependency map is complete.
- Optional test subtasks marked `*` do not block dependent implementation tasks.
- Do not add packages, create a second provider, transform the document root, or modify translation data.

| Leaf task | Depends on |
|---|---|
| 1.1 | None |
| 1.2-1.6 | 1.1 |
| 2.1 | 1.1 |
| 2.2 | 2.1 |
| 2.3-2.9 | 2.2 |
| 3.1, 3.2, 4.1, 4.2, 5.1 | 2.2 |
| 3.3 | 3.2 |
| 3.4 | 3.1, 3.2 |
| 4.3 | 4.1 |
| 4.4 | 4.1, 4.2 |
| 5.2 | 5.1 |
| 6 | 3.1, 3.2, 4.1, 4.2, 5.1 |

Tasks 3, 4, and 5 are the parallel fan-out. Their implementation leaves own different files, and Task 6 is the join point.

## Tasks

- [x] 1. Implement pure scroll policy and calculation primitives
  - **Depends on:** None
  - [x] 1.1 Create the TypeScript scroll core
    - Add engine-neutral types for motion capabilities/policy, controller results/options/snapshots, adapters, refresh reasons, and suspension state under `components/scroll/`.
    - Implement pure policy selection with reduced-motion precedence, the 768px/coarse-pointer native-mode rules, finite-number validation, destination clamping, safe local hash-to-ID decoding, normalized progress, and distinct-reason suspension semantics.
    - Keep engine package names and concrete types outside the public contracts.
    - _Requirements: 1.1-1.5, 1.7, 2.3-2.4, 3.1-3.2, 3.6-3.7, 5.3-5.5, 7.2, 7.4-7.5, 11.3, 12.3-12.8_
  - [ ]* 1.2 Write the property test for reduced-motion dominance
    - **Property 1: Reduced-motion dominance**
    - Generate capability combinations and verify reduced motion always selects the fully native, zero-travel, zero-blur, no-parallax, no-progress policy.
    - **Validates: Requirements 1.1, 1.7, 3.4, 4.4, 5.1, 9.1**
  - [ ]* 1.3 Write the property test for mobile native-scroll preservation
    - **Property 2: Mobile native-scroll preservation**
    - Generate pointer, width, and engine-availability combinations and verify coarse pointers or widths below 768px never select enhanced scrolling.
    - **Validates: Requirements 1.2, 1.3, 4.6**
  - [ ]* 1.4 Write the property test for target accuracy and boundedness
    - **Property 3: Target accuracy and boundedness**
    - Generate finite target positions, offsets, and limits and verify the destination is exactly clamped to the document range.
    - **Validates: Requirements 3.1, 3.3**
  - [ ]* 1.5 Write the property test for invalid-target non-interference
    - **Property 4: Invalid-target non-interference**
    - Generate malformed, missing, and non-finite targets and verify rejection leaves scroll, focus, history, and suspension state unchanged.
    - **Validates: Requirements 3.6, 3.7, 11.3**
  - [ ]* 1.6 Write the property test for progress boundedness and monotonicity
    - **Property 5: Progress boundedness and monotonicity**
    - Generate finite positions and limits, including non-positive limits, and verify bounded, finite, directionally monotonic progress.
    - **Validates: Requirements 5.3, 5.4, 5.5**

- [x] 2. Build the native-first Scroll Runtime and controller provider
  - **Depends on:** 1.1
  - [x] 2.1 Replace the `SmoothScroll` stub with the controller boundary
    - Implement the controller context, native adapter, optional injected enhanced-adapter factory, backward-compatible `useSmoothScrollTo`, controller access hook, and MotionValue publication bridge in `components/SmoothScroll.tsx` and focused modules under `components/scroll/`.
    - Keep `window`/document canonical, issue immediate native movement for reduced motion or explicit immediate requests, preserve the `-84px` default, support post-settle focus without a second jump, and return typed non-success results instead of throwing.
    - Publish continuous snapshots at most once per animation frame without per-frame React state updates.
    - _Requirements: 2.1-2.5, 3.1-3.4, 3.6, 5.6, 9.1, 9.6, 10.1-10.5, 12.1-12.8_
  - [x] 2.2 Add policy migration, lifecycle cleanup, refresh coalescing, and fallback recovery
    - Subscribe to reduced-motion, pointer, viewport, route, language, visibility, font, image, and available observation signals; coalesce refresh requests and preserve/clamp the canonical position.
    - Create an enhanced RAF only when an injected adapter is available and policy permits; cap/reset frame timing after hidden tabs or stalls, and pause while hidden or suspended.
    - Make mode changes and Strict Mode cleanup atomic and idempotent, including partial-adapter failure, observers/listeners, subscriptions, pending refreshes, RAF work, suspension state, and document-style restoration.
    - Fall back to native behavior when optional observers or the enhanced adapter are unavailable; emit content-free diagnostics only in development.
    - _Requirements: 1.4-1.6, 2.5-2.9, 7.2-7.5, 8.1-8.3, 8.6-8.7, 9.5, 10.1-10.2, 10.5, 11.1-11.6, 12.4-12.8_
  - [ ]* 2.3 Write the property test for single-frame-loop ownership
    - **Property 6: Single-frame-loop ownership**
    - Generate mount, policy-change, visibility, and destroy sequences against fake adapters and verify one owned RAF at most while mounted and zero after destruction.
    - **Validates: Requirements 2.5, 2.7**
  - [ ]* 2.4 Write the property test for cleanup idempotence
    - **Property 7: Cleanup idempotence**
    - Generate repeated cleanup/remount sequences and injected partial initialization failures; verify every owned resource reaches the same clean final state without throwing.
    - **Validates: Requirements 2.7, 2.8, 2.9, 11.1**
  - [ ]* 2.5 Write the property test for suspension safety
    - **Property 8: Suspension safety**
    - Generate suspend/resume reason sequences plus visibility and destruction changes; verify the adapter runs exactly when the reason set is empty, the document is visible, and the runtime is live.
    - **Validates: Requirements 2.6, 7.1-7.5, 11.4**
  - [ ]* 2.6 Write the property test for language-layout stability
    - **Property 9: Language-layout stability**
    - Generate old positions, new English/Hindi layout limits, and batched refresh requests; verify one measurement pass preserves the old position within tolerance or clamps to the new limit without replaying reveals.
    - **Validates: Requirements 1.6, 7.3, 8.1, 8.2, 8.3, 8.6, 8.7**
  - [ ]* 2.7 Write the property test for root geometry preservation
    - **Property 12: Root geometry preservation**
    - Exercise every runtime mode and lifecycle transition and verify no scrolling transform is applied to `html`, `body`, or the application root and no new positioning ancestor is introduced.
    - **Validates: Requirements 2.1, 2.2, 6.4-6.9**
  - [ ]* 2.8 Write the property test for render-independent continuous publication
    - **Property 13: No per-frame React render requirement**
    - Generate scroll snapshots and verify MotionValues/subscribers receive at most one coalesced update per frame without driving React state for each frame.
    - **Validates: Requirements 5.6, 10.1, 10.2**
  - [ ]* 2.9 Write the property test for native fallback availability
    - **Property 14: Fallback availability**
    - Generate absent, unsupported, and throwing enhanced-adapter factories and unavailable observer APIs; verify native input and programmatic scrolling remain available.
    - **Validates: Requirements 1.5, 9.5, 11.1, 11.2, 12.4, 12.8**

- [x] 3. Integrate safe route navigation and mobile-menu suspension
  - **Depends on:** 2.2
  - [x] 3.1 Replace timer/selector-based hash scrolling with controller readiness
    - Update `components/ui/HashScroll.tsx` to decode local IDs defensively, wait for the homepage target and controller readiness, request a coalesced refresh, and apply the fixed-navbar offset without arbitrary selector evaluation.
    - Preserve browser back/forward and hash semantics; missing or malformed hashes must leave position, focus, history, and lock state unchanged.
    - Keep existing Hero/Footer consumers on the backward-compatible hook unless a typed result is needed for explicit fallback handling.
    - _Requirements: 3.2, 3.5-3.9, 9.6, 9.8, 11.3_
  - [x] 3.2 Connect the existing Navbar menu lock to named suspension
    - Update `components/Navbar.tsx` so `mobile-menu` suspension and the existing body overflow lock are acquired/released together, including close-before-navigation and unmount cleanup.
    - Preserve the homepage `scrollY > 56` material threshold, section background detection, active-link observer, non-home glass presentation, focus indicators, and current DOM order.
    - _Requirements: 6.1-6.3, 7.1-7.6, 9.2, 9.8_
  - [ ]* 3.3 Write the property test for route and navbar invariance
    - **Property 10: Route and navbar invariance**
    - Generate home/non-home pathname and scroll/section states and verify only the homepage hero top can be bar-less while the existing threshold and section rules remain authoritative.
    - **Validates: Requirements 5.8, 6.1, 6.2, 6.3**
  - [ ]* 3.4 Write focused automated navigation and menu integration tests
    - Cover same-route targets, heritage-to-home hashes, malformed/missing hashes, browser history restoration, immediate reduced-motion navigation, named lock cleanup, multiple suspension reasons, and focus without a second jump.
    - Use existing project tooling only; do not add a test dependency.
    - _Requirements: 3.1-3.9, 7.1-7.6, 9.1, 9.6, 9.8_

- [x] 4. Apply bounded Lotus Breath and background-only parallax policy
  - **Depends on:** 2.2
  - [x] 4.1 Update reveal primitives to the approved motion tokens
    - Modify `components/ui/Reveal.tsx` and the Hero's equivalent entrance variants so desktop motion stays within 18px/4px blur and 720-920ms, mobile motion stays within 10px/no blur/600ms, and stagger gaps do not exceed 70ms.
    - Render final visible content immediately for reduced motion and preserve semantic wrappers, DOM/accessibility order, focus styles, and once-only completion across remeasurement.
    - _Requirements: 1.1, 4.1-4.4, 4.9-4.10, 8.4-8.5, 8.7, 9.2, 9.4-9.5, 9.8_
  - [ ] 4.2 Enforce policy-aware decorative parallax and CSS fallbacks
    - Update `components/ui/ParallaxScene.tsx` and `app/globals.css` so only decorative/background artwork receives bounded compositor transforms, with maximum 36px default/42px hero and zero amplitude for reduced motion, coarse pointers, or widths below 768px.
    - Override feature-controlled smooth CSS behavior under reduced motion, avoid continuous layout/backdrop-filter animation, and limit `will-change` to policy-enabled animated artwork.
    - Preserve section photography, sticky Gallery geometry, Tulsi cursor independence, fixed controls, SacredParticles cadence, and native mobile horizontal scrolling.
    - _Requirements: 4.5-4.10, 6.4-6.9, 9.1-9.5, 9.7, 10.3-10.10_
  - [ ]* 4.3 Write the property test for reduced-motion content visibility
    - **Property 11: Content visibility invariant**
    - Generate reveal props and reduced-motion states and verify every revealable element starts in its final visible state without waiting for intersection.
    - **Validates: Requirements 1.1, 4.4, 9.5**
  - [ ]* 4.4 Write focused motion-token and parallax tests
    - Verify desktop/mobile token bounds, 70ms maximum stagger, decorative-only transforms, zero disabled amplitude, once-only reveal completion, and absence of transformed root/fixed/sticky ancestors.
    - Use existing project tooling only; do not add a test dependency.
    - _Requirements: 4.1-4.10, 6.4-6.9, 8.5, 8.7, 9.2-9.8, 10.3-10.10_

- [x] 5. Add and wire the homepage Sacred Thread
  - **Depends on:** 2.2
  - [x] 5.1 Implement the imperative decorative progress component
    - Create `components/ui/SacredScrollProgress.tsx` using the controller's normalized progress MotionValue, one 1px gold transform layer, `aria-hidden`, and `pointer-events: none`.
    - Render exactly one instance from `app/layout.tsx`; make the component self-disable off `/`, below 768px, and under reduced motion without affecting navbar state or Gallery-local progress.
    - Keep updates outside React state, avoid layout shifts and permanent layer growth, and retain the existing placement of the Tulsi cursor and fixed controls.
    - _Requirements: 5.1-5.8, 6.4-6.9, 9.3, 10.1-10.4, 10.6-10.10_
  - [ ]* 5.2 Write focused Sacred Thread component tests
    - Verify route/viewport/reduced-motion gating, one-instance rendering, gold 1px presentation, accessibility/pointer exclusion, zero-limit behavior, and MotionValue-driven updates that do not alter navbar or Gallery state.
    - Use existing project tooling only; do not add a test dependency.
    - _Requirements: 5.1-5.8, 9.3, 10.1-10.2_

- [x] 6. Final checkpoint - Ensure all selected automated checks pass
  - **Depends on:** 3.1, 3.2, 4.1, 4.2, 5.1
  - Ensure all selected tests and static checks pass, verify no dependency was added, and ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test work and can be skipped for a faster implementation.
- Each correctness property from the design has one dedicated property-test subtask.
- The current repository has no Lenis dependency; Native Mode is the deliverable runtime unless an approved adapter is already present when implementation begins.
- Tasks 3, 4, and 5 form the parallel DAG fan-out after Task 2; Task 6 is the join point.
