"use client";

import { useReducedMotion } from "framer-motion";

const PETALS = [
  { left: "8%", size: 16, delay: 0, duration: 26, drift: 22 },
  { left: "24%", size: 11, delay: 6, duration: 32, drift: -16 },
  { left: "52%", size: 14, delay: 3, duration: 29, drift: 18 },
  { left: "71%", size: 10, delay: 9, duration: 34, drift: -14 },
  { left: "88%", size: 15, delay: 1.5, duration: 30, drift: 20 },
];

// A few lines of the Hare Krishna Mahamantra in Devanāgarī — used purely as
// a decorative watermark, never read aloud by screen readers (aria-hidden).
const MANUSCRIPT_LINES = [
  "हरे कृष्ण हरे कृष्ण",
  "कृष्ण कृष्ण हरे हरे",
  "हरे राम हरे राम",
  "राम राम हरे हरे",
  "हरे कृष्ण हरे कृष्ण",
  "कृष्ण कृष्ण हरे हरे",
  "हरे राम हरे राम",
  "राम राम हरे हरे",
];

export default function GranthaBackground() {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* warm cream wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px circle at 50% -8%, #FEFBF5 0%, #FAF4EA 42%, #F3E8D5 100%)",
        }}
      />

      {/* very faint floral texture */}
      <div className="pattern-floral absolute inset-0 opacity-[0.5]" />

      {/* Manuscript watermark — Devanāgarī lines running down the right margin,
          like a palm-leaf scripture. Opacity kept low so it reads as texture. */}
      <div
        className="absolute inset-y-0 right-0 flex w-[clamp(120px,14vw,200px)] flex-col justify-center gap-5 px-4 opacity-[0.07]"
        style={{ writingMode: "horizontal-tb" }}
      >
        {MANUSCRIPT_LINES.map((line, i) => (
          <span
            key={i}
            className="block text-right font-serif text-[clamp(0.65rem,1.1vw,0.9rem)] leading-relaxed tracking-wide text-[#6E1E2A]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {line}
          </span>
        ))}
      </div>

      {/* Matching left margin — mirrored, slightly lighter */}
      <div
        className="absolute inset-y-0 left-0 flex w-[clamp(120px,14vw,200px)] flex-col justify-center gap-5 px-4 opacity-[0.045]"
      >
        {MANUSCRIPT_LINES.map((line, i) => (
          <span
            key={i}
            className="block font-serif text-[clamp(0.65rem,1.1vw,0.9rem)] leading-relaxed tracking-wide text-[#6E1E2A]"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            {line}
          </span>
        ))}
      </div>

      {/* distant temple silhouette along the base — raised from 0.06 */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax meet"
        className="absolute inset-x-0 bottom-0 h-[38vh] w-full opacity-[0.10]"
      >
        <g fill="#6E1E2A">
          <path d="M120 320V150l40-46 40 46v170z" />
          <path d="M150 104l10-30 10 30z" />
          <rect x="360" y="180" width="150" height="140" />
          <path d="M360 180l75-60 75 60z" />
          <path d="M700 320V120l55-64 55 64v200z" />
          <path d="M745 56l10-34 10 34z" />
          <rect x="980" y="200" width="130" height="120" />
          <path d="M980 200l65-54 65 54z" />
          <path d="M1240 320V160l45-50 45 50v160z" />
          <path d="M1275 110l10-28 10 28z" />
        </g>
      </svg>

      {/* lotus watermark — raised from 0.04 */}
      <svg
        viewBox="0 0 48 48"
        className="absolute left-1/2 top-[42%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
      >
        <g
          stroke="#C9A24B"
          strokeWidth="0.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M24 8c3.2 5 3.2 12 0 18-3.2-6-3.2-13 0-18Z" />
          <path d="M24 26c-3-4.5-8-6.5-13-6 1 5 5 9 10.5 10.5" />
          <path d="M24 26c3-4.5 8-6.5 13-6-1 5-5 9-10.5 10.5" />
          <path d="M24 27c-5-2.5-11-2-16 1 3 4 8.5 5.6 14 4.4" />
          <path d="M24 27c5-2.5 11-2 16 1-3 4-8.5 5.6-14 4.4" />
        </g>
      </svg>

      {/* Occasional slow-falling petals. These were five INFINITE Framer Motion
          animations using the `y`/`x`/`rotate` shorthands — five main-thread rAF
          loops running for the entire reading session. Predetermined motion that
          is never interrupted belongs in CSS, where the compositor owns it. */}
      {!reduce &&
        PETALS.map((p, i) => (
          <span
            key={i}
            className="grantha-petal absolute top-[-6%]"
            style={
              {
                left: p.left,
                "--petal-duration": `${p.duration}s`,
                "--petal-delay": `${p.delay}s`,
                "--petal-drift": `${p.drift}px`,
              } as React.CSSProperties
            }
          >
            <svg width={p.size} height={p.size} viewBox="0 0 24 24">
              <path
                d="M12 3c4 4 4 12 0 18-4-6-4-14 0-18Z"
                fill="#E7A3B0"
                fillOpacity="0.5"
              />
            </svg>
          </span>
        ))}
    </div>
  );
}
