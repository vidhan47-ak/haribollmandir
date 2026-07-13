"use client";

import Hero from "@/components/sections/Hero";
import Darshan from "@/components/sections/Darshan";
import About from "@/components/sections/About";
import HeritageCallout from "@/components/sections/HeritageCallout";
import Festivals from "@/components/sections/Festivals";
import QuoteBand from "@/components/sections/QuoteBand";
import Gallery from "@/components/sections/Gallery";
import VisitUs from "@/components/sections/VisitUs";
import Footer from "@/components/sections/Footer";
import CursorGlow from "@/components/ui/CursorGlow";
import HashScroll from "@/components/ui/HashScroll";
import { quoteBandImages } from "@/lib/images";
import { useLang } from "@/lib/i18n";
import LiveDarshanPlayer from "@/components/features/LiveDarshanPlayer";

export default function Home() {
  const { t } = useLang();
  return (
    <>
      <CursorGlow />
      <HashScroll />
      <main>
        <Hero />
        <Darshan />
        <QuoteBand
          quote={t.quotes.harinam.quote}
          subquote={t.quotes.harinam.subquote}
          imageSrc={quoteBandImages.harinam.src}
          imageLabel={quoteBandImages.harinam.label}
          imagePalette={quoteBandImages.harinam.palette}
          tone="gold"
        />
        <About />
        <QuoteBand
          quote={t.quotes.temple.quote}
          subquote={t.quotes.temple.subquote}
          imageSrc={quoteBandImages.temple.src}
          imageLabel={quoteBandImages.temple.label}
          imagePalette={quoteBandImages.temple.palette}
          tone="forest"
        />
        <HeritageCallout />
        <QuoteBand
          quote={t.quotes.seva.quote}
          subquote={t.quotes.seva.subquote}
          imageSrc={quoteBandImages.seva.src}
          imageLabel={quoteBandImages.seva.label}
          imagePalette={quoteBandImages.seva.palette}
          tone="maroon"
        />
        <Festivals />
        <QuoteBand
          quote={t.quotes.festival.quote}
          subquote={t.quotes.festival.subquote}
          imageSrc={quoteBandImages.festival.src}
          imageLabel={quoteBandImages.festival.label}
          imagePalette={quoteBandImages.festival.palette}
          tone="gold"
        />
        <Gallery />
        <QuoteBand
          quote={t.quotes.darshan.quote}
          subquote={t.quotes.darshan.subquote}
          imageSrc={quoteBandImages.darshan.src}
          imageLabel={quoteBandImages.darshan.label}
          imagePalette={quoteBandImages.darshan.palette}
          tone="maroon"
        />
        <VisitUs />
      </main>
      <Footer />
      <LiveDarshanPlayer />
    </>
  );
}
