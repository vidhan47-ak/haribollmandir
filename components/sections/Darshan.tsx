import SectionHeading from "@/components/ui/SectionHeading";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { images } from "@/lib/images";

const DARSHAN = [
  {
    img: images.mahaprabhu,
    name: "Sri Chaitanya Mahaprabhu",
    text: "The golden ocean of mercy, who came in Kali-yuga to give Krishna through Harinam.",
  },
  {
    img: images.radhaMadhav,
    name: "Sri Sri Radha Madhav Ji",
    text: "The heart of the temple, where every darshan becomes shelter and every prayer becomes seva.",
  },
  {
    img: images.radhaRani,
    name: "Sri Radha Rani",
    text: "The merciful shelter who gently carries our prayers to Krishna.",
  },
];

export default function Darshan() {
  return (
    <section id="darshan" className="section-pad relative">
      <div className="container-temple">
        <SectionHeading
          eyebrow="Divine Darshan"
          title="Behold the Lord of the Heart"
          subtitle="Come before the sacred forms worshipped at Hariboll Mandir and receive their loving glance."
        />

        <Stagger className="mt-16 grid gap-8 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-10">
          {DARSHAN.map((deity) => (
            <StaggerItem key={deity.name}>
              <article className="card-temple group h-full">
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <FallbackImage
                    src={deity.img.src}
                    alt={deity.img.alt}
                    label={deity.img.label}
                    palette={deity.img.palette}
                    className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-devotional group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-dark/45 via-transparent to-transparent opacity-70" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
                </div>

                {/* Text */}
                <div className="px-7 pb-9 pt-7 text-center">
                  <h3 className="font-heading text-2xl font-semibold text-maroon">
                    {deity.name}
                  </h3>
                  <div className="divider-lotus mt-4" />
                  <p className="mt-5 font-body text-[15px] leading-relaxed text-ink-soft">
                    {deity.text}
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
