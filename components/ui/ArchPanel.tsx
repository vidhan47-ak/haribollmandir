import type { ReactNode } from "react";

interface ArchPanelProps {
  children: ReactNode;
  /** Ornament (e.g. <LotusCrest/>) pinned at the crest, overlapping upward. */
  crest?: ReactNode;
  className?: string;
}

/**
 * A cusped (multi-lobed) temple arch panel that wraps its children.
 *
 * Robust to variable content height: it is built from a fixed-aspect SVG
 * CROWN (the cusped top, ending in a pointed crest) sitting flush above a
 * CSS parchment BODY (a rounded-bottom rectangle with gold side/bottom
 * borders). The crown's fill gradient bottom color and the body's top color
 * are identical (#EEDFBE) so there is no seam at the springline, and the
 * body has no top border for the same reason.
 */
export default function ArchPanel({
  children,
  crest,
  className = "",
}: ArchPanelProps) {
  return (
    <div className={`relative shadow-arch ${className}`}>
      {/* Crest ornament, overlapping upward at top-center */}
      {crest && (
        <div className="absolute left-1/2 -top-8 z-10 -translate-x-1/2 sm:-top-12 lg:-top-14">
          {crest}
        </div>
      )}

      {/* CROWN — cusped top */}
      <svg viewBox="0 0 1000 300" className="block h-auto w-full" aria-hidden="true">
        <defs>
          <linearGradient id="archParchment" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FCF6EA" />
            <stop offset="1" stopColor="#EEDFBE" />
          </linearGradient>
          <filter id="archGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="3"
              floodColor="#E3C77E"
              floodOpacity="0.5"
            />
          </filter>
        </defs>

        {/* Parchment fill (closed, no stroke) */}
        <path
          d="M 0,300 C 40,180 200,150 280,210 C 380,150 470,120 500,45 C 530,120 620,150 720,210 C 800,150 960,180 1000,300 Z"
          fill="url(#archParchment)"
        />
        {/* Gold cusp outline (open, no fill) */}
        <path
          d="M 0,300 C 40,180 200,150 280,210 C 380,150 470,120 500,45 C 530,120 620,150 720,210 C 800,150 960,180 1000,300"
          fill="none"
          stroke="#C9A24B"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#archGlow)"
        />
      </svg>

      {/* BODY — parchment rectangle; top color matches the crown bottom */}
      <div
        className="-mt-px rounded-b-[2rem] border-x-2 border-b-2 border-gold/70 px-6 pb-12 pt-2 sm:px-12"
        style={{
          background:
            "linear-gradient(180deg,#EEDFBE 0%,#F4E9D2 40%,#EAD9B2 100%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
