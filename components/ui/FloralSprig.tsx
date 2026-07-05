interface FloralSprigProps {
  /** Corner the vine spills from. Base art spills from the top-RIGHT
   *  corner; "left" is the same art mirrored via scaleX(-1). */
  side?: "left" | "right";
  className?: string;
}

/* A stylized pink rose (layered petals + gold outline), viewed from above. */
function Rose({
  cx,
  cy,
  r,
  rot = 0,
}: {
  cx: number;
  cy: number;
  r: number;
  rot?: number;
}) {
  const s = r / 30;
  const OUTER = "M0 0 C -11 -6 -11 -25 0 -30 C 11 -25 11 -6 0 0 Z";
  const INNER = "M0 0 C -8 -4 -8 -18 0 -22 C 8 -18 8 -4 0 0 Z";
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${s})`}>
      <g fill="#E7A3B0" stroke="#C9A24B" strokeWidth={1.3 / s}>
        <path d={OUTER} transform="rotate(0)" />
        <path d={OUTER} transform="rotate(72)" />
        <path d={OUTER} transform="rotate(144)" />
        <path d={OUTER} transform="rotate(216)" />
        <path d={OUTER} transform="rotate(288)" />
      </g>
      <g fill="#F4CCD4" stroke="#C9A24B" strokeWidth={0.9 / s}>
        <path d={INNER} transform="rotate(36)" />
        <path d={INNER} transform="rotate(108)" />
        <path d={INNER} transform="rotate(180)" />
        <path d={INNER} transform="rotate(252)" />
        <path d={INNER} transform="rotate(324)" />
      </g>
      <circle cx="0" cy="0" r={4.5} fill="#E3C77E" />
    </g>
  );
}

/* A green leaf with a faint midrib. */
function Leaf({
  x,
  y,
  rot = 0,
  scale = 1,
}: {
  x: number;
  y: number;
  rot?: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path
        d="M0 0 C 9 -8 13 -26 6 -42 C 0 -28 -9 -14 0 0 Z"
        fill="#356150"
        stroke="#234437"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M2 -4 Q 5 -22 6 -38"
        fill="none"
        stroke="#234437"
        strokeWidth="1"
        opacity="0.6"
      />
    </g>
  );
}

/* A small rose bud sitting in a green calyx. */
function Bud({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d="M0 2 C 9 -2 9 -22 0 -28 C -9 -22 -9 -2 0 2 Z"
        fill="#356150"
        stroke="#234437"
        strokeWidth="1"
      />
      <path
        d="M0 -4 C 6 -8 6 -20 0 -24 C -6 -20 -6 -8 0 -4 Z"
        fill="#E7A3B0"
        stroke="#C9A24B"
        strokeWidth="1"
      />
    </g>
  );
}

/**
 * A gold rose vine spilling from a top corner: layered pink blossoms, buds,
 * and green leaves along a gold vine. Pure SVG, server-rendered, decorative.
 * Base art spills from the top-right corner; the left variant is mirrored.
 */
export default function FloralSprig({
  side = "right",
  className = "",
}: FloralSprigProps) {
  const mirror = side === "left" ? "scale-x-[-1] " : "";

  return (
    <svg
      viewBox="0 0 340 340"
      className={`${mirror}block ${className}`}
      aria-hidden="true"
      role="presentation"
      preserveAspectRatio="xMinYMin meet"
    >
      <g opacity="0.96">
        {/* ---- gold vine + tendrils ------------------------------------ */}
        <g
          fill="none"
          stroke="#C9A24B"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M 352 -12 C 300 40 292 96 250 132 C 214 162 180 178 150 216" />
          <path d="M 300 44 C 276 66 274 104 240 122" opacity="0.85" />
          <path
            d="M 150 216 C 138 236 118 240 106 228"
            strokeWidth="2.2"
            opacity="0.8"
          />
          <path
            d="M 322 26 C 336 40 336 58 326 70"
            strokeWidth="2"
            opacity="0.7"
          />
        </g>

        {/* ---- leaves --------------------------------------------------- */}
        <Leaf x="318" y="34" rot={40} scale={0.95} />
        <Leaf x="284" y="94" rot={16} scale={1.05} />
        <Leaf x="220" y="150" rot={-8} scale={1} />
        <Leaf x="196" y="206" rot={30} scale={0.9} />
        <Leaf x="132" y="212" rot={-40} scale={0.85} />

        {/* ---- buds ----------------------------------------------------- */}
        <Bud x="236" y="92" rot={34} />
        <Bud x="116" y="236" rot={-18} />

        {/* ---- roses (front) ------------------------------------------- */}
        <Rose cx={300} cy={52} r={30} rot={12} />
        <Rose cx={250} cy={128} r={40} rot={-14} />
        <Rose cx={172} cy={192} r={30} rot={22} />
        <Rose cx={140} cy={228} r={21} rot={-6} />
      </g>
    </svg>
  );
}
