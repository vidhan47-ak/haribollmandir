import {
  AARATI_TIMES,
  TEMPLE_TIME_ZONE,
  formatTempleTime,
  templeLink,
} from "@/lib/temple";

export const LIVE_DARSHAN = {
  title: "Live Darshan from Hariboll Mandir",
  facebookUrl: templeLink("facebook").href,
  youtubeUrl: templeLink("youtube").href,
} as const;

export interface LiveWindow {
  /** Display label, e.g. "7:30 PM". Derived so it can never drift. */
  readonly label: string;
  readonly startMinutes: number;
  readonly durationMinutes: number;
}

/**
 * Daily live-darshan broadcast windows, expressed in temple time (IST).
 * Each window opens with an ārati, so both the times AND their labels are
 * derived from the single schedule in lib/temple.ts — previously this file
 * restated them and the two copies disagreed by an hour.
 */
export const LIVE_WINDOWS: readonly LiveWindow[] = AARATI_TIMES.map(
  (aarati) => ({
    label: formatTempleTime(aarati.minutes),
    startMinutes: aarati.minutes,
    durationMinutes: aarati.durationMinutes,
  }),
);

export type LiveStatus = {
  /** True when the current IST time falls inside a broadcast window. */
  live: boolean;
  /** The window currently live, or the next one coming up. */
  window: LiveWindow;
};

/** Minutes since midnight in Asia/Kolkata, regardless of visitor timezone. */
function istMinutesNow(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: TEMPLE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [hours, minutes] = formatter.format(date).split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Resolve whether darshan is live right now (green) or offline (amber),
 * plus which window is live / arriving next. Pure so it stays testable.
 */
export function getLiveStatus(date: Date = new Date()): LiveStatus {
  let now: number;
  try {
    now = istMinutesNow(date);
  } catch {
    // Very old runtimes without Intl timezone data: assume offline.
    return { live: false, window: LIVE_WINDOWS[0] };
  }

  for (const window of LIVE_WINDOWS) {
    if (now >= window.startMinutes && now < window.startMinutes + window.durationMinutes) {
      return { live: true, window };
    }
  }
  const upcoming =
    LIVE_WINDOWS.find((window) => window.startMinutes > now) ?? LIVE_WINDOWS[0];
  return { live: false, window: upcoming };
}
