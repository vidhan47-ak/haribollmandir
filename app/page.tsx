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
import HashScroll from "@/components/ui/HashScroll";
import { quoteBandImages } from "@/lib/images";
import { useLang } from "@/lib/i18n";
import ParallaxScene from "@/components/ui/ParallaxScene";
import CeremonialDivider from "@/components/ui/CeremonialDivider";
import ScrollStretchScene from "@/components/ui/ScrollStretchScene";

export default function Home() {
  const { t } = useLang();
  return (
    <>
      <HashScroll />
      <main className="scroll-stretch-stack">
        <ScrollStretchScene index={0} first>
          <ParallaxScene amount={42} mobileAmount={0}><Hero /></ParallaxScene>
        </ScrollStretchScene>
        <ScrollStretchScene index={1}>
          <ParallaxScene><Darshan /></ParallaxScene>
        </ScrollStretchScene>
        <ScrollStretchScene index={2}>
          <QuoteBand
            quote={t.quotes.harinam.quote}
            subquote={t.quotes.harinam.subquote}
            imageSrc={quoteBandImages.harinam.src}
            imageLabel={quoteBandImages.harinam.label}
            imagePalette={quoteBandImages.harinam.palette}
            tone="gold"
          />
        </ScrollStretchScene>
        <ScrollStretchScene index={3}>
          <CeremonialDivider />
          <ParallaxScene><About /></ParallaxScene>
        </ScrollStretchScene>
        <ScrollStretchScene index={4}>
          <QuoteBand
            quote={t.quotes.temple.quote}
            subquote={t.quotes.temple.subquote}
            imageSrc={quoteBandImages.temple.src}
            imageLabel={quoteBandImages.temple.label}
            imagePalette={quoteBandImages.temple.palette}
            tone="forest"
          />
        </ScrollStretchScene>
        <ScrollStretchScene index={5}>
          <CeremonialDivider />
          <ParallaxScene><HeritageCallout /></ParallaxScene>
        </ScrollStretchScene>
        <ScrollStretchScene index={6}>
          <QuoteBand
            quote={t.quotes.seva.quote}
            subquote={t.quotes.seva.subquote}
            imageSrc={quoteBandImages.seva.src}
            imageLabel={quoteBandImages.seva.label}
            imagePalette={quoteBandImages.seva.palette}
            tone="maroon"
          />
        </ScrollStretchScene>
        <ScrollStretchScene index={7}>
          <CeremonialDivider />
          <ParallaxScene><Festivals /></ParallaxScene>
        </ScrollStretchScene>
        <ScrollStretchScene index={8}>
          <QuoteBand
            quote={t.quotes.festival.quote}
            subquote={t.quotes.festival.subquote}
            imageSrc={quoteBandImages.festival.src}
            imageLabel={quoteBandImages.festival.label}
            imagePalette={quoteBandImages.festival.palette}
            tone="gold"
          />
        </ScrollStretchScene>
        <ScrollStretchScene index={9}>
          <CeremonialDivider />
          <ParallaxScene><Gallery /></ParallaxScene>
        </ScrollStretchScene>
        <ScrollStretchScene index={10}>
          <QuoteBand
            quote={t.quotes.darshan.quote}
            subquote={t.quotes.darshan.subquote}
            imageSrc={quoteBandImages.darshan.src}
            imageLabel={quoteBandImages.darshan.label}
            imagePalette={quoteBandImages.darshan.palette}
            tone="maroon"
            focusRight
          />
        </ScrollStretchScene>
        <ScrollStretchScene index={11}>
          <CeremonialDivider />
          <ParallaxScene><VisitUs /></ParallaxScene>
        </ScrollStretchScene>
      </main>
      <Footer />
    </>
  );
}
