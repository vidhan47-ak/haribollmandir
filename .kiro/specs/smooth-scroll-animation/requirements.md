# Requirements Document: Smooth Scroll Animation

## Introduction

This specification defines a restrained smooth-scroll experience for the premium devotional Next.js site. The selected direction combines moderate desktop scroll smoothing (**Temple Glide**), small one-shot viewport reveals (**Lotus Breath**), and a decorative homepage desktop progress accent (**Sacred Thread**). It preserves user-controlled reading, bilingual content, native mobile inertia, route-aware navigation, section photography, the custom Tulsi cursor, and the existing Framer Motion integration.

The implementation must remain usable when an enhanced scroll engine is absent or fails. The document remains the canonical scroll container, and reduced-motion preferences override every enhancement.

## Glossary

- **Scroll Runtime**: The implementation behind the existing `SmoothScroll` provider that selects and manages enhanced or native scrolling.
- **Scroll Controller**: The engine-agnostic interface used by `useSmoothScrollTo` and integration components.
- **Enhanced Mode**: Moderate fine-pointer wheel/trackpad smoothing through the existing Lenis-compatible adapter boundary.
- **Native Mode**: Browser-managed scrolling with no custom continuous-scroll engine.
- **Motion Policy**: The decision derived from reduced-motion preference, pointer capability, viewport width, document visibility, and engine availability.
- **Lotus Breath**: Restrained, once-only opacity and small vertical-travel reveals implemented through Framer Motion.
- **Sacred Thread**: A 1px decorative gold page-progress accent shown only where policy permits.
- **Layout Refresh**: A coalesced remeasurement after route, language, font, image, viewport, or lock-state changes.
- **Reduced Motion**: The active `prefers-reduced-motion: reduce` user preference.
- **Coarse Pointer**: A primary pointing device reported by `(pointer: coarse)`, typically touch.
- **Fine Pointer**: A primary pointing device reported by `(pointer: fine)`, typically mouse or trackpad.
- **Scroll Limit**: `max(0, document.scrollHeight - viewportHeight)`.

## Requirements

### Requirement 1: Adaptive Motion Policy

**User Story:** As a visitor, I want scrolling to match my device and motion preferences so that the experience feels polished without becoming uncomfortable or interfering with native controls.

#### Acceptance Criteria

1. WHEN Reduced Motion is active, THE Scroll Runtime SHALL select Native Mode, SHALL NOT create an enhanced-scroll animation-frame loop, SHALL set reveal travel and blur to zero, SHALL disable parallax, and SHALL hide the Sacred Thread.
2. WHEN the primary pointer is coarse, THE Scroll Runtime SHALL select Native Mode and SHALL preserve browser-native touch inertia and overscroll behavior.
3. WHEN the viewport width is less than 768 CSS pixels, THE Scroll Runtime SHALL select Native Mode regardless of enhanced-engine availability.
4. WHEN Reduced Motion is inactive, the viewport is at least 768 CSS pixels wide, the primary pointer is fine, and an enhanced engine is available, THE Scroll Runtime SHALL select Enhanced Mode.
5. IF an enhanced engine is absent, unsupported, or fails to initialize, THEN THE Scroll Runtime SHALL select Native Mode without preventing wheel, touch, keyboard, scrollbar, or programmatic target scrolling.
6. WHEN a relevant media query or viewport policy changes while mounted, THE Scroll Runtime SHALL re-evaluate the Motion Policy, preserve the current scroll position within 2 CSS pixels unless clamped by a new Scroll Limit, and SHALL NOT replay completed reveals.
7. THE Motion Policy SHALL give Reduced Motion precedence over every other capability or configuration flag.

### Requirement 2: Scroll Architecture and Lifecycle

**User Story:** As a maintainer, I want one engine-agnostic scroll boundary so that visual components remain decoupled, cleanup is reliable, and existing page geometry continues to work.

#### Acceptance Criteria

1. THE Scroll Runtime SHALL preserve `window` and the document as the canonical scroll container.
2. THE Scroll Runtime SHALL NOT apply a scrolling transform to `html`, `body`, or the application root.
3. THE Scroll Runtime SHALL expose engine-independent scroll, suspend, resume, refresh, subscribe, and destroy operations through the Scroll Controller.
4. THE `useSmoothScrollTo` hook SHALL access the Scroll Controller without importing or exposing engine-specific types.
5. WHILE Enhanced Mode is active, THE Scroll Runtime SHALL own no more than one active animation-frame callback per mounted runtime instance.
6. WHEN the document becomes hidden, THE Scroll Runtime SHALL stop advancing enhanced scrolling and SHALL discard accumulated frame time before resuming.
7. WHEN the runtime unmounts or changes mode, THE Scroll Runtime SHALL cancel its animation frame, remove all owned event listeners and observers, unsubscribe all callbacks, destroy the active adapter, clear pending refresh work, and restore native document styles.
8. WHEN destruction is requested more than once, THE Scroll Runtime SHALL produce the same cleaned final state without throwing.
9. THE Scroll Runtime SHALL remain safe under React development Strict Mode mount, cleanup, and remount cycles.

### Requirement 3: Programmatic and Route-Aware Navigation

**User Story:** As a visitor, I want navbar, hero, footer, and direct-link navigation to land predictably at the intended section on every route.

#### Acceptance Criteria

1. WHEN a valid same-route target is requested, THE Scroll Controller SHALL calculate the destination as `clamp(targetTop + currentScrollY + offset, 0, ScrollLimit)`.
2. THE default fixed-navbar offset for existing homepage section navigation SHALL remain `-84` CSS pixels.
3. WHEN accepted target movement settles and the destination is not boundary-clamped, THE target SHALL be positioned within 2 CSS pixels of the requested offset.
4. WHEN Reduced Motion is active or an immediate request is made, THE Scroll Controller SHALL use immediate native target movement rather than animated movement.
5. WHEN a homepage section is requested from another route, THE route integration SHALL navigate to `/#target`, wait until the homepage target and Scroll Controller are ready, refresh layout measurements, and then apply the fixed-navbar offset.
6. WHEN a hash target is malformed or missing, THE Scroll Controller SHALL return a non-success result and SHALL NOT change scroll position, focus, browser history, or suspension state.
7. THE target resolver SHALL resolve URL hashes defensively by local element ID and SHALL NOT evaluate arbitrary selector text from untrusted URL input.
8. WHEN browser back or forward navigation restores a route or hash, THE feature SHALL preserve browser history semantics and SHALL NOT force the page to the top.
9. WHEN keyboard Home, End, PageUp, PageDown, Space, arrow keys, scrollbar dragging, text selection, or find-in-page is used, THE feature SHALL preserve the browser's corresponding navigation behavior.

### Requirement 4: Restrained Visual Motion

**User Story:** As a visitor, I want refined motion that supports the devotional visual hierarchy without distracting from sacred imagery or text.

#### Acceptance Criteria

1. WHEN a desktop Lotus Breath reveal runs, THE revealed element SHALL use opacity plus no more than 18 CSS pixels of vertical travel, an optional blur no greater than 4 CSS pixels, a duration between 720 and 920 milliseconds, and easing equivalent to cubic-bezier `(0.22, 1, 0.36, 1)`.
2. WHEN a mobile Lotus Breath reveal runs, THE revealed element SHALL use no more than 10 CSS pixels of vertical travel, SHALL use no blur, and SHALL complete within 600 milliseconds.
3. WHEN a staggered reveal runs, THE delay between adjacent items SHALL be no more than 70 milliseconds, and each item SHALL remain in document and accessibility order.
4. WHEN Reduced Motion is active, EVERY revealable element SHALL render immediately in its final visible state without waiting for viewport intersection.
5. THE default section-photography parallax amplitude SHALL NOT exceed 36 CSS pixels, and the hero amplitude SHALL NOT exceed 42 CSS pixels.
6. WHEN the primary pointer is coarse, the viewport is below 768 CSS pixels, or Reduced Motion is active, THE section-photography parallax amplitude SHALL be zero.
7. THE feature SHALL apply continuous parallax only to decorative or background artwork and SHALL NOT continuously transform text, interactive controls, complete sections, or the application root.
8. THE feature SHALL NOT introduce full-page snapping, mandatory section pinning, forced horizontal page travel, scroll-direction reversal, infinite scroll, or wheel-distance amplification.
9. THE feature SHALL preserve the existing selected image-veil behavior as a once-only opt-in accent and SHALL NOT apply a veil to every section.
10. THE feature SHALL use Framer Motion as the visual interpolation layer and SHALL NOT create a second competing visual-animation framework.

### Requirement 5: Sacred Thread Progress Accent

**User Story:** As a desktop visitor, I want a subtle sense of page progress that complements the gold visual language without covering content or becoming a required navigation aid.

#### Acceptance Criteria

1. WHEN the homepage is displayed, Reduced Motion is inactive, and the viewport is at least 768 CSS pixels wide, THE feature SHALL render one Sacred Thread progress accent.
2. THE Sacred Thread SHALL be no thicker than 1 CSS pixel, SHALL use the existing gold palette, SHALL ignore pointer input, and SHALL be hidden from the accessibility tree.
3. THE Sacred Thread scale SHALL equal normalized document progress clamped to the closed interval `[0, 1]`.
4. FOR a fixed positive Scroll Limit, WHEN scroll position increases, THE Sacred Thread progress SHALL be monotonic non-decreasing; WHEN scroll position decreases, it SHALL be monotonic non-increasing.
5. WHEN the Scroll Limit is zero or negative, THE Sacred Thread progress SHALL equal zero.
6. THE Sacred Thread SHALL update through a MotionValue or equivalent imperative value and SHALL NOT require a React state update for each scroll frame.
7. THE Sacred Thread SHALL NOT replace the existing Gallery-local progress indicator or communicate information unavailable elsewhere.
8. WHEN the pathname is not `/`, THE Sacred Thread SHALL not alter the route-specific navbar material or active-link state.

### Requirement 6: Existing Component Compatibility

**User Story:** As a site owner, I want the new motion to preserve the current navigation, cursor, gallery, imagery, and fixed controls.

#### Acceptance Criteria

1. THE feature SHALL preserve the homepage navbar rule that the bar-less state appears only at the top of the hero and that the glass state begins after the existing scroll threshold.
2. THE feature SHALL preserve the solid/glass navbar presentation on non-home routes.
3. THE feature SHALL preserve the existing home section background detection and active-link IntersectionObserver behavior.
4. THE feature SHALL preserve the existing sticky Gallery layout, Gallery-local scroll progress, desktop scroll-driven selection, and mobile horizontal thumbnail scrolling.
5. THE feature SHALL preserve the custom Tulsi cursor as an independent fixed, pointer-driven layer and SHALL NOT add it to the scroll animation-frame loop.
6. THE feature SHALL preserve section background photography, crop rules, overlays, and semantic image alternatives.
7. THE feature SHALL preserve existing fixed controls, including ambient audio and live-darshan UI, without changing their position during scroll.
8. THE feature SHALL preserve the existing capped SacredParticles cadence and SHALL NOT synchronize particle painting to every scroll frame.
9. THE feature SHALL avoid adding transformed ancestors that change fixed or sticky positioning behavior.

### Requirement 7: Mobile Menu and Scroll Suspension

**User Story:** As a mobile visitor, I want the menu to lock and unlock predictably without losing my position or leaving the page frozen.

#### Acceptance Criteria

1. WHEN the mobile menu opens, THE Scroll Controller SHALL suspend scrolling with a named `mobile-menu` reason while the existing body overflow lock is active.
2. WHILE any suspension reason remains active, THE enhanced adapter SHALL remain stopped.
3. WHEN the mobile menu closes and no other suspension reason remains, THE Scroll Controller SHALL resume, request one Layout Refresh, and preserve the pre-lock position within 2 CSS pixels unless boundary-clamped.
4. WHEN the same suspension reason is added more than once, THE suspension state SHALL remain idempotent.
5. WHEN one of multiple active suspension reasons is removed, THE Scroll Controller SHALL remain suspended until all reasons are removed.
6. WHEN the menu component unmounts while open, THE cleanup SHALL remove the body overflow lock and the `mobile-menu` suspension reason.

### Requirement 8: Bilingual and Dynamic Layout Stability

**User Story:** As an English or Hindi reader, I want language and content reflow to remain stable so that changing language does not reset or disorient my reading position.

#### Acceptance Criteria

1. WHEN the language changes between English and Hindi, THE integration SHALL request a coalesced Layout Refresh after the new layout and currently loading fonts have had an opportunity to settle.
2. WHEN a Layout Refresh completes, THE Scroll Runtime SHALL preserve the prior scroll position within 2 CSS pixels unless the new Scroll Limit is below that position, in which case it SHALL use the new Scroll Limit.
3. WHEN multiple route, language, font, image, resize, or resume events request refresh before the next refresh pass, THE Scroll Runtime SHALL perform no more than one measurement pass for that batch.
4. THE feature SHALL NOT alter translation data, `html.lang`, font selection, text direction, or bilingual content order.
5. THE feature SHALL NOT split English words or Devanagari grapheme clusters into animation-only nodes.
6. WHEN layout remeasurement changes normalized progress, THE feature SHALL update visual progress without jumping the canonical document position.
7. WHEN a completed reveal is remeasured after language change, THE feature SHALL retain its completed state.

### Requirement 9: Accessibility and Motion Comfort

**User Story:** As a visitor with accessibility or motion-sensitivity needs, I want all content and controls to remain perceivable, operable, and calm.

#### Acceptance Criteria

1. WHEN Reduced Motion is active, THE feature SHALL override smooth CSS target behavior with immediate/auto behavior for feature-controlled navigation.
2. THE feature SHALL preserve DOM order, focus order, accessible names, landmarks, heading hierarchy, and live-region behavior.
3. THE Sacred Thread, parallax layers, and other decorative scroll responses SHALL be hidden from the accessibility tree and SHALL ignore pointer events.
4. THE feature SHALL NOT use opposing high-amplitude foreground and background travel, repeated full-screen blur, full-section scale, rapid oscillation, or flashing.
5. IF JavaScript initialization fails, THEN primary content and controls SHALL remain visible and native document scrolling SHALL remain available.
6. WHEN target focus is explicitly requested, THE controller SHALL move focus after settling without causing a second visible scroll jump.
7. THE feature SHALL remain usable at 200% browser zoom and at viewport widths down to 320 CSS pixels.
8. THE feature SHALL preserve visible keyboard focus indicators throughout target navigation and reveal states.

### Requirement 10: Performance and Rendering Discipline

**User Story:** As a visitor, I want smooth motion that does not cause jank, battery waste, or degraded image rendering.

#### Acceptance Criteria

1. THE feature SHALL coalesce continuous scroll publication to no more than one update per animation frame.
2. THE feature SHALL update continuous visual values without requiring a React component state update on every frame.
3. THE feature SHALL use compositor-friendly opacity and transform properties for continuous effects and SHALL NOT animate layout properties during scroll.
4. THE feature SHALL NOT animate existing backdrop-filter values continuously during scroll.
5. THE enhanced adapter SHALL cap or reset elapsed frame time after a hidden tab, breakpoint switch, or long main-thread stall so that resumption does not jump.
6. THE feature SHALL limit `will-change` to elements that can animate under the current Motion Policy and SHALL remove or avoid it when motion is disabled.
7. During a representative steady homepage scroll, THE feature SHOULD consume no more than 2 milliseconds of scripting time per animation frame at the 95th percentile on the agreed reference device.
8. During a representative complete homepage scroll, THE feature SHALL introduce no long task greater than 50 milliseconds attributable to the scroll feature.
9. THE feature SHALL introduce no measurable cumulative layout shift attributable to initialization, progress rendering, reveal wrappers, or mode changes.
10. THE number of promoted animation layers attributable to this feature SHALL NOT grow as previously viewed sections leave the viewport.

### Requirement 11: Failure Recovery and Safe Input Handling

**User Story:** As a visitor, I want scrolling to recover automatically from unsupported APIs, malformed links, and lifecycle changes.

#### Acceptance Criteria

1. IF enhanced adapter creation partially succeeds and then throws, THEN THE Scroll Runtime SHALL clean partial resources before selecting Native Mode.
2. IF `IntersectionObserver`, `ResizeObserver`, or another optional observation API is unavailable, THEN THE feature SHALL retain visible content and native scrolling with a simpler refresh path.
3. WHEN a target coordinate, offset, Scroll Limit, or progress input is not finite, THE controller SHALL reject or normalize the input without issuing an invalid browser scroll command.
4. WHEN the runtime resumes from a hidden document, THE first enhanced frame SHALL use a reset timing baseline rather than accumulated hidden duration.
5. THE feature SHALL emit diagnostics only in development and SHALL NOT include page content, translation text, or user input in diagnostic messages.
6. THE feature SHALL make no analytics request, remote configuration request, or runtime dependency download.

### Requirement 12: Dependency and Integration Constraints

**User Story:** As a maintainer, I want the feature to fit the existing stack without unnecessary dependencies or engine lock-in.

#### Acceptance Criteria

1. THE implementation SHALL use the existing `SmoothScroll` provider and `useSmoothScrollTo` boundary rather than introducing a second global scroll provider.
2. THE implementation SHALL use the existing Framer Motion dependency for visual scroll responses and reduced-motion detection.
3. NO component outside the `SmoothScroll` implementation boundary SHALL import an enhanced scroll engine or depend on its concrete types.
4. THE implementation SHALL retain a complete Native Mode even when an enhanced engine is present.
5. THE implementation SHALL NOT add a custom wheel-interception engine as a substitute for a missing approved engine.
6. THE implementation SHALL NOT add a new dependency unless the dependency addition is separately approved, pinned to an exact version, and shown necessary to restore the documented Lenis-compatible Enhanced Mode.
7. IF Lenis is already available in the implementation target, THEN its integration SHALL remain behind the Scroll Controller and SHALL use restrained configuration with no touch smoothing, no synchronized touch hijacking, and no wheel-distance amplification.
8. IF Lenis remains absent, THEN all other accepted behavior SHALL operate through Native Mode and Framer Motion without blocking delivery of accessible navigation and visual fallbacks.
