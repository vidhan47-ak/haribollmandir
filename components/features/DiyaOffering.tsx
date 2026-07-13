"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function DiyaOffering({ lang }: { lang: "en" | "hi" }) {
  const [open, setOpen] = useState(false);
  const [offered, setOffered] = useState(false);
  const reduce = useReducedMotion();

  const offer = () => {
    setOffered(true);
    try {
      const key = "hariboll-diya-offerings";
      const count = Number(window.localStorage.getItem(key) || 0) + 1;
      window.localStorage.setItem(key, String(count));
    } catch {
      // The visual offering remains available when storage is restricted.
    }
  };

  const close = () => {
    setOpen(false);
    window.setTimeout(() => setOffered(false), 300);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold-light/50 bg-black/15 px-4 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-light transition hover:border-gold-light hover:bg-black/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
      >
        <span aria-hidden="true">🪔</span>
        {lang === "hi" ? "दीप अर्पित करें" : "Offer a Diya"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[#16090b]/80 p-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={lang === "hi" ? "आभासी दीप अर्पण" : "Virtual diya offering"}
            onClick={close}
          >
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
              animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-gold/35 bg-[radial-gradient(circle_at_50%_15%,#7c4023_0%,#4a1219_48%,#230b10_100%)] px-6 py-10 text-center text-cream shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)] sm:px-10"
            >
              <button onClick={close} className="absolute right-4 top-4 rounded-full px-3 py-2 text-cream/60 transition hover:text-cream" aria-label="Close diya offering">×</button>

              <div className={`diya-scene mx-auto ${offered ? "is-offered" : ""}`} aria-hidden="true">
                <div className="diya-halo" />
                <div className="diya-flame" />
                <div className="diya-wick" />
                <div className="diya-bowl" />
                {offered && [0, 1, 2, 3, 4, 5].map((petal) => <i className={`diya-petal diya-petal-${petal}`} key={petal} />)}
              </div>

              <p className="mt-7 font-body text-[10px] font-medium uppercase tracking-widest2 text-gold-light">
                {lang === "hi" ? "कार्तिक दीपदान" : "Kartik Deep Daan"}
              </p>
              <h3 className="mt-3 font-heading text-2xl font-semibold sm:text-3xl">
                {offered
                  ? (lang === "hi" ? "आपका दीप अर्पित हुआ" : "Your diya has been offered")
                  : (lang === "hi" ? "श्री दामोदर को दीप अर्पित करें" : "Offer a lamp to Sri Damodar")}
              </h3>
              <p className="mx-auto mt-3 max-w-sm font-body text-sm leading-relaxed text-cream/70">
                {offered
                  ? (lang === "hi" ? "यह विनम्र अर्पण श्री श्री राधा माधव के चरणों में समर्पित हो।" : "May this humble offering rest at the lotus feet of Sri Sri Radha Madhav.")
                  : (lang === "hi" ? "एक शांत क्षण लें, प्रार्थना करें और भक्ति भाव से दीप प्रज्वलित करें।" : "Pause for a quiet prayer, then light this lamp with devotion.")}
              </p>

              {!offered ? (
                <button onClick={offer} className="btn-gold mt-7">
                  {lang === "hi" ? "दीप प्रज्वलित करें" : "Light the Diya"}
                </button>
              ) : (
                <button onClick={close} className="btn-outline mt-7">
                  {lang === "hi" ? "हरिबोल" : "Haribol"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

