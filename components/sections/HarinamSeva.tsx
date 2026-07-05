import type { ReactNode } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";

/* ---------------------------- icons ---------------------------- */

function MalaIcon() {
  const beads = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const cx = 24 + Math.cos(angle) * 14;
    const cy = 22 + Math.sin(angle) * 14;
    return <circle key={i} cx={cx} cy={cy} r={2.1} />;
  });
  return (
    <svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
      <g fill="currentColor">{beads}</g>
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M24 36c0 3-2 4-2 7M24 36c0 3 2 4 2 7" />
      </g>
      <circle cx="24" cy="45" r="1.8" fill="currentColor" />
    </svg>
  );
}

function DiyaIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M24 8c4 4 4 9 0 12-4-3-4-8 0-12Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M10 30c3 4 8 6 14 6s11-2 14-6c-4-1.5-9-2.4-14-2.4S14 28.5 10 30Z" />
      <path d="M14 34c2.6 3 6 4.6 10 4.6s7.4-1.6 10-4.6" opacity="0.6" />
    </svg>
  );
}

function OfferingIcon() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-8 w-8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M24 10c2.6 3.4 2.6 8 0 11.4-2.6-3.4-2.6-8 0-11.4Z" />
      <path d="M24 21c-2.4-3-6.4-4.4-10.6-3.6.8 4 3.8 7.2 8 8.4" />
      <path d="M24 21c2.4-3 6.4-4.4 10.6-3.6-.8 4-3.8 7.2-8 8.4" />
      <path d="M12 28c3 3.6 7.4 5.6 12 5.6S33 31.6 36 28" />
      <path d="M16 33c2.4 2.6 5.4 4 8 4s5.6-1.4 8-4" opacity="0.6" />
    </svg>
  );
}

/* ---------------------------- data ---------------------------- */

const PILLARS: {
  icon: ReactNode;
  title: string;
  text: string;
}[] = [
  {
    icon: <MalaIcon />,
    title: "Harinam Sankirtan",
    text: "Chanting the Holy Name is the heart of spiritual life.",
  },
  {
    icon: <DiyaIcon />,
    title: "Darshan",
    text: "Darshan is not just seeing the Lord; it is receiving mercy.",
  },
  {
    icon: <OfferingIcon />,
    title: "Seva",
    text: "Seva transforms ordinary actions into offerings of love.",
  },
];

/* ---------------------------- section ---------------------------- */

export default function HarinamSeva() {
  return (
    <section id="seva" className="section-pad relative overflow-hidden">
      <div className="pattern-peacock pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="container-temple relative">
        <SectionHeading
          eyebrow="The Path of Devotion"
          title="Harinam, Darshan & Seva"
          subtitle="Three timeless gifts of Gaudiya Vaishnavism, lived and shared within the temple community."
        />

        <Stagger className="mt-16 grid gap-8 md:grid-cols-3 lg:mt-20">
          {PILLARS.map((pillar) => (
            <StaggerItem key={pillar.title}>
              <article className="group relative flex h-full flex-col items-center rounded-[1.75rem] border border-gold/20 bg-cream-50/80 p-9 text-center shadow-soft backdrop-blur-sm transition-all duration-700 ease-devotional hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-card">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/5 text-forest ring-1 ring-forest/15 transition-colors duration-500 group-hover:bg-gold/10 group-hover:text-gold-deep group-hover:ring-gold/30">
                  {pillar.icon}
                </span>
                <h3 className="mt-6 font-heading text-2xl font-semibold text-maroon">
                  {pillar.title}
                </h3>
                <div className="divider-lotus mt-4" />
                <p className="mt-5 font-body text-[15px] leading-relaxed text-ink-soft">
                  {pillar.text}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
