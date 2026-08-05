import type { Metadata, Viewport } from "next";
import {
  Playfair_Display,
  Cinzel,
  Inter,
  Handlee,
  Cormorant_Garamond,
  Plus_Jakarta_Sans,
  Laila,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import TulsiCursor from "@/components/ui/TulsiCursor";
import SacredParticles from "@/components/features/SacredParticles";
import { LanguageProvider } from "@/lib/i18n";
import PWAClient from "@/components/features/PWAClient";
import SadhanaDock from "@/components/features/SadhanaDock";
import { LotusTransitionProvider } from "@/components/ui/ViewTransitions";
import IntroVideoSplash from "@/components/features/IntroVideoSplash";

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

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

// Laila — the Devanagari heading face for Hindi (user-requested). SemiBold (600)
// is the primary heading weight; others are loaded for flexibility.
const laila = Laila({
  subsets: ["latin", "devanagari"],
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
    "A sacred home for Harinam, Darshan, Seva and Devotion in Pratap Bagh, Jalandhar. Experience the mercy of Sri Chaitanya Mahaprabhu and the loving shelter of Sri Sri Radha Madhav Ji.",
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
      "A sacred home for Harinam, Darshan, Seva and Devotion in Jalandhar.",
    type: "website",
    locale: "en_IN",
    siteName: "Hariboll Mandir",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Hariboll Mandir, Jalandhar" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hariboll Mandir, Jalandhar",
    description: "A sacred home for Harinam, Darshan, Seva and Devotion.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set the Jalandhar time-of-day state before first paint so the hero
            shows the correct backdrop regardless of the visitor's timezone.
            Keep the 4/12/18 boundaries in sync with lib/daypart.ts. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var h=parseInt(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kolkata",hour:"numeric",hour12:false}).format(new Date()),10);if(h===24)h=0;var d=(h>=4&&h<12)?"day":(h>=12&&h<18)?"evening":"night";document.documentElement.setAttribute("data-daypart",d);}catch(e){document.documentElement.setAttribute("data-daypart","day");}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=window.sessionStorage.getItem("hariboll_intro_splash_seen_v1");var rm=window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(!s&&!rm){document.documentElement.classList.add("has-intro-splash");}}catch(e){}})();`,
          }}
        />
        {process.env.NODE_ENV !== "production" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(() => {
                const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
                if (!localHosts.has(window.location.hostname)) return;

                const registrations = "serviceWorker" in navigator
                  ? navigator.serviceWorker.getRegistrations()
                  : Promise.resolve([]);
                const cacheKeys = "caches" in window ? window.caches.keys() : Promise.resolve([]);

                Promise.all([registrations, cacheKeys])
                  .then(([workers, keys]) =>
                    Promise.all([
                      ...workers.map((worker) => worker.unregister()),
                      ...keys
                        .filter((key) => key.startsWith("hariboll-mandir-"))
                        .map((key) => window.caches.delete(key)),
                    ]),
                  )
                  .then(() => {
                    const resetKey = "hariboll-dev-pwa-bootstrap-reset";
                    if (navigator.serviceWorker?.controller && window.sessionStorage.getItem(resetKey) !== "1") {
                      window.sessionStorage.setItem(resetKey, "1");
                      window.location.reload();
                    } else if (!navigator.serviceWorker?.controller) {
                      window.sessionStorage.removeItem(resetKey);
                    }
                  })
                  .catch(() => undefined);
              })();`,
            }}
          />
        )}
      </head>
      <body
        className={`${playfair.variable} ${cinzel.variable} ${inter.variable} ${handlee.variable} ${cormorant.variable} ${jakarta.variable} ${laila.variable} ${notoSansDev.variable} font-body antialiased`}
      >
        <LanguageProvider>
          <IntroVideoSplash />
          <SmoothScroll>
            <SacredParticles />
            <LotusTransitionProvider
              centerLogoSrc="/images/logo.png"
              centerLogoSize="clamp(92px, 14vmin, 154px)"
            >
              <Navbar />
              {children}
              <SadhanaDock />
            </LotusTransitionProvider>
          </SmoothScroll>
          <TulsiCursor />
          <PWAClient />
        </LanguageProvider>
      </body>
    </html>
  );
}
