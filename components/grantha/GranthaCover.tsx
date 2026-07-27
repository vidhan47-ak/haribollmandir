"use client";

/* ------------------------------------------------------------------ */
/*  Procedurally generated manuscript covers.                          */
/*                                                                     */
/*  Rather than displaying a PDF page, every item receives a woven     */
/*  gold-on-parchment cover keyed to its title — so the library reads  */
/*  as a shelf of sacred treasures, never a file list.                 */
/* ------------------------------------------------------------------ */

type Palette = "gold" | "maroon" | "peacock" | "emerald" | "sand";

const PALETTES: Record<
  Palette,
  { base: string; deep: string; ink: string; glow: string }
> = {
  gold: { base: "#F6EAD1", deep: "#D8AF66", ink: "#8A5A1F", glow: "#E3C77E" },
  maroon: { base: "#F3E2E1", deep: "#8A2C3A", ink: "#4A1219", glow: "#C87E8E" },
  peacock: { base: "#DCEAEE", deep: "#146B7C", ink: "#0C4A57", glow: "#2E92A6" },
  emerald: { base: "#DEEAE4", deep: "#234437", ink: "#152B22", glow: "#356150" },
  sand: { base: "#F3E8D5", deep: "#C9A24B", ink: "#6B5A4E", glow: "#E3C77E" },
};

/** Deterministic palette + seed from a string, so covers are stable across renders. */
function seedFrom(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const PALETTE_KEYS = Object.keys(PALETTES) as Palette[];

export function paletteFor(text: string, override?: Palette): Palette {
  if (override) return override;
  return PALETTE_KEYS[seedFrom(text) % PALETTE_KEYS.length];
}

interface GranthaCoverProps {
  title: string;
  label?: string;
  palette?: Palette;
  className?: string;
  /** Larger ornament density for featured/large cards. */
  rich?: boolean;
}

/** Woven parchment cover with a central lotus medallion and gold framing. */
export default function GranthaCover({
  title,
  label,
  palette,
  className = "",
  rich = false,
}: GranthaCoverProps) {
  const key = paletteFor(title, palette);
  const c = PALETTES[key];
  const seed = seedFrom(title);
  const uid = `gc${seed.toString(36)}`;

  // A few deterministic ornament positions for the manuscript texture.
  const dots = Array.from({ length: rich ? 7 : 5 }, (_, i) => {
    const s = seedFrom(`${title}-${i}`);
    return {
      x: 12 + (s % 76),
      y: 14 + ((s >> 3) % 72),
      r: 0.6 + ((s >> 6) % 3) * 0.4,
    };
  });

  return (
    <svg
      viewBox="0 0 100 132"
      className={className}
      role="img"
      aria-label={`${title} cover`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCF6EA" />
          <stop offset="55%" stopColor={c.base} />
          <stop offset="100%" stopColor={c.deep} stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="34%" r="60%">
          <stop offset="0%" stopColor={c.glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E3C77E" />
          <stop offset="50%" stopColor="#C9A24B" />
          <stop offset="100%" stopColor="#A8842F" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="100" height="132" fill={`url(#${uid}-bg)`} />
      <rect x="0" y="0" width="100" height="132" fill={`url(#${uid}-glow)`} />

      {/* faint manuscript rule lines */}
      <g stroke={c.ink} strokeOpacity="0.08" strokeWidth="0.5">
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="14" y1={30 + i * 8} x2="86" y2={30 + i * 8} />
        ))}
      </g>

      {/* scattered gold flecks */}
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={c.glow}
          fillOpacity="0.35"
        />
      ))}

      {/* ornamental frame */}
      <rect
        x="6"
        y="6"
        width="88"
        height="120"
        rx="6"
        fill="none"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="1.2"
        strokeOpacity="0.85"
      />
      <rect
        x="9.5"
        y="9.5"
        width="81"
        height="113"
        rx="4"
        fill="none"
        stroke={c.ink}
        strokeOpacity="0.18"
        strokeWidth="0.6"
      />

      {/* central lotus medallion */}
      <g
        transform="translate(50 60)"
        stroke={`url(#${uid}-gold)`}
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M0 -16C4 -8 4 4 0 12 -4 4 -4 -8 0 -16Z" />
        <path d="M0 8C-5 1 -13 -2 -20 -1 -18 7 -11 13 -2 14" />
        <path d="M0 8C5 1 13 -2 20 -1 18 7 11 13 2 14" />
        <path d="M0 9C-8 5 -18 6 -25 11 -20 17 -11 18 -1 15" />
        <path d="M0 9C8 5 18 6 25 11 20 17 11 18 1 15" />
        <circle cx="0" cy="-2" r="2.4" fill={c.glow} fillOpacity="0.5" stroke="none" />
      </g>

      {label && (
        <text
          x="50"
          y="118"
          textAnchor="middle"
          fontSize="4.4"
          letterSpacing="1.2"
          fill={c.ink}
          fillOpacity="0.7"
          style={{ fontFamily: "var(--font-jakarta), sans-serif", textTransform: "uppercase" }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}
