"use client";

import { Reveal } from "@/components/ui/Reveal";
import HeritageSection from "@/components/heritage/HeritageSection";
import { heritageImages } from "@/lib/images";
import { useLang } from "@/lib/i18n";

/* Structural (non-translated) data: number, side and image per block. Text
   (title + paragraphs) comes from the i18n dictionary, matched by index. */
const STRUCT = [
  { index: "01", side: "left" as const, image: heritageImages.origins },
  { index: "02", side: "right" as const, image: heritageImages.prabhupad },
  { index: "03", side: "left" as const, image: heritageImages.paramGurudev },
  { index: "04", side: "right" as const, image: heritageImages.gurudev },
  { index: "05", side: "left" as const, image: heritageImages.teachings },
  { index: "06", side: "right" as const, image: heritageImages.math },
  { index: "07", side: "left" as const, image: heritageImages.mandir },
];

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
    </>
  );
}

export default function HeritageContent() {
  const { t } = useLang();
  const h = t.heritage;

  return (
    <main>
      {/* ---------------- HERO band ---------------- */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-44">
        <div className="pattern-floral pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(201,162,75,0.18),transparent_70%)]" />

        <div className="container-temple relative text-center">
          <Reveal>
            <span className="eyebrow justify-center font-display text-gold-deeper">
              {h.heroEyebrow}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-teal-dark sm:text-5xl lg:text-6xl">
              {h.heroTitle}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="divider-lotus mt-8" />
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-7 max-w-2xl font-body text-base leading-relaxed text-ink-soft sm:text-lg">
              {h.heroSubtitle}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- SEVEN heritage blocks ---------------- */}
      <section className="relative pb-20 lg:pb-56">
        <div className="container-temple space-y-6 lg:space-y-8">
          {STRUCT.map((b, i) => {
            const block = h.blocks[i];
            return (
              <HeritageSection
                key={b.index}
                index={b.index}
                side={b.side}
                title={block.title}
                imageSrc={b.image.src}
                imageLabel={b.image.label}
                imagePalette={b.image.palette}
              >
                <Paragraphs items={block.paras} />
              </HeritageSection>
            );
          })}
        </div>
      </section>

      {/* ---------------- CLOSING band ---------------- */}
      <section className="section-pad relative overflow-hidden">
        <div className="pattern-floral pointer-events-none absolute inset-0 opacity-30" />
        <div className="container-temple relative text-center">
          <Reveal>
            <div className="divider-lotus" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-8 max-w-3xl font-heading text-xl italic leading-relaxed text-maroon-dark sm:text-2xl">
              {h.closing}
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
