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

export default function Home() {
  return (
    <>
      <CursorGlow />
      <HashScroll />
      <main>
        <Hero />
        <Darshan />
        <QuoteBand
          quote="The Holy Name is the sweetest gift of this age — chant it, and the heart awakens."
          subquote="Sri Chaitanya Mahaprabhu's ocean of mercy."
          imageSrc={quoteBandImages.harinam.src}
          imageLabel={quoteBandImages.harinam.label}
          imagePalette={quoteBandImages.harinam.palette}
          tone="gold"
        />
        <About />
        <QuoteBand
          quote="A temple is not built of stone alone, but of the love that gathers within it."
          subquote="Every soul is welcome at the Lord's door."
          imageSrc={quoteBandImages.temple.src}
          imageLabel={quoteBandImages.temple.label}
          imagePalette={quoteBandImages.temple.palette}
          tone="forest"
        />
        <HeritageCallout />
        <QuoteBand
          quote="Seva offered with love turns the smallest act into worship."
          subquote="In service, the restless heart finds its shelter."
          imageSrc={quoteBandImages.seva.src}
          imageLabel={quoteBandImages.seva.label}
          imagePalette={quoteBandImages.seva.palette}
          tone="maroon"
        />
        <Festivals />
        <QuoteBand
          quote="Every festival is the soul remembering its eternal home."
          subquote="Joy, offered before the Lord, only grows."
          imageSrc={quoteBandImages.festival.src}
          imageLabel={quoteBandImages.festival.label}
          imagePalette={quoteBandImages.festival.palette}
          tone="gold"
        />
        <Gallery />
        <QuoteBand
          quote="Their darshan does not change the world around us; it changes the world within us."
          subquote="Mahaprabhu's mercy leads us to Radha-Madhav."
          imageSrc={quoteBandImages.darshan.src}
          imageLabel={quoteBandImages.darshan.label}
          imagePalette={quoteBandImages.darshan.palette}
          tone="maroon"
        />
        <VisitUs />
      </main>
      <Footer />
    </>
  );
}
