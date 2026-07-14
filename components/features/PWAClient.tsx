"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAClient() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
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
          <button onClick={dismiss} className="absolute right-2 top-1 px-2 py-1 text-ink-muted" aria-label="Dismiss install suggestion">×</button>
          <div className="flex items-center gap-3 pr-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="" className="h-11 w-11 rounded-full" />
            <div>
              <p className="font-heading text-base font-semibold text-maroon">Keep Hariboll Mandir close</p>
              <p className="mt-0.5 font-body text-[10px] leading-relaxed text-ink-soft">Install for quick access and offline temple timings.</p>
            </div>
          </div>
          <button onClick={install} className="mt-3 w-full rounded-full bg-maroon px-4 py-2.5 font-body text-xs font-semibold text-cream transition hover:bg-maroon-dark">
            Install Mandir App
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
