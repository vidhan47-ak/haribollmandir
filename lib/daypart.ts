// ------------------------------------------------------------------
//  Time-of-day resolution for the home hero, anchored to Jalandhar.
//
//  Jalandhar, Punjab runs on India Standard Time (Asia/Kolkata, UTC+5:30).
//  The hero swaps between three artworks based on the current IST hour,
//  regardless of where the visitor actually is:
//    • "day"     — morning, 04:00 up to 12:00
//    • "evening" — 12:00 up to 18:00
//    • "night"   — 18:00 up to 04:00
//  To retune, change MORNING_START_HOUR / EVENING_START_HOUR /
//  NIGHT_START_HOUR below (and keep the inline init script in
//  app/layout.tsx in sync).
// ------------------------------------------------------------------

export type Daypart = "day" | "evening" | "night";

export const JALANDHAR_TIME_ZONE = "Asia/Kolkata";
export const MORNING_START_HOUR = 4;   // 04:00 → morning (day layer)
export const EVENING_START_HOUR = 12;  // 12:00 → evening
export const NIGHT_START_HOUR = 18;    // 18:00 → night (until 04:00)

/** Current hour (0-23) in Jalandhar, independent of the visitor's timezone. */
export function getJalandharHour(now: Date = new Date()): number {
  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: JALANDHAR_TIME_ZONE,
      hour: "numeric",
      hour12: false,
    }).format(now);
    const hour = Number.parseInt(formatted, 10);
    if (!Number.isFinite(hour)) return MORNING_START_HOUR;
    // Some engines format midnight as "24"; normalise to 0.
    return hour === 24 ? 0 : hour;
  } catch {
    // A missing Intl timezone database falls back to the morning artwork.
    return MORNING_START_HOUR;
  }
}

export function getJalandharDaypart(now: Date = new Date()): Daypart {
  const hour = getJalandharHour(now);
  if (hour >= MORNING_START_HOUR && hour < EVENING_START_HOUR) return "day";
  if (hour >= EVENING_START_HOUR && hour < NIGHT_START_HOUR) return "evening";
  return "night";
}
