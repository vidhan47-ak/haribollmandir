import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import HeritageSection from "@/components/heritage/HeritageSection";
import Footer from "@/components/sections/Footer";
import CursorGlow from "@/components/ui/CursorGlow";
import { heritageImages, type Palette } from "@/lib/images";

export const metadata: Metadata = {
  title: "Gaudiya Vaishnavism & Our Spiritual Heritage | Hariboll Mandir",
  description:
    "Discover the sacred heritage of Gaudiya Vaishnavism at Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir, Jalandhar — the path of Harinam, bhakti and seva flowing from Sree Chaitanya Mahaprabhu through the Gaudiya Vaishnav acharyas.",
};

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

type Block = {
  index: string;
  side: "left" | "right";
  title: string;
  paras: string[];
  image: { src: string; label: string; palette: Palette };
};

const BLOCKS: Block[] = [
  {
    index: "01",
    side: "left",
    title: "How Gaudiya Vaishnavism Began",
    image: heritageImages.origins,
    paras: [
      "Gaudiya Vaishnavism began with the divine appearance and teachings of Sree Chaitanya Mahaprabhu, who revealed the path of pure devotion through Harinam Sankirtan — the congregational chanting of the holy names of the Lord.",
      "Sree Chaitanya Mahaprabhu taught that the highest goal of life is loving devotional service to Sree Sree Radha-Krishna. His message was simple, deep and universal: chant the holy names, serve with humility, associate with devotees, and develop pure love for the Supreme Lord.",
      "From Navadvip and Puri, this movement of divine love spread through the efforts of Mahaprabhu's associates, especially the Six Goswamis of Vrindavan, who preserved and explained the teachings of bhakti through scripture, worship and spiritual practice.",
    ],
  },
  {
    index: "02",
    side: "right",
    title: "Srila Prabhupad and the Revival of the Gaudiya Mission",
    image: heritageImages.prabhupad,
    paras: [
      "In the modern age, Srila Bhaktisiddhanta Saraswati Goswami Prabhupad powerfully revived and organized the preaching mission of Sree Chaitanya Mahaprabhu. He dedicated his life to spreading pure bhakti, Harinam Sankirtan, Vaishnav seva and the teachings of Sree Sree Radha-Krishna.",
      "Srila Prabhupad taught that spiritual life should be practiced with sincerity, discipline, humility and proper understanding of scripture. He emphasized the importance of chanting the holy names, serving Guru and Vaishnavas, studying devotional scriptures and sharing Mahaprabhu's message with society.",
      "Through his fearless preaching, writings and the establishment of the Gaudiya Math mission, he inspired many devotees to dedicate their lives to the service of Sree Guru, Gauranga and Krishna. His vision gave a strong foundation for spreading Gaudiya Vaishnavism in a systematic and powerful way.",
      "Sree Chaitanya Gaudiya Math continues this sacred current of devotion, carrying forward the teachings of Sree Chaitanya Mahaprabhu as presented by Srila Prabhupad and the Gaudiya Vaishnav acharyas.",
    ],
  },
  {
    index: "03",
    side: "left",
    title: "Param Gurudev Srila Bhakti Dayita Madhav Goswami Maharaj",
    image: heritageImages.paramGurudev,
    paras: [
      "Srila Bhakti Dayita Madhav Goswami Maharaj, the Founder-Acharya of Sree Chaitanya Gaudiya Math, carried forward the divine mission of Sree Chaitanya Mahaprabhu with deep faith, humility and powerful preaching.",
      "He was a dear disciple of Srila Bhaktisiddhanta Saraswati Goswami Prabhupad and dedicated his life to spreading Harinam Sankirtan, pure bhakti, Vaishnav seva and the teachings of Sree Sree Radha-Krishna.",
      "With great compassion, he travelled and preached the message of Mahaprabhu in different parts of India, inspiring countless souls to follow the path of devotion. He established Sree Chaitanya Gaudiya Math as a spiritual institution for preserving and spreading the pure teachings of the Gaudiya Vaishnav parampara.",
      "For devotees, Srila Bhakti Dayita Madhav Goswami Maharaj is remembered as Param Gurudev — a powerful acharya whose life was fully dedicated to the service of Sree Guru, Gauranga and Krishna.",
    ],
  },
  {
    index: "04",
    side: "right",
    title: "Gurudev Srila Bhakti Ballabh Tirtha Goswami Maharaj",
    image: heritageImages.gurudev,
    paras: [
      "Srila Bhakti Ballabh Tirtha Goswami Maharaj continued the sacred mission of his Gurudev, Srila Bhakti Dayita Madhav Goswami Maharaj, with great devotion, scholarship and compassion.",
      "As a revered acharya of the Gaudiya Vaishnav tradition, he guided devotees toward sincere spiritual practice, Harinam, Vaishnav seva and surrender to Sree Guru and Krishna. His teachings inspired devotees to live a life centered on humility, devotion, service and remembrance of the Supreme Lord.",
      "He served as the President of Sree Chaitanya Gaudiya Math and helped spread Mahaprabhu's message through hari-katha, kirtan, spiritual guidance and devotional service.",
      "For devotees, Srila Bhakti Ballabh Tirtha Goswami Maharaj is remembered as Gurudev — a merciful spiritual master who carried forward the current of pure bhakti received from the Gaudiya Vaishnav acharyas.",
    ],
  },
  {
    index: "05",
    side: "left",
    title: "Core Teachings of Gaudiya Vaishnavism",
    image: heritageImages.teachings,
    paras: [
      "The heart of Gaudiya Vaishnavism is bhakti — loving devotion to Sree Krishna under the shelter of Sreemati Radharani. It teaches that the soul is eternally connected with the Supreme Lord and finds true happiness through devotion, seva and remembrance of the Lord.",
      "The tradition gives special importance to Harinam Sankirtan, temple worship, Vaishnav seva, study of scriptures, festivals, prasadam distribution and a humble life centered around devotion.",
      "Its philosophy is known as Achintya Bheda-Abheda, meaning the soul is simultaneously one with and different from the Supreme Lord in an inconceivable way. This teaching helps devotees understand their eternal relationship with the Lord while remaining humble servants of His divine will.",
    ],
  },
  {
    index: "06",
    side: "right",
    title: "About Sree Chaitanya Gaudiya Math",
    image: heritageImages.math,
    paras: [
      "Sree Chaitanya Gaudiya Math continues the preaching mission of Sree Chaitanya Mahaprabhu through the line of Gaudiya Vaishnav acharyas.",
      "The Math is dedicated to spreading Harinam, devotional knowledge, deity worship, Vaishnav culture and the teachings of pure bhakti. Through temples, festivals, spiritual discourses, publications and seva activities, it guides devotees toward a life of devotion and surrender.",
      "The mission carries forward the mood of compassion given by Sree Chaitanya Mahaprabhu — to share Krishna-bhakti with everyone, without discrimination, through humility, service and the chanting of the holy names.",
    ],
  },
  {
    index: "07",
    side: "left",
    title: "Our Mandir's Connection",
    image: heritageImages.mandir,
    paras: [
      "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir is a sacred place where this Gaudiya Vaishnav tradition is practiced through daily darshan, kirtan, seva, festivals and spiritual association.",
      "Here, devotees come together to receive the blessings of Sree Guru, Gauranga and Sree Sree Radha Madhav. The temple is not only a place of worship, but also a spiritual home where hearts are purified through Harinam, devotion and service.",
      "Our aim is to preserve and share this divine heritage with future generations, creating a peaceful atmosphere where everyone can connect with bhakti and experience the mercy of Mahaprabhu.",
    ],
  },
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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GaudiyaHeritagePage() {
  return (
    <>
      <CursorGlow />
      <main>
        {/* ---------------- HERO band ---------------- */}
        <section className="relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-36 lg:pb-24 lg:pt-44">
          <div className="pattern-floral pointer-events-none absolute inset-0 opacity-40" />
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />

          <div className="container-temple relative text-center">
            <Reveal>
              <span className="eyebrow justify-center font-display">
                Gaudiya Heritage
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mx-auto mt-6 max-w-4xl font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-teal-dark sm:text-5xl lg:text-6xl">
                Gaudiya Vaishnavism &amp; Our Spiritual Heritage
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="divider-lotus mt-8" />
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mx-auto mt-7 max-w-2xl font-body text-base leading-relaxed text-ink-soft sm:text-lg">
                A sacred tradition of Harinam, Bhakti, Seva and divine love,
                flowing from Sree Chaitanya Mahaprabhu to the Gaudiya Vaishnav
                parampara.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- SEVEN heritage blocks ---------------- */}
        <section className="relative pb-20 lg:pb-56">
          <div className="container-temple space-y-6 lg:space-y-8">
            {BLOCKS.map((block) => (
              <HeritageSection
                key={block.index}
                index={block.index}
                side={block.side}
                title={block.title}
                imageSrc={block.image.src}
                imageLabel={block.image.label}
                imagePalette={block.image.palette}
              >
                <Paragraphs items={block.paras} />
              </HeritageSection>
            ))}
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
                Gaudiya Vaishnavism is a sacred path of divine love, given by
                Sree Chaitanya Mahaprabhu and carried forward by the Gaudiya
                Vaishnav acharyas. Through Harinam, darshan, seva, festivals and
                spiritual association, Sree Chaitanya Mahaprabhu Sree Radha
                Madhav Mandir continues this beautiful tradition and welcomes
                everyone to experience the mercy of Sree Guru, Gauranga and Sree
                Sree Radha Madhav.
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
