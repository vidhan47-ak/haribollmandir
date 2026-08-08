/* ------------------------------------------------------------------ */
/*  The temple's own facts — ONE canonical source.                     */
/*                                                                     */
/*  Before this module the same facts lived in five places and          */
/*  disagreed with each other:                                          */
/*                                                                     */
/*    • lib/bhakti.ts          Sandhyā Ārati at 18:30                   */
/*    • lib/live-darshan.ts    evening broadcast window at 19:30        */
/*    • DailyBhaktiCompanion   printed the literal string "7:30 PM"     */
/*    • Footer.tsx             printed another literal "7:30 PM"        */
/*    • public/offline.html    a third hardcoded copy of the timings    */
/*                                                                     */
/*  So the "Next Ārati" countdown could tick toward 6:30 PM underneath  */
/*  a label reading 7:30 PM. Everything now derives from the values     */
/*  below, so a correction is made once and lands everywhere.           */
/*                                                                     */
/*  MAINTAINER NOTE — the 19:30 Sandhyā Ārati time was chosen because   */
/*  it is what the site already showed devotees in two places and what  */
/*  the live-darshan windows used; 18:30 existed only inside the aarti  */
/*  resolver. Please confirm the true time with the temple and, if it   */
/*  differs, change it HERE only.                                       */
/* ------------------------------------------------------------------ */

export const TEMPLE_TIME_ZONE = "Asia/Kolkata";

/* ------------------------------------------------------------------ */
/*  Contact                                                            */
/* ------------------------------------------------------------------ */

export const TEMPLE_EMAIL = "haribollmandir@gmail.com";

export const TEMPLE_ADDRESS = {
  name: "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir",
  nameHi: "श्री चैतन्य महाप्रभु श्री राधा माधव मंदिर",
  /** Street line as the temple states it on its own public profile. */
  street: "Near Hari Bol Temple Road, Pratap Bagh Rd, Fentonganj",
  streetHi: "हरि बोल टेम्पल रोड के निकट, प्रताप बाग रोड, फेंटनगंज",
  city: "Jalandhar",
  cityHi: "जालंधर",
  state: "Punjab",
  stateHi: "पंजाब",
  country: "India",
  countryHi: "भारत",
} as const;

/** The temple's own short Maps link (from its public profile). */
export const TEMPLE_MAPS_URL = "https://maps.app.goo.gl/8UzB3aL5gvLZd2M96";

const MAPS_QUERY =
  "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir Pratap Bagh Jalandhar Punjab";

/** Embeddable map. Kept derived so the pin and the directions link agree. */
export const TEMPLE_MAP_EMBED_URL = `https://maps.google.com/maps?q=${encodeURIComponent(
  MAPS_QUERY,
)}&z=15&output=embed`;

export type TempleLinkId =
  | "email"
  | "whatsapp"
  | "instagram"
  | "broadcast"
  | "facebook"
  | "youtube"
  | "maps";

export interface TempleLink {
  readonly id: TempleLinkId;
  readonly label: string;
  readonly labelHi: string;
  readonly href: string;
  /** Short description used where the link needs a line of context. */
  readonly note: string;
  readonly noteHi: string;
  /** Handle / address shown alongside the label, when there is one. */
  readonly handle?: string;
  /** External links open in a new tab; mailto/tel must not. */
  readonly external: boolean;
}

/**
 * Every way to reach the mandir, in the order a devotee is most likely to
 * want them. Mirrors the temple's public link profile.
 */
export const TEMPLE_LINKS: readonly TempleLink[] = [
  {
    id: "whatsapp",
    label: "WhatsApp Group",
    labelHi: "व्हाट्सएप समूह",
    href: "https://chat.whatsapp.com/HOQx0AgfQEgE1rCFX2hfYy",
    note: "Join the temple's devotee group",
    noteHi: "मंदिर के भक्त-समूह से जुड़ें",
    external: true,
  },
  {
    id: "email",
    label: "Email",
    labelHi: "ईमेल",
    href: `mailto:${TEMPLE_EMAIL}`,
    handle: TEMPLE_EMAIL,
    note: "Write to the temple",
    noteHi: "मंदिर को लिखें",
    external: false,
  },
  {
    id: "instagram",
    label: "Instagram",
    labelHi: "इंस्टाग्राम",
    href: "https://www.instagram.com/hariboll_mandir",
    handle: "@hariboll_mandir",
    note: "Darshan photos and festival moments",
    noteHi: "दर्शन चित्र एवं उत्सव के क्षण",
    external: true,
  },
  {
    id: "broadcast",
    label: "Broadcast Channel",
    labelHi: "प्रसारण चैनल",
    href: "https://www.instagram.com/channel/Abb_15McKtvrP_Fa/",
    note: "Daily updates from the mandir",
    noteHi: "मंदिर से नित्य समाचार",
    external: true,
  },
  {
    id: "facebook",
    label: "Facebook",
    labelHi: "फेसबुक",
    href: "https://www.facebook.com/hari.bol.temple/",
    note: "Live darshan broadcasts",
    noteHi: "लाइव दर्शन प्रसारण",
    external: true,
  },
  {
    id: "youtube",
    label: "YouTube",
    labelHi: "यूट्यूब",
    href: "https://www.youtube.com/@haribolmandirjalandhar",
    note: "Kirtan, lectures and festival recordings",
    noteHi: "कीर्तन, प्रवचन एवं उत्सव अभिलेख",
    external: true,
  },
  {
    id: "maps",
    label: "Get Directions",
    labelHi: "रास्ता देखें",
    href: TEMPLE_MAPS_URL,
    note: "Pratap Bagh, Jalandhar",
    noteHi: "प्रताप बाग, जालंधर",
    external: true,
  },
] as const;

/** Look one link up by id, so callers never re-type a URL. */
export function templeLink(id: TempleLinkId): TempleLink {
  const found = TEMPLE_LINKS.find((link) => link.id === id);
  if (!found) throw new Error(`Unknown temple link: ${id}`);
  return found;
}

/** The subset shown as social icons (no mailto, no map). */
export const TEMPLE_SOCIAL_LINKS = TEMPLE_LINKS.filter((link) =>
  ["instagram", "broadcast", "facebook", "youtube", "whatsapp"].includes(
    link.id,
  ),
);

/* ------------------------------------------------------------------ */
/*  Darshan timings                                                    */
/* ------------------------------------------------------------------ */

export interface DarshanWindow {
  readonly label: string;
  readonly labelHi: string;
  /** Minutes since IST midnight. */
  readonly startMinutes: number;
  readonly endMinutes: number;
}

export const DARSHAN_WINDOWS: readonly DarshanWindow[] = [
  {
    label: "Morning Darshan",
    labelHi: "प्रातः दर्शन",
    startMinutes: 5 * 60,
    endMinutes: 11 * 60,
  },
  {
    label: "Evening Darshan",
    labelHi: "सायं दर्शन",
    startMinutes: 17 * 60,
    endMinutes: 21 * 60,
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Ārati schedule — the canonical times.                              */
/*  The live-darshan broadcast windows open with each ārati, so they    */
/*  are derived from this list rather than restated.                    */
/* ------------------------------------------------------------------ */

export interface AaratiTime {
  readonly name: string;
  readonly nameHi: string;
  /** Minutes since IST midnight. */
  readonly minutes: number;
  /** How long the ārati / window lasts, in minutes. */
  readonly durationMinutes: number;
  /** Whether a live broadcast occurs during this window. Defaults to true. */
  readonly isLiveBroadcast?: boolean;
}

export const AARATI_TIMES: readonly AaratiTime[] = [
  {
    name: "Maṅgala Ārati",
    nameHi: "मंगल आरती",
    minutes: 5 * 60,
    durationMinutes: 90,
    isLiveBroadcast: true,
  },
  {
    name: "Sandhyā Ārati",
    nameHi: "संध्या आरती",
    minutes: 19 * 60 + 30,
    durationMinutes: 90,
    isLiveBroadcast: true,
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Formatting — one implementation, so every surface agrees.           */
/* ------------------------------------------------------------------ */

/** "7:30 PM" / "शाम 7:30 बजे" from minutes since IST midnight. */
export function formatTempleTime(
  totalMinutes: number,
  lang: "en" | "hi" = "en",
): string {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const clock = `${hours12}:${String(minutes).padStart(2, "0")}`;

  if (lang === "hi") {
    // Hindi names the part of day before the clock reading.
    const partOfDay =
      hours24 < 4
        ? "रात"
        : hours24 < 12
          ? "सुबह"
          : hours24 < 16
            ? "दोपहर"
            : hours24 < 19
              ? "शाम"
              : "रात";
    return `${partOfDay} ${clock} बजे`;
  }

  return `${clock} ${hours24 < 12 ? "AM" : "PM"}`;
}

/** "6:00 AM – 11:00 AM" for a darshan window. */
export function formatDarshanWindow(
  window: DarshanWindow,
  lang: "en" | "hi" = "en",
): string {
  if (lang === "hi") {
    const from = formatTempleTime(window.startMinutes, "hi");
    const to = formatTempleTime(window.endMinutes, "hi");
    return `${from} – ${to}`;
  }
  return `${formatTempleTime(window.startMinutes)} – ${formatTempleTime(
    window.endMinutes,
  )}`;
}

/** The timings list rendered by Visit Us and the footer. */
export function darshanTimings(
  lang: "en" | "hi" = "en",
): { label: string; value: string }[] {
  return DARSHAN_WINDOWS.map((window) => ({
    label: lang === "hi" ? window.labelHi : window.label,
    value: formatDarshanWindow(window, lang),
  }));
}

/** "5:00 AM · 7:30 PM" — the live-darshan summary line (only broadcast times). */
export function aaratiSummary(lang: "en" | "hi" = "en"): string {
  return AARATI_TIMES.filter((aarati) => aarati.isLiveBroadcast !== false)
    .map((aarati) => formatTempleTime(aarati.minutes, lang))
    .join(" · ");
}

/** "Maṅgala Ārati · 5:00 AM   |   Sandhyā Ārati · 7:30 PM" */
export function aaratiScheduleLine(lang: "en" | "hi" = "en"): string {
  return AARATI_TIMES.map(
    (aarati) =>
      `${lang === "hi" ? aarati.nameHi : aarati.name} · ${formatTempleTime(
        aarati.minutes,
        lang,
      )}`,
  ).join("   |   ");
}

/** Full postal address on one line. */
export function templeAddressLine(lang: "en" | "hi" = "en"): string {
  const a = TEMPLE_ADDRESS;
  return lang === "hi"
    ? `${a.streetHi}, ${a.cityHi}, ${a.stateHi}, ${a.countryHi}`
    : `${a.street}, ${a.city}, ${a.state}, ${a.country}`;
}
