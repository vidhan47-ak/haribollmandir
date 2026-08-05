// ------------------------------------------------------------------
//  Data + helpers for the Daily Bhakti Companion.
//
//  Everything that rotates "per day" is chosen deterministically from the
//  Jalandhar (IST) date, so every visitor worldwide sees the same verse and
//  kīrtana on a given temple-day, and it advances at IST midnight. The Next
//  Aarti countdown is likewise anchored to temple time.
// ------------------------------------------------------------------

import {
  AARATI_TIMES,
  TEMPLE_TIME_ZONE,
  type AaratiTime,
} from "@/lib/temple";

export const JALANDHAR_TIME_ZONE = TEMPLE_TIME_ZONE;

export interface IstMoment {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number;
  second: number;
  secondsSinceMidnight: number;
  /** Whole days since the Unix epoch, in IST — advances by 1 each temple-day. */
  dayNumber: number;
}

/** Resolve the current moment in Jalandhar (IST), independent of the visitor's timezone. */
export function getIstMoment(now: Date = new Date()): IstMoment {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: JALANDHAR_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const map: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== "literal") map[part.type] = part.value;
    }

    let hour = Number(map.hour);
    if (hour === 24) hour = 0;
    const minute = Number(map.minute);
    const second = Number(map.second);
    const year = Number(map.year);
    const month = Number(map.month);
    const day = Number(map.day);
    const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      secondsSinceMidnight: hour * 3600 + minute * 60 + second,
      dayNumber,
    };
  } catch {
    const d = now;
    const dayNumber = Math.floor(
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000,
    );
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      hour: d.getHours(),
      minute: d.getMinutes(),
      second: d.getSeconds(),
      secondsSinceMidnight:
        d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(),
      dayNumber,
    };
  }
}

/** Deterministically pick one item for a given temple-day. */
export function pickForDay<T>(items: readonly T[], dayNumber: number): T {
  const length = items.length;
  const index = ((dayNumber % length) + length) % length;
  return items[index];
}

export function splitDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return {
    days: Math.floor(safe / 86_400),
    hours: Math.floor((safe % 86_400) / 3600),
    minutes: Math.floor((safe % 3600) / 60),
    seconds: safe % 60,
  };
}

import { VERSES_100, type Verse } from "@/lib/data/verses-100";
import { KIRTANS_100, type Kirtan } from "@/lib/data/kirtans-100";

export type { Verse, Kirtan };

// ------------------------------------------------------------------
//  Verse of the Day (100 days rotating)
// ------------------------------------------------------------------
export const VERSES: readonly Verse[] = VERSES_100;

// ------------------------------------------------------------------
//  Kīrtana of the Day (100 days rotating)
// ------------------------------------------------------------------
export const KIRTANS: readonly Kirtan[] = KIRTANS_100;

// ------------------------------------------------------------------
//  Aarti schedule (temple time / IST).
//
//  These times used to be declared here AND in lib/live-darshan.ts AND
//  printed as literal strings in two components — and the four copies
//  disagreed (18:30 here vs 19:30 everywhere else), so the countdown
//  could tick toward 6:30 PM under a label reading 7:30 PM. The schedule
//  now lives in lib/temple.ts and this is a re-export for compatibility.
// ------------------------------------------------------------------
export type Aarti = AaratiTime;

export const AARTIS: readonly Aarti[] = AARATI_TIMES;

export interface NextAarti {
  aarti: Aarti;
  live: boolean;
  /** Seconds until the next aarti begins (0 while live). */
  secondsUntilStart: number;
  /** Seconds until the current live window ends (0 when not live). */
  secondsUntilEnd: number;
}

/** Resolve the aarti happening now, or the next one coming up, from an IST moment. */
export function getNextAarti(moment: IstMoment): NextAarti {
  const nowSeconds = moment.secondsSinceMidnight;

  for (const aarti of AARTIS) {
    const start = aarti.minutes * 60;
    const end = start + aarti.durationMinutes * 60;
    if (nowSeconds >= start && nowSeconds < end) {
      const isLive = aarti.isLiveBroadcast !== false;
      return {
        aarti,
        live: isLive,
        secondsUntilStart: 0,
        secondsUntilEnd: isLive ? end - nowSeconds : 0,
      };
    }
  }

  const laterToday = AARTIS.map((aarti) => ({ aarti, start: aarti.minutes * 60 }))
    .filter((entry) => entry.start > nowSeconds)
    .sort((a, b) => a.start - b.start);

  if (laterToday.length > 0) {
    const next = laterToday[0];
    return {
      aarti: next.aarti,
      live: false,
      secondsUntilStart: next.start - nowSeconds,
      secondsUntilEnd: 0,
    };
  }

  const firstTomorrow = [...AARTIS].sort((a, b) => a.minutes - b.minutes)[0];
  return {
    aarti: firstTomorrow,
    live: false,
    secondsUntilStart: 86_400 - nowSeconds + firstTomorrow.minutes * 60,
    secondsUntilEnd: 0,
  };
}
