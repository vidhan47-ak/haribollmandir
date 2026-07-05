import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Homepage invitation band that links out to the dedicated Gaudiya Heritage
 * page. Replaces the former "Harinam, Darshan & Seva" section but keeps
 * id="seva" so existing anchor links (the Hero CTA and the footer) still land
 * here.
 */
export default function HeritageCallout() {
  return (
    <section id="seva" className="section-pad relative overflow-hidden">
      <div className="pattern-peacock pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="container-temple relative">
        <SectionHeading
          eyebrow="The Path of Devotion"
          title="Harinam, Bhakti & Seva"
          subtitle="The living heritage of Gaudiya Vaishnavism — the path of the Holy Name, loving devotion and selfless service, flowing from Sree Chaitanya Mahaprabhu to our temple today."
        />

        <Reveal>
          <div className="mt-12 flex flex-col items-center gap-7 text-center">
            <p className="max-w-2xl font-body text-[15px] leading-relaxed text-ink-soft">
              Discover the sacred lineage, the acharyas and the timeless
              teachings that carry this tradition of divine love — and how our
              mandir keeps it alive through darshan, kirtan, festivals and seva.
            </p>
            <Link href="/gaudiya-heritage" className="btn-gold">
              Explore Our Gaudiya Heritage
              <span aria-hidden="true" className="text-lg leading-none">
                →
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
