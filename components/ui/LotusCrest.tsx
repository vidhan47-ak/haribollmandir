interface LotusCrestProps {
  className?: string;
}

/**
 * Ornate medallion for the arch crest: a stylized pink lotus (layered
 * petals with a gold outline), a pair of green leaves at the base, and
 * symmetric gold filigree scrolls sweeping left and right. Server-rendered
 * pure SVG. ~180px wide on desktop, smaller on mobile.
 */
export default function LotusCrest({ className = "" }: LotusCrestProps) {
  const PETAL = "M120 112 C 108 82 108 54 120 36 C 132 54 132 82 120 112 Z";

  return (
    <svg
      viewBox="0 0 240 140"
      className={`block h-auto w-28 sm:w-40 lg:w-44 ${className}`}
      aria-hidden="true"
    >
      {/* Green leaves at the base (behind the lotus) */}
      <g fill="#356150" stroke="#234437" strokeWidth="1.2">
        <path d="M120 118 C 96 118 72 110 58 94 C 82 92 106 102 122 114 Z" />
        <path d="M120 118 C 144 118 168 110 182 94 C 158 92 134 102 118 114 Z" />
      </g>

      {/* Symmetric gold filigree scrolls */}
      <g
        fill="none"
        stroke="#C9A24B"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M108 114 C 80 120 56 116 40 104 C 30 96 36 82 48 86 C 55 88 54 98 47 98" />
        <path d="M132 114 C 160 120 184 116 200 104 C 210 96 204 82 192 86 C 185 88 186 98 193 98" />
      </g>
      <g fill="#E3C77E">
        <circle cx="46" cy="98" r="2.4" />
        <circle cx="194" cy="98" r="2.4" />
      </g>

      {/* Lotus — back row */}
      <g fill="#F4CCD4" stroke="#C9A24B" strokeWidth="1.6">
        <path d={PETAL} transform="rotate(-46 120 112)" />
        <path d={PETAL} transform="rotate(-23 120 112)" />
        <path d={PETAL} transform="rotate(23 120 112)" />
        <path d={PETAL} transform="rotate(46 120 112)" />
      </g>

      {/* Lotus — front row */}
      <g fill="#E7A3B0" stroke="#E3C77E" strokeWidth="1.6">
        <path d={PETAL} transform="rotate(-15 120 112)" />
        <path d={PETAL} transform="rotate(15 120 112)" />
        <path d={PETAL} />
      </g>

      {/* Center highlight petal */}
      <path
        d="M120 108 C 113 90 113 72 120 58 C 127 72 127 90 120 108 Z"
        fill="#F4CCD4"
        stroke="none"
        opacity="0.6"
      />

      {/* Seed dots at the base */}
      <g fill="#C9A24B">
        <circle cx="120" cy="104" r="2.4" />
        <circle cx="114" cy="108" r="1.8" />
        <circle cx="126" cy="108" r="1.8" />
      </g>
    </svg>
  );
}
