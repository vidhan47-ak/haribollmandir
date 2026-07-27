import type { Metadata } from "next";
import { GranthaProvider } from "@/lib/grantha-store";

export const metadata: Metadata = {
  title: "Grantha Mandir — Sacred Library | Hariboll Mandir",
  description:
    "A timeless collection of Gaudiya Vaishnava literature, Bhagavat Patrika, sacred books, lectures and devotional wisdom — presented as a living reading experience.",
};

export default function GranthaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GranthaProvider>{children}</GranthaProvider>;
}
