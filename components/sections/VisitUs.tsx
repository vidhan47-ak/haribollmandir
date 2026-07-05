import SectionHeading from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const MAPS_QUERY =
  "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir Pratap Bagh Jalandhar Punjab";
const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  MAPS_QUERY,
)}`;
const MAP_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(
  MAPS_QUERY,
)}&z=15&output=embed`;
const INSTAGRAM_URL = "https://instagram.com/hariboll_mandir";

const TIMINGS = [
  { label: "Morning Darshan", value: "6:00 AM – 11:00 AM" },
  { label: "Evening Darshan", value: "5:00 PM – 9:00 PM" },
];

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.4-7-11a7 7 0 1 1 14 0c0 4.6-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export default function VisitUs() {
  return (
    <section id="visit" className="section-pad relative visit-bg">
      <div className="container-temple">
        <SectionHeading
          eyebrow="Come, Take Shelter"
          title="Visit Hariboll Mandir"
          subtitle="Devotees are warmly welcomed for darshan, kirtan and prasadam. We look forward to serving you."
        />

        <div className="mt-16 overflow-hidden rounded-[2rem] border border-gold/25 bg-cream-50 shadow-soft lg:mt-20">
          <div className="grid lg:grid-cols-2">
            {/* Info */}
            <Reveal className="p-8 sm:p-12 lg:p-14">
              <div className="flex items-start gap-4">
                <span className="mt-1 text-gold-deep">
                  <PinIcon />
                </span>
                <div>
                  <h3 className="font-heading text-2xl font-semibold text-maroon">
                    Sree Chaitanya Mahaprabhu
                    <br />
                    Sree Radha Madhav Mandir
                  </h3>
                  <p className="mt-3 font-body text-base leading-relaxed text-ink-soft">
                    Pratap Bagh, Jalandhar,
                    <br />
                    Punjab, India
                  </p>
                </div>
              </div>

              <div className="my-8 h-px w-full bg-gradient-to-r from-gold/40 to-transparent" />

              <div className="flex items-start gap-4">
                <span className="mt-1 text-gold-deep">
                  <ClockIcon />
                </span>
                <div className="w-full">
                  <p className="font-body text-xs uppercase tracking-widest2 text-gold-deep">
                    Darshan Timings
                  </p>
                  <ul className="mt-3 space-y-2">
                    {TIMINGS.map((t) => (
                      <li
                        key={t.label}
                        className="flex items-center justify-between gap-4 font-body text-[15px] text-ink"
                      >
                        <span className="text-ink-soft">{t.label}</span>
                        <span className="font-medium">{t.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold"
                >
                  Get Directions
                </a>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline-dark"
                >
                  Contact Temple
                </a>
              </div>
            </Reveal>

            {/* Map */}
            <div className="relative min-h-[320px] bg-forest/5 lg:min-h-full">
              {/* decorative placeholder shown behind the map */}
              <div className="pattern-peacock absolute inset-0 opacity-70" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-forest/50">
                <PinIcon />
                <span className="font-body text-xs uppercase tracking-widest2">
                  Pratap Bagh, Jalandhar
                </span>
              </div>
              <iframe
                title="Map to Hariboll Mandir, Pratap Bagh, Jalandhar"
                src={MAP_EMBED_URL}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
