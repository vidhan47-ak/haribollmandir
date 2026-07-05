interface LotusMarkProps {
  className?: string;
}

/** Minimal, elegant lotus emblem used as the temple logo mark. */
export default function LotusMark({ className = "h-8 w-8" }: LotusMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* centre petal */}
        <path d="M24 8c3.2 5 3.2 12 0 18-3.2-6-3.2-13 0-18Z" />
        {/* inner side petals */}
        <path d="M24 26c-3-4.5-8-6.5-13-6 1 5 5 9 10.5 10.5" />
        <path d="M24 26c3-4.5 8-6.5 13-6-1 5-5 9-10.5 10.5" />
        {/* outer side petals */}
        <path d="M24 27c-5-2.5-11-2-16 1 3 4 8.5 5.6 14 4.4" />
        <path d="M24 27c5-2.5 11-2 16 1-3 4-8.5 5.6-14 4.4" />
        {/* water line */}
        <path d="M9 36c4 2.4 9.4 3.6 15 3.6S35 38.4 39 36" opacity="0.7" />
      </g>
    </svg>
  );
}
