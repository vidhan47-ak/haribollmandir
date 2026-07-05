import SectionHeading from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { festivalImages } from "@/lib/images";
import type { Palette } from "@/lib/images";

interface Festival {
  title: string;
  when: string;
  blurb: string;
  src: string;
  palette: Palette;
}

const FESTIVALS: Festival[] = [
  {
    title: "Prakat Utsav",
    when: "Appearance Day",
    blurb: "The joyful celebration of the deities' divine appearance.",
    src: festivalImages.prakatUtsav.src,
    palette: festivalImages.prakatUtsav.palette,
  },
  {
    title: "Mango Festival",
    when: "Summer",
    blurb: "Sweet mangoes lovingly offered to Sri Sri Radha Madhav.",
    src: festivalImages.mango.src,
    palette: festivalImages.mango.palette,
  },
  {
    title: "Ekadashi",
    when: "Twice a Month",
    blurb: "A sacred day of fasting and remembrance of Krishna.",
    src: festivalImages.ekadashi.src,
    palette: festivalImages.ekadashi.palette,
  },
  {
    title: "Jhulan",
    when: "Shravan",
    blurb: "The blissful swing festival of the Divine Couple.",
    src: festivalImages.jhulan.src,
    palette: festivalImages.jhulan.palette,
  },
  {
    title: "Janmashtami",
    when: "Bhadra",
    blurb: "The midnight appearance of Lord Sri Krishna.",
    src: festivalImages.janmashtami.src,
    palette: festivalImages.janmashtami.palette,
  },
  {
    title: "Kartik",
    when: "Month of Lamps",
    blurb: "Offering lamps to please Sri Damodar through Kartik.",
    src: festivalImages.kartik.src,
    palette: festivalImages.kartik.palette,
  },
];

export default function Festivals() {
  return (
    <section id="festivals" className="section-pad relative festivals-bg">
      <div className="container-temple">
        <SectionHeading
          eyebrow="Celebrations"
          title="Temple Festivals"
          subtitle="Throughout the year, the temple comes alive with color, kirtan, feasting and devotion."
          light
        />

        <Stagger
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-8"
          staggerChildren={0.1}
        >
          {FESTIVALS.map((festival) => (
            <StaggerItem key={festival.title}>
              <article className="group relative h-full overflow-hidden rounded-[1.5rem] shadow-card ring-1 ring-gold/15">
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  <FallbackImage
                    src={festival.src}
                    alt={`${festival.title} at Hariboll Mandir`}
                    label={festival.title}
                    palette={festival.palette}
                    className="h-full w-full object-cover transition-transform duration-[1300ms] ease-devotional group-hover:scale-110"
                  />
                  {/* legibility gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/90 via-maroon-dark/25 to-transparent" />
                </div>

                {/* content */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="font-body text-[10px] uppercase tracking-widest2 text-gold-light">
                    {festival.when}
                  </span>
                  <h3 className="mt-2 font-heading text-2xl font-semibold text-cream">
                    {festival.title}
                  </h3>
                  <div className="mt-3 h-px w-10 origin-left scale-x-100 bg-gold/70 transition-all duration-500 ease-devotional group-hover:w-16" />
                  <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-cream/80">
                    {festival.blurb}
                  </p>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
