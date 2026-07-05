/**
 * Ornate gold page frame for the hero: a thin double edge line around the
 * viewport plus filigree scroll-work in all four corners. Pure markup/SVG,
 * server-rendered, and non-interactive (pointer-events-none). Corners are a
 * single reusable SVG mirrored/rotated into place via CSS transforms, and it
 * uses currentColor (no gradient ids) to avoid duplicate-id collisions.
 */

function Corner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`absolute h-14 w-14 text-gold-light/80 sm:h-24 sm:w-24 lg:h-28 lg:w-28 ${className}`}
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* double L bracket hugging the corner */}
        <path d="M18 96 L18 18 L96 18" />
        <path d="M30 96 L30 30 L96 30" opacity="0.55" />
        {/* scroll curl at the elbow */}
        <path d="M48 48 C 48 40 40 36 34 42 C 30 46 32 54 40 54" />
        {/* small leaf reaching inward */}
        <path
          d="M52 52 C 66 58 78 70 84 86 C 74 82 62 74 54 62 Z"
          fill="currentColor"
          fillOpacity="0.14"
          stroke="none"
        />
        <path d="M56 58 C 66 66 74 76 82 86" opacity="0.5" />
        {/* accent dots */}
        <circle cx="18" cy="18" r="3.2" fill="currentColor" stroke="none" />
        <circle
          cx="96"
          cy="18"
          r="2"
          fill="currentColor"
          fillOpacity="0.7"
          stroke="none"
        />
        <circle
          cx="18"
          cy="96"
          r="2"
          fill="currentColor"
          fillOpacity="0.7"
          stroke="none"
        />
      </g>
    </svg>
  );
}

export default function OrnateFrame() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Double thin gold edge lines */}
      <div className="absolute inset-2 rounded-lg border border-gold/25 sm:inset-4" />
      <div className="absolute inset-3.5 border border-gold/15 sm:inset-6" />

      {/* Filigree corners */}
      <Corner className="left-0.5 top-0.5 sm:left-2 sm:top-2" />
      <Corner className="right-0.5 top-0.5 scale-x-[-1] sm:right-2 sm:top-2" />
      <Corner className="bottom-0.5 left-0.5 scale-y-[-1] sm:bottom-2 sm:left-2" />
      <Corner className="bottom-0.5 right-0.5 rotate-180 sm:bottom-2 sm:right-2" />
    </div>
  );
}
