interface TempleSilhouetteProps {
  className?: string;
}

interface Spire {
  x: number;
  w: number;
  h: number;
}

/**
 * Soft, hazy skyline of temple shikharas (curvilinear tapered spires with
 * kalash finials) for the hero backdrop. Pure SVG, server-rendered,
 * decorative. A single vertical gradient fades every spire toward its top
 * for a golden-hour depth-of-field feel; the whole band is kept low-opacity
 * so it reads as a distant silhouette on any screen size.
 */
export default function TempleSilhouette({
  className = "",
}: TempleSilhouetteProps) {
  const BASE = 360;

  // Overlapping spires of varied height/width across the 1440-wide band.
  const spires: Spire[] = [
    { x: 150, w: 180, h: 244 },
    { x: 360, w: 150, h: 300 },
    { x: 560, w: 220, h: 208 },
    { x: 760, w: 168, h: 332 },
    { x: 980, w: 200, h: 262 },
    { x: 1180, w: 158, h: 298 },
    { x: 1330, w: 190, h: 226 },
  ];

  const spirePath = ({ x, w, h }: Spire) => {
    const half = w / 2;
    const top = BASE - h;
    return (
      `M ${x - half} ${BASE} ` +
      `C ${x - half} ${BASE - h * 0.5} ${x - w * 0.16} ${BASE - h * 0.86} ${x} ${top} ` +
      `C ${x + w * 0.16} ${BASE - h * 0.86} ${x + half} ${BASE - h * 0.5} ${x + half} ${BASE} ` +
      `Z`
    );
  };

  return (
    <svg
      viewBox="0 0 1440 360"
      className={`block ${className}`}
      aria-hidden="true"
      role="presentation"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient
          id="templeHaze"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#F0DCA6" stopOpacity="0" />
          <stop offset="0.45" stopColor="#E7CE96" stopOpacity="0.24" />
          <stop offset="1" stopColor="#D8B978" stopOpacity="0.44" />
        </linearGradient>
      </defs>

      <g fill="url(#templeHaze)">
        {/* grounding base band */}
        <rect x="0" y="300" width="1440" height="60" />

        {spires.map((s, i) => {
          const top = BASE - s.h;
          return (
            <g key={i}>
              <path d={spirePath(s)} />
              {/* kalash finial: pot + sphere + spike */}
              <rect x={s.x - 7} y={top - 8} width="14" height="10" rx="2" />
              <circle cx={s.x} cy={top - 14} r="7" />
              <rect x={s.x - 1.6} y={top - 30} width="3.2" height="16" rx="1.6" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
