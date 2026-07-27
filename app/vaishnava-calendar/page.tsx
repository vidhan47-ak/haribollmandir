import type { Metadata } from "next";
import Footer from "@/components/sections/Footer";
import VaishnavaCalendar from "@/components/features/VaishnavaCalendar";

export const metadata: Metadata = {
  title: "Vaishnava Calendar (Gaudiya Panchang) | Hariboll Mandir, Jalandhar",
  description:
    "The Gaudiya Vaishnava calendar for Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir, Jalandhar — Ekadashi fasting days, festivals, and the appearance and disappearance days of the acharyas, arranged month by month for the current Gaurabda.",
};

export default function VaishnavaCalendarPage() {
  return (
    <>
      <VaishnavaCalendar />
      <Footer />
    </>
  );
}
