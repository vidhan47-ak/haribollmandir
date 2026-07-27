import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
  className = "",
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div
      className={`${isCenter ? "mx-auto max-w-2xl text-center" : "max-w-2xl text-left"} ${className}`}
    >
      {eyebrow && (
        <Reveal>
          <span className={`eyebrow ${light ? "text-gold-light" : "text-gold-deeper"}`}>
            {eyebrow}
          </span>
        </Reveal>
      )}

      {/* Shimmer headings render immediately with no enter/exit transition —
          the gold sweep is their only motion. */}
      <h2
        className={`heading-shimmer mt-5 font-heading text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem] ${
          light ? "heading-shimmer--light text-cream" : "text-maroon-dark"
        }`}
      >
        {title}
      </h2>

      {isCenter && (
        <Reveal delay={0.16}>
          <div className="divider-lotus mt-7" />
        </Reveal>
      )}

      {subtitle && (
        <Reveal delay={0.2}>
          <p
            className={`mt-6 font-body text-base leading-relaxed sm:text-lg ${
              light ? "text-cream/80" : "text-ink-soft"
            }`}
          >
            {subtitle}
          </p>
        </Reveal>
      )}
    </div>
  );
}
