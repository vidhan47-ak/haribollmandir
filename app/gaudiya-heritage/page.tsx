import type { Metadata } from "next";
import Footer from "@/components/sections/Footer";
import HeritageContent from "@/components/heritage/HeritageContent";

export const metadata: Metadata = {
  title: "Gaudiya Vaishnavism & Our Spiritual Heritage | Hariboll Mandir",
  description:
    "Discover the sacred heritage of Gaudiya Vaishnavism at Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir, Jalandhar — the path of Harinam, bhakti and seva flowing from Sree Chaitanya Mahaprabhu through the Gaudiya Vaishnav acharyas.",
};

export default function GaudiyaHeritagePage() {
  return (
    <>
      <HeritageContent />
      <Footer />
    </>
  );
}
