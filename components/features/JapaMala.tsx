"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { spring } from "@/lib/springs";
import { useLang } from "@/lib/i18n";

/**
 * A digital japa mala: 108 beads around a ring, one tap per mantra. The
 * current bead glows, completed beads turn gold, and finished rounds are
 * kept in localStorage so a devotee's count survives the visit.
 */

const BEADS = 108;
const STORAGE_KEY = "hariboll-japa";
const GOAL_KEY = "hariboll-japa-goal";
const STREAK_KEY = "hariboll-japa-streak";
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type JapaState = { bead: number; rounds: number };

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function loadStreak(): { count: number; lastDate: string } {
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, lastDate: "" };
    return JSON.parse(raw);
  } catch {
    return { count: 0, lastDate: "" };
  }
}

function updateStreak(): number {
  try {
    const today = getTodayKey();
    const existing = loadStreak();
    if (existing.lastDate === today) {
      return existing.count;
    }
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newCount = existing.lastDate === yesterday ? existing.count + 1 : 1;
    const next = { count: newCount, lastDate: today };
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(next));
    return newCount;
  } catch {
    return 1;
  }
}

function loadState(): JapaState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { bead: 0, rounds: 0 };
    const parsed = JSON.parse(raw) as Partial<JapaState>;
    const bead = Number(parsed.bead);
    const rounds = Number(parsed.rounds);
    return {
      bead: Number.isInteger(bead) && bead >= 0 && bead < BEADS ? bead : 0,
      rounds: Number.isInteger(rounds) && rounds >= 0 ? rounds : 0,
    };
  } catch {
    return { bead: 0, rounds: 0 };
  }
}

function saveState(state: JapaState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Counting continues for the session even without storage.
  }
}

export default function JapaMala() {
  const { lang } = useLang();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [{ bead, rounds }, setState] = useState<JapaState>({ bead: 0, rounds: 0 });
  const [roundFlash, setRoundFlash] = useState(false);
  const flashTimer = useRef(0);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setState(loadState());
    // Lets the navbar (or any other surface) open the mala directly.
    const openFromEvent = () => setOpen(true);
    window.addEventListener("hariboll:open-japa", openFromEvent);
    return () => {
      window.clearTimeout(flashTimer.current);
      window.removeEventListener("hariboll:open-japa", openFromEvent);
    };
  }, []);

  const share = async () => {
    const text =
      lang === "hi"
        ? `हरिबोल! आज मैंने हरे कृष्ण महामंत्र की ${rounds} माला जप की। 🙏 — हरिबोल मंदिर, जालंधर`
        : `Haribol! I chanted ${rounds} round${rounds === 1 ? "" : "s"} of the Hare Krishna Mahamantra today. 🙏 — Hariboll Mandir, Jalandhar`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // Cancelled shares and clipboard restrictions are non-events.
    }
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      const launcher = launcherRef.current;
      window.requestAnimationFrame(() => {
        if (launcher?.isConnected) launcher.focus();
      });
    };
  }, [open]);

  const [goal, setGoal] = useState(16);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const savedGoal = window.localStorage.getItem(GOAL_KEY);
      if (savedGoal) setGoal(Number(savedGoal) || 16);
    } catch {
      /* ignore */
    }
    setStreak(loadStreak().count);
  }, []);

  const changeGoal = (newGoal: number) => {
    setGoal(newGoal);
    try {
      window.localStorage.setItem(GOAL_KEY, String(newGoal));
    } catch {
      /* ignore */
    }
  };

  const advance = (e?: React.SyntheticEvent) => {
    if (e) e.stopPropagation();
    setState((prev) => {
      const nextBead = prev.bead + 1;
      const isRoundFinished = nextBead >= BEADS;
      const next = isRoundFinished
        ? { bead: 0, rounds: prev.rounds + 1 }
        : { bead: nextBead, rounds: prev.rounds };

      if (isRoundFinished) {
        setRoundFlash(true);
        window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => setRoundFlash(false), 1600);
        const newStreak = updateStreak();
        setStreak(newStreak);
      }
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(isRoundFinished ? [30, 60, 30] : 10);
        } catch {
          // Haptics are a bonus, never a requirement.
        }
      }
      saveState(next);
      return next;
    });
  };

  const reset = () => {
    const cleared = { bead: 0, rounds: 0 };
    window.clearTimeout(flashTimer.current);
    setRoundFlash(false);
    setState(cleared);
    saveState(cleared);
  };

  // Bead positions around the ring, biggest gap at the top for the sumeru.
  const beadDots = useMemo(() => {
    const R = 118;
    return Array.from({ length: BEADS }, (_, i) => {
      const angle = ((i + 0.5) / BEADS) * Math.PI * 2 - Math.PI / 2;
      return {
        cx: 140 + R * Math.cos(angle),
        cy: 146 + R * Math.sin(angle),
      };
    });
  }, []);

  const status = roundFlash
    ? lang === "hi"
      ? "हरिबोल! एक माला पूर्ण हुई।"
      : "Haribol! One full round completed."
    : lang === "hi"
      ? `मनका ${bead} / ${BEADS}। ${rounds} माला पूर्ण।`
      : `Bead ${bead} of ${BEADS}. ${rounds} round${rounds === 1 ? "" : "s"} completed.`;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        className="sadhana-dock-btn"
        aria-label={lang === "hi" ? "जप माला खोलें" : "Open japa mala"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="japa-mala-dialog"
        title={lang === "hi" ? "जप माला" : "Japa Mala"}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#f3d78e" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="13" r="7.5" strokeDasharray="2.4 2.6" />
          <circle cx="12" cy="3.5" r="1.8" fill="#f3d78e" stroke="none" />
        </svg>
        <span className="hidden whitespace-nowrap font-body text-[10px] font-semibold uppercase tracking-[0.15em] sm:block">
          {lang === "hi" ? "जप" : "Japa"}
        </span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#16090b]/85 p-4 sm:p-6 backdrop-blur-md"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.35 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setOpen(false);
                  }
                }}
              >
            <motion.div
              ref={dialogRef}
              id="japa-mala-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="japa-mala-title"
              tabIndex={-1}
              initial={reduce ? false : { opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: 20, scale: 0.97 }}
              transition={reduce ? { duration: 0 } : spring.gentle}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
              className={`relative w-full max-w-md overflow-hidden rounded-[2rem] border border-gold/35 bg-[radial-gradient(circle_at_50%_15%,#5c3929_0%,#3d1016_52%,#20090d_100%)] px-6 py-8 text-center text-cream shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)] sm:px-10 ${
                roundFlash ? "japa-round-flash" : ""
              }`}
            >
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 rounded-full px-3 py-2 text-cream/60 transition hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                aria-label={lang === "hi" ? "जप माला बंद करें" : "Close japa mala"}
              >
                ×
              </button>

              <p id="japa-mala-title" className="font-body text-[10px] font-medium uppercase tracking-widest2 text-gold-light">
                {lang === "hi" ? "हरे कृष्ण महामंत्र" : "Hare Krishna Mahamantra"}
              </p>

              <button
                type="button"
                onClick={advance}
                className="japa-tap mx-auto mt-4 block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                aria-label={lang === "hi" ? "अगला मनका — जप करें" : "Next bead — chant once"}
              >
                <svg viewBox="0 0 280 292" className="h-64 w-64 sm:h-72 sm:w-72" aria-hidden="true">
                  {/* Sumeru (head bead) at the top of the ring */}
                  <circle cx="140" cy="16" r="9" fill="#e3c77e" stroke="rgba(255,231,165,0.5)" />
                  <circle cx="140" cy="16" r="3.2" fill="#8a5a1f" />
                  {/* The current bead's glow is a sibling circle whose opacity
                      toggles, not a drop-shadow filter on the bead itself — a
                      filter would be re-rasterised on two circles for each of
                      the 108 taps in a round. */}
                  <circle
                    cx={beadDots[bead]?.cx ?? 140}
                    cy={beadDots[bead]?.cy ?? 146}
                    r={7}
                    className="japa-bead-halo is-current"
                  />
                  {beadDots.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.cx}
                      cy={p.cy}
                      r={3.4}
                      className={`japa-bead ${i < bead ? "is-done" : ""} ${i === bead ? "is-current" : ""}`}
                    />
                  ))}
                  <text
                    x="140"
                    y="132"
                    textAnchor="middle"
                    className="fill-[#f3d78e]"
                    style={{ font: "600 44px var(--font-playfair), Georgia, serif", fontOpticalSizing: "auto" }}
                  >
                    {bead}
                  </text>
                  <text
                    x="140"
                    y="158"
                    textAnchor="middle"
                    className="fill-[#faf4ea]"
                    style={{ font: "500 12px system-ui, sans-serif", opacity: 0.65, letterSpacing: "0.2em" }}
                  >
                    / 108
                  </text>
                  <text
                    x="140"
                    y="188"
                    textAnchor="middle"
                    className="fill-[#e3c77e]"
                    style={{ font: "500 13px var(--font-inter), system-ui", opacity: 0.9 }}
                  >
                    {lang === "hi" ? `${rounds} माला पूर्ण` : `${rounds} round${rounds === 1 ? "" : "s"} completed`}
                  </text>
                </svg>
              </button>

              <p className="sr-only" aria-live="polite" aria-atomic="true">
                {status}
              </p>

              <p className="mx-auto mt-2 max-w-xs font-body text-sm leading-relaxed text-cream/70">
                {roundFlash
                  ? lang === "hi"
                    ? "हरिबोल! एक माला पूर्ण हुई।"
                    : "Haribol! One full round completed."
                  : lang === "hi"
                    ? "प्रत्येक मंत्र के साथ माला पर एक बार स्पर्श करें।"
                    : "Tap the mala once with each mantra."}
              </p>

              {/* Daily Streak + Target Goal Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gold/25 bg-black/25 px-3.5 py-2 text-xs">
                <div className="flex items-center gap-1.5 font-body font-semibold text-amber-300">
                  <span>🔥</span>
                  <span>{streak} {lang === "hi" ? "दिन का नियम" : "Day Streak"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-body text-[11px] text-cream/70">
                    {lang === "hi" ? "लक्ष्य:" : "Goal:"}
                  </span>
                  <select
                    value={goal}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      changeGoal(Number(e.target.value));
                    }}
                    className="rounded border border-gold/30 bg-[#250a0f] px-2 py-1 font-body text-xs font-medium text-gold-light focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value={1}>1 {lang === "hi" ? "माला" : "Round"}</option>
                    <option value={4}>4 {lang === "hi" ? "माला" : "Rounds"}</option>
                    <option value={16}>16 {lang === "hi" ? "माला" : "Rounds"}</option>
                    <option value={32}>32 {lang === "hi" ? "माला" : "Rounds"}</option>
                    <option value={64}>64 {lang === "hi" ? "माला" : "Rounds"}</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={advance} className="btn-gold">
                  {lang === "hi" ? "जप करें" : "Chant"}
                </button>
                {rounds > 0 && (
                  <button
                    type="button"
                    onClick={share}
                    className="rounded-full border border-gold-light/40 px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-gold-light transition hover:border-gold-light hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                  >
                    {lang === "hi" ? "साझा करें" : "Share"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full border border-cream/25 px-5 py-2.5 font-body text-xs font-semibold uppercase tracking-[0.14em] text-cream/70 transition hover:border-cream/50 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-light"
                >
                  {lang === "hi" ? "रीसेट" : "Reset"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
  </>
);
}
