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
import { LanguageProvider } from "@/lib/i18n";
import PWAClient from "@/components/features/PWAClient";
import AmbientSoundscape from "@/components/features/AmbientSoundscape";

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
  metadataBase: new URL("https://hariboll-mandir-test.vidhanarora60.chatgpt.site"),
  title:
    "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir | Hariboll Mandir, Jalandhar",
  description:
    "A sacred home of Harinam, Darshan, Seva and Devotion in Pratap Bagh, Jalandhar. Experience the mercy of Sri Chaitanya Mahaprabhu and the loving shelter of Sri Sri Radha Madhav Ji.",
  manifest: "/manifest.webmanifest",
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
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Hariboll Mandir, Jalandhar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hariboll Mandir, Jalandhar",
    description: "A sacred home of Harinam, Darshan, Seva and Devotion.",
    images: ["/og.png"],
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
            <Navbar />
            {children}
          </SmoothScroll>
          <PWAClient />
          <AmbientSoundscape />
        </LanguageProvider>
      </body>
    </html>
  );
}
