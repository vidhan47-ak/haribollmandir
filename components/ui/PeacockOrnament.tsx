interface PeacockOrnamentProps {
  /** Which side of the hero this peacock frames. Base art faces inward
   *  (head toward center); "right" is produced by mirroring the base. */
  side?: "left" | "right";
  className?: string;
}

/**
 * Hand-authored ornamental peacock in the illuminated-manuscript style
 * (gold + peacock-teal + rose). Pure SVG, server-rendered, decorative.
 *
 * The base drawing faces INWARD for the left side: head/neck rise on the
 * inward (right) edge toward the arch, while the tail train cascades down
 * and fans OUTWARD (to the left). The right-side peacock is the same art
 * mirrored via scaleX(-1). Gradient ids are suffixed with `side` so the
 * two instances never collide.
 *
 * Height is driven by the caller via `className` (e.g. h-[68vh] w-auto);
 * the viewBox supplies the intrinsic aspect ratio.
 */
export default function PeacockOrnament({
  side = "left",
  className = "",
}: PeacockOrnamentProps) {
  const stemId = `peacockStem-${side}`;
  const mirror = side === "right" ? "scale-x-[-1] " : "";

  // Tail "eye" feathers: angle (deg, clockwise from straight-down) + length.
  // Slightly-inward feathers first, fanning progressively outward & down.
  const feathers = [
    { angle: -14, length: 150 },
    { angle: -4, length: 176 },
    { angle: 6, length: 196 },
    { angle: 16, length: 205 },
    { angle: 28, length: 198 },
    { angle: 40, length: 205 },
    { angle: 52, length: 190 },
    { angle: 64, length: 196 },
    { angle: 76, length: 178 },
    { angle: 86, length: 158 },
  ];

  const baseX = 190;
  const baseY = 430;

  return (
    <svg
      viewBox="0 0 340 660"
      className={`${mirror}block ${className}`}
      aria-hidden="true"
      role="presentation"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id={stemId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E3C77E" />
          <stop offset="0.5" stopColor="#C9A24B" />
          <stop offset="1" stopColor="#A8842F" />
        </linearGradient>
      </defs>

      <g opacity="0.9">
        {/* ---- TAIL TRAIN (behind everything) --------------------------- */}
        <g transform={`translate(${baseX} ${baseY})`}>
          {feathers.map(({ angle, length: L }, i) => (
            <g key={i} transform={`rotate(${angle})`}>
              {/* thin curved gold stem */}
              <path
                d={`M0 0 Q ${L * 0.06} ${L * 0.5} 0 ${L}`}
                fill="none"
                stroke={`url(#${stemId})`}
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              {/* ocellus: outer almond (teal) */}
              <path
                d={`M0 ${L - 24} C 14 ${L - 13} 14 ${L + 15} 0 ${
                  L + 26
                } C -14 ${L + 15} -14 ${L - 13} 0 ${L - 24} Z`}
                fill="#146B7C"
                stroke="#C9A24B"
                strokeWidth="1.3"
              />
              {/* inner ring (peacock-light) */}
              <ellipse cx="0" cy={L + 1} rx="9" ry="14" fill="#2E92A6" />
              {/* gold crescent */}
              <ellipse cx="0" cy={L - 2.5} rx="7.4" ry="9.4" fill="#E3C77E" />
              {/* dark center */}
              <ellipse cx="0" cy={L + 1.5} rx="5.1" ry="7.3" fill="#0E2825" />
            </g>
          ))}
        </g>

        {/* ---- NECK (S-curve ribbon) ------------------------------------ */}
        <path
          d="M 242 98 C 216 150 188 208 206 300 L 182 300 C 166 208 220 150 226 96 Z"
          fill="#146B7C"
          stroke="#C9A24B"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* faint gold scale arcs on the neck */}
        <g fill="none" stroke="#E3C77E" strokeWidth="1.2" opacity="0.5">
          <path d="M 196 150 Q 210 158 224 150" />
          <path d="M 192 194 Q 206 202 220 194" />
          <path d="M 190 238 Q 204 246 218 238" />
        </g>

        {/* ---- BODY (teardrop) ------------------------------------------ */}
        <path
          d="M 198 296 C 248 320 250 402 192 452 C 134 402 148 322 198 296 Z"
          fill="#0C4A57"
          stroke="#C9A24B"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* ---- WING (overlapping covert teardrops) ---------------------- */}
        <g fill="#2E92A6" stroke="#C9A24B" strokeWidth="1.2" opacity="0.95">
          <path
            d="M0 -30 C 20 -14 18 26 0 34 C -18 26 -20 -14 0 -30 Z"
            transform="translate(176 352) rotate(-20) scale(0.9)"
          />
          <path
            d="M0 -30 C 20 -14 18 26 0 34 C -18 26 -20 -14 0 -30 Z"
            transform="translate(170 384) rotate(-10) scale(1.02)"
          />
          <path
            d="M0 -30 C 20 -14 18 26 0 34 C -18 26 -20 -14 0 -30 Z"
            transform="translate(178 414) rotate(-2) scale(0.82)"
          />
        </g>

        {/* ---- CREST filaments (behind the head) ------------------------ */}
        <g stroke="#C9A24B" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M 224 68 C 214 50 208 40 206 30" />
          <path d="M 230 66 C 228 46 227 34 226 22" />
          <path d="M 236 67 C 244 48 248 36 250 26" />
          <path d="M 240 70 C 252 54 258 48 262 40" />
        </g>
        <g fill="#1C4A45" stroke="#C9A24B" strokeWidth="1">
          <circle cx="206" cy="30" r="4" />
          <circle cx="226" cy="22" r="4" />
          <circle cx="250" cy="26" r="4" />
          <circle cx="262" cy="40" r="4" />
        </g>

        {/* ---- HEAD + beak + eye ---------------------------------------- */}
        <ellipse
          cx="230"
          cy="82"
          rx="18"
          ry="16"
          fill="#1C4A45"
          stroke="#C9A24B"
          strokeWidth="2"
        />
        {/* tiny gold beak pointing inward */}
        <path d="M 246 78 L 266 84 L 246 90 Z" fill="#C9A24B" />
        {/* dark eye with highlight */}
        <circle cx="233" cy="80" r="3.6" fill="#0E2825" />
        <circle cx="231.4" cy="78.4" r="1.1" fill="#FAF4EA" />
      </g>
    </svg>
  );
}
