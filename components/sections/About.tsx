import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import ParallaxImage from "@/components/ui/Parallax";
import { images } from "@/lib/images";

const HIGHLIGHTS = [
  "Daily Darshan & Aarti",
  "Harinam Sankirtan",
  "Seva & Prasadam",
  "Festivals through the year",
];

export default function About() {
  return (
    <section id="about" className="section-pad relative about-bg">
      <div className="container-temple">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-gold/30 bg-cream-50 shadow-soft">
          <div className="pattern-floral pointer-events-none absolute inset-0 opacity-50" />
          {/* Corner arch glow */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-16">
            {/* Image with temple arch */}
            <Reveal className="order-2 lg:order-1">
              <div className="relative mx-auto max-w-md">
                <div className="arch-top overflow-hidden rounded-b-3xl shadow-card ring-1 ring-gold/30">
                  <ParallaxImage
                    src={images.temple.src}
                    alt={images.temple.alt}
                    label={images.temple.label}
                    palette="maroon"
                    amount={28}
                    className="aspect-[4/5] w-full"
                  />
                </div>
                {/* thin gold frame offset */}
                <div className="arch-top pointer-events-none absolute -inset-3 -z-10 rounded-b-3xl border border-gold/40" />
              </div>
            </Reveal>

            {/* Text */}
            <div className="order-1 lg:order-2">
              <SectionHeading
                align="left"
                eyebrow="Our Temple"
                title="About Hariboll Mandir"
              />

              <Reveal delay={0.1}>
                <p className="mt-6 font-body text-base leading-relaxed text-ink-soft sm:text-lg">
                  Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir, Jalandhar,
                  is a sacred place of devotion, Harinam Sankirtan, seva,
                  festivals and divine darshan.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <p className="mt-4 font-body text-base leading-relaxed text-ink-soft sm:text-lg">
                  The temple welcomes devotees to experience the mercy of
                  Mahaprabhu and the loving shelter of Sri Sri Radha Madhav Ji.
                </p>
              </Reveal>

              <Reveal delay={0.24}>
                <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {HIGHLIGHTS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 font-body text-[15px] text-ink"
                    >
                      <span className="inline-block h-2 w-2 rotate-45 rounded-[2px] bg-gold-gradient" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
