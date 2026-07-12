"use client";

import { useLang } from "@/lib/i18n";

export default function LanguageToggle({
  className = "",
}: {
  className?: string;
}) {
  const { lang, setLang } = useLang();

  const opt = (active: boolean) =>
    `inline-flex min-h-[40px] items-center justify-center rounded-full px-3 py-2 font-body text-xs font-semibold transition-colors duration-300 sm:min-h-0 sm:px-2.5 sm:py-1 ${
      active
        ? "bg-gold-gradient text-maroon-dark shadow-soft"
        : "opacity-70 hover:opacity-100"
    }`;

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex shrink-0 items-center rounded-full border border-gold/50 bg-white/15 p-0.5 ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={opt(lang === "en")}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("hi")}
        aria-pressed={lang === "hi"}
        className={opt(lang === "hi")}
      >
        हिं
      </button>
    </div>
  );
}
