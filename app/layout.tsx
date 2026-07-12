import type { Metadata, Viewport } from "next";
import {
  Playfair_Display,
  Cinzel,
  Inter,
  Handlee,
  Noto_Serif_Devanagari,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import TulsiCursor from "@/components/ui/TulsiCursor";
import ScrollProgress from "@/components/ui/ScrollProgress";
import { LanguageProvider } from "@/lib/i18n";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const handlee = Handlee({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-handlee",
  display: "swap",
});

const notoSerifDev = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hi-heading",
  display: "swap",
});

const notoSansDev = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-hi-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hariboll-mandir.example"),
  title:
    "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir | Hariboll Mandir, Jalandhar",
  description:
    "A sacred home of Harinam, Darshan, Seva and Devotion in Pratap Bagh, Jalandhar. Experience the mercy of Sri Chaitanya Mahaprabhu and the loving shelter of Sri Sri Radha Madhav Ji.",
  keywords: [
    "Hariboll Mandir",
    "Radha Madhav Mandir Jalandhar",
    "Sri Chaitanya Mahaprabhu",
    "Gaudiya Vaishnavism",
    "Harinam Sankirtan",
    "Darshan Jalandhar",
    "Pratap Bagh temple",
  ],
  authors: [{ name: "Hariboll Mandir" }],
  openGraph: {
    title: "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir",
    description:
      "A sacred home of Harinam, Darshan, Seva and Devotion in Jalandhar.",
    type: "website",
    locale: "en_IN",
    siteName: "Hariboll Mandir",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6E1E2A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${cinzel.variable} ${inter.variable} ${handlee.variable} ${notoSerifDev.variable} ${notoSansDev.variable} font-body antialiased`}
      >
        <LanguageProvider>
          <SmoothScroll>
            <ScrollProgress />
            <Navbar />
            {children}
          </SmoothScroll>
          <TulsiCursor />
        </LanguageProvider>
      </body>
    </html>
  );
}
