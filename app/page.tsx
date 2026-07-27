"use client";

import Hero from "@/components/sections/Hero";
import Darshan from "@/components/sections/Darshan";
import About from "@/components/sections/About";
import HeritageCallout from "@/components/sections/HeritageCallout";
import Festivals from "@/components/sections/Festivals";
import QuoteBand from "@/components/sections/QuoteBand";
import MagneticGallery from "@/components/sections/MagneticGallery";
import VisitUs from "@/components/sections/VisitUs";
import Footer from "@/components/sections/Footer";
import HashScroll from "@/components/ui/HashScroll";
import DailyBhaktiCompanion from "@/components/features/DailyBhaktiCompanion";
import { quoteBandImages } from "@/lib/images";
import { useLang } from "@/lib/i18n";
import ParallaxScene from "@/components/ui/ParallaxScene";
import CeremonialDivider from "@/components/ui/CeremonialDivider";
import SectionMoods from "@/components/features/SectionMoods";

export default function Home() {
  const { t } = useLang();
  return (
    <>
      <HashScroll />
      <SectionMoods />
      <main>
        <Hero />
        <ParallaxScene><Darshan /></ParallaxScene>
        <QuoteBand
          quote={t.quotes.harinam.quote}
          subquote={t.quotes.harinam.subquote}
          imageSrc={quoteBandImages.harinam.src}
          imageLabel={quoteBandImages.harinam.label}
          imagePalette={quoteBandImages.harinam.palette}
          tone="gold"
        />
        <CeremonialDivider />
        <DailyBhaktiCompanion />
        <CeremonialDivider />
        <ParallaxScene><About /></ParallaxScene>
        <QuoteBand
          quote={t.quotes.temple.quote}
          subquote={t.quotes.temple.subquote}
          imageSrc={quoteBandImages.temple.src}
          imageLabel={quoteBandImages.temple.label}
          imagePalette={quoteBandImages.temple.palette}
          tone="forest"
        />
        <CeremonialDivider />
        <ParallaxScene><HeritageCallout /></ParallaxScene>
        <QuoteBand
          quote={t.quotes.seva.quote}
          subquote={t.quotes.seva.subquote}
          imageSrc={quoteBandImages.seva.src}
          imageLabel={quoteBandImages.seva.label}
          imagePalette={quoteBandImages.seva.palette}
          tone="maroon"
        />
        <CeremonialDivider />
        <ParallaxScene><Festivals /></ParallaxScene>
        <QuoteBand
          quote={t.quotes.festival.quote}
          subquote={t.quotes.festival.subquote}
          imageSrc={quoteBandImages.festival.src}
          imageLabel={quoteBandImages.festival.label}
          imagePalette={quoteBandImages.festival.palette}
          tone="gold"
        />
        <CeremonialDivider />
        <ParallaxScene><MagneticGallery /></ParallaxScene>
        <QuoteBand
          quote={t.quotes.darshan.quote}
          subquote={t.quotes.darshan.subquote}
          imageSrc={quoteBandImages.darshan.src}
          imageLabel={quoteBandImages.darshan.label}
          imagePalette={quoteBandImages.darshan.palette}
          tone="maroon"
          focusRight
        />
        <CeremonialDivider />
        <ParallaxScene><VisitUs /></ParallaxScene>
      </main>
      <Footer />
    </>
  );
}
