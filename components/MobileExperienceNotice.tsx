"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hariboll-mobile-experience-dismissed";

export default function MobileExperienceNotice() {
  const [visible, setVisible] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const mobileViewport = window.matchMedia("(max-width: 820px)").matches;
    const touchDevice = window.matchMedia("(pointer: coarse)").matches;
    const mobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    setIsIOS(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    setVisible(
      mobileViewport &&
        (touchDevice || mobileAgent) &&
        sessionStorage.getItem(STORAGE_KEY) !== "true",
    );
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-maroon-dark/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-experience-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-gold/40 bg-[#fff8e8] shadow-[0_28px_80px_rgba(35,12,12,0.45)]">
        <div className="h-1.5 bg-gold-gradient" />
        <div className="p-6 text-center sm:p-8">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/35 bg-white text-2xl text-maroon" aria-hidden="true">
            ◇
          </span>
          <p className="mt-4 font-display text-[10px] font-semibold uppercase tracking-widest2 text-gold-deeper">
            Best viewing experience
          </p>
          <h2 id="mobile-experience-title" className="mt-3 font-heading text-3xl font-semibold leading-tight text-maroon-dark">
            View in Desktop Site mode
          </h2>
          <p className="mt-4 font-body text-sm leading-relaxed text-ink-soft">
            This devotional experience is designed for a wide screen. For the complete layout, open your browser&apos;s Desktop Site mode.
          </p>

          {showSteps && (
            <div className="mt-5 rounded-2xl border border-gold/25 bg-white/75 p-4 text-left font-body text-sm leading-relaxed text-ink">
              {isIOS ? (
                <p><strong>Safari:</strong> Tap <strong>aA</strong> in the address bar, then choose <strong>Request Desktop Website</strong>.</p>
              ) : (
                <p><strong>Chrome:</strong> Tap the <strong>⋮</strong> menu at the top-right, then select <strong>Desktop site</strong>.</p>
              )}
            </div>
          )}

          {!showSteps && (
            <button
              type="button"
              onClick={() => setShowSteps(true)}
              className="mt-6 w-full rounded-full bg-gold-gradient px-6 py-3.5 font-body text-sm font-semibold uppercase tracking-wider text-maroon-dark shadow-soft"
            >
              Show me how
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className={`${showSteps ? "mt-6" : "mt-3"} w-full rounded-full border border-maroon/25 px-6 py-3 font-body text-sm font-semibold text-maroon`}
          >
            Continue on mobile
          </button>
          <p className="mt-3 font-body text-[11px] text-ink-soft">
            This message appears once per browsing session.
          </p>
        </div>
      </div>
    </div>
  );
}
