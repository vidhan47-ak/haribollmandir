"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import {
  TEMPLE_EMAIL,
  TEMPLE_LINKS,
  aaratiScheduleLine,
  darshanTimings,
  templeAddressLine,
} from "@/lib/temple";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

/**
 * Key read by public/offline.html. The offline page is plain static HTML and
 * cannot import lib/temple.ts, so rather than keep a fourth hardcoded copy of
 * the timings it reads this snapshot — written on every visit while online.
 */
const OFFLINE_INFO_KEY = "hariboll-temple-info";

const INSTALL_COPY = {
  en: {
    title: "Keep Hariboll Mandir close",
    body: "Install for quick access and offline temple timings.",
    action: "Install Mandir App",
    dismiss: "Dismiss install suggestion",
  },
  hi: {
    title: "हरिबोल मंदिर सदा निकट रखें",
    body: "शीघ्र दर्शन एवं ऑफ़लाइन मंदिर समय हेतु इंस्टॉल करें।",
    action: "मंदिर ऐप इंस्टॉल करें",
    dismiss: "सुझाव बंद करें",
  },
} as const;

export default function PWAClient() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const { lang } = useLang();
  const copy = INSTALL_COPY[lang];

  // Keep the offline page's temple essentials fresh from the canonical source.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        OFFLINE_INFO_KEY,
        JSON.stringify({
          lang,
          address: templeAddressLine(lang),
          timings: darshanTimings(lang),
          aarati: aaratiScheduleLine(lang),
          email: TEMPLE_EMAIL,
          links: TEMPLE_LINKS.filter((l) => l.id !== "email").map((l) => ({
            label: lang === "hi" ? l.labelHi : l.label,
            href: l.href,
          })),
        }),
      );
    } catch {
      // Offline page falls back to its neutral message when storage is blocked.
    }
  }, [lang]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const resetDevelopmentPwa = async () => {
        const wasControlled = "serviceWorker" in navigator && Boolean(navigator.serviceWorker.controller);

        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }

        if ("caches" in window) {
          const keys = await window.caches.keys();
          await Promise.all(
            keys
              .filter((key) => key.startsWith("hariboll-mandir-"))
              .map((key) => window.caches.delete(key)),
          );
        }

        if (wasControlled && window.sessionStorage.getItem("hariboll-dev-pwa-reset") !== "1") {
          window.sessionStorage.setItem("hariboll-dev-pwa-reset", "1");
          window.location.reload();
        } else if (!wasControlled) {
          window.sessionStorage.removeItem("hariboll-dev-pwa-reset");
        }
      };

      void resetDevelopmentPwa();
    } else if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => registration.update())
        .catch(() => undefined);
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
      if (window.localStorage.getItem("hariboll-install-dismissed") !== "1") {
        setVisible(true);
      }
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem("hariboll-install-dismissed", "1");
    } catch {
      // Dismissal is session-only when storage is unavailable.
    }
  };

  return (
    <AnimatePresence>
      {visible && prompt && (
        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-20 right-4 z-[65] w-[min(88vw,320px)] rounded-2xl border border-gold/35 bg-[#fff8e8]/95 p-4 shadow-2xl backdrop-blur-md"
        >
          <button onClick={dismiss} className="absolute right-2 top-1 px-2 py-1 text-ink-muted" aria-label={copy.dismiss}>×</button>
          <div className="flex items-center gap-3 pr-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="" className="h-11 w-11 rounded-full" />
            <div>
              <p className="font-heading text-base font-semibold text-maroon">{copy.title}</p>
              <p className="mt-0.5 font-body text-[10px] leading-relaxed text-ink-soft">{copy.body}</p>
            </div>
          </div>
          <button onClick={install} className="mt-3 w-full rounded-full bg-maroon px-4 py-2.5 font-body text-xs font-semibold text-cream transition-colors duration-200 hover:bg-maroon-dark">
            {copy.action}
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
