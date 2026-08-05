// ------------------------------------------------------------------
//  Central image configuration.
//
//  To use your own photos: drop optimized image files into /public/images
//  using the exact file names in `src` below. They will appear
//  automatically. Until then, an elegant themed placeholder is shown
//  (no broken image icons).
// ------------------------------------------------------------------

export type Palette = "maroon" | "gold" | "forest" | "sky" | "cream";

export interface SiteImage {
  src: string;
  alt: string;
  label: string;
  palette: Palette;
}

export const images = {
  hero: {
    src: "/images/temple.webp",
    alt: "Evening darshan at Sree Radha Madhav Mandir",
    label: "Sri Sri Radha Madhav Darshan",
    palette: "maroon",
  },
  mahaprabhu: {
    src: "/images/mahaprabhu.webp",
    alt: "Sri Chaitanya Mahaprabhu",
    label: "Sri Chaitanya Mahaprabhu",
    palette: "gold",
  },
  radhaMadhav: {
    src: "/images/radha-madhav.webp",
    alt: "Sri Sri Radha Madhav Ji",
    label: "Sri Sri Radha Madhav Ji",
    palette: "maroon",
  },
  radhaRani: {
    src: "/images/radha-rani.webp",
    alt: "Śrīmatī Radha Rani",
    label: "Śrīmatī Radha Rani",
    palette: "forest",
  },
  temple: {
    src: "/images/temple.webp",
    alt: "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir",
    label: "Hariboll Mandir",
    palette: "cream",
  },
  festivals: {
    src: "/images/festivals.webp",
    alt: "Temple festival celebrations",
    label: "Temple Festivals",
    palette: "gold",
  },
} satisfies Record<string, SiteImage>;

/**
 * Dedicated background images for the recurring devotional QuoteBands.
 * These are SEPARATE from the deity portraits so they can be tuned
 * independently. Drop wide banner-style images into /public/images with
 * these names; until then a faint themed placeholder is shown behind the
 * band overlay.
 */
export const quoteBandImages = {
  harinam:  { src: "/images/quote-harinam.webp",  label: "Harinam",  palette: "gold" },
  temple:   { src: "/images/quote-temple.webp",   label: "Temple",   palette: "forest" },
  seva:     { src: "/images/quote-seva.webp",     label: "Seva",     palette: "maroon" },
  festival: { src: "/images/quote-festival.webp", label: "Festival", palette: "gold" },
  darshan:  { src: "/images/quote-darshan.webp",  label: "Darshan",  palette: "maroon" },
} satisfies Record<string, { src: string; label: string; palette: Palette }>;

/**
 * Dedicated background images for the Festivals cards — SEPARATE from the
 * deity portraits so they can be tuned independently. Drop portrait images
 * (~1200x1500) into /public/images with these names; until then a themed
 * placeholder is shown.
 */
export const festivalImages = {
  prakatUtsav: { src: "/images/festival-prakat-utsav.webp", label: "Prakat Utsav", palette: "maroon" },
  mango:       { src: "/images/festival-mango.webp",        label: "Mango Festival", palette: "gold" },
  ekadashi:    { src: "/images/festival-ekadashi.webp",     label: "Ekadashi", palette: "forest" },
  jhulan:      { src: "/images/festival-jhulan.webp",       label: "Jhulan", palette: "sky" },
  janmashtami: { src: "/images/festival-janmashtami.webp",  label: "Janmashtami", palette: "maroon" },
  kartik:      { src: "/images/festival-kartik.webp",       label: "Kartik", palette: "gold" },
} satisfies Record<string, { src: string; label: string; palette: Palette }>;

/**
 * Dedicated images for the Gaudiya Heritage page cards — one per section.
 * SEPARATE from the deity portraits so they can be tuned independently. Drop
 * landscape-ish images (~1200x900) into /public/images with these names; until
 * then a themed placeholder is shown.
 */
export const heritageImages = {
  origins:      { src: "/images/heritage-origins.webp",       label: "Sree Chaitanya Mahaprabhu",   palette: "gold" },
  prabhupad:    { src: "/images/heritage-prabhupad.webp",     label: "Srila Prabhupad",             palette: "maroon" },
  paramGurudev: { src: "/images/heritage-param-gurudev.webp", label: "Param Gurudev",               palette: "forest" },
  gurudev:      { src: "/images/heritage-gurudev.webp",       label: "Gurudev",                     palette: "maroon" },
  teachings:    { src: "/images/heritage-teachings.webp",     label: "Core Teachings",              palette: "gold" },
  math:         { src: "/images/heritage-math.webp",          label: "Sree Chaitanya Gaudiya Math", palette: "forest" },
  mandir:       { src: "/images/heritage-mandir.webp",        label: "Our Mandir",                  palette: "maroon" },
} satisfies Record<string, { src: string; label: string; palette: Palette }>;

export interface DarshanImage {
  src: string;
  alt: string;
  title: string;
  caption: string;
  palette: Palette;
}

/**
 * Ordered "journey through darshan" shown in the interactive Darshan
 * Gallery (components/sections/Gallery.tsx). Index 0 is the default
 * featured item. Any photo that hasn't been added yet falls back to an
 * elegant themed placeholder (see FallbackImage / makePlaceholder), so
 * the gallery always looks complete.
 */
export const darshanGallery: DarshanImage[] = [
  {
    src: "/images/radha-madhav.webp",
    alt: "Sri Sri Radha Madhav Ji",
    title: "Sri Sri Radha Madhav Ji",
    caption: "The heart of the temple, where every darshan becomes shelter.",
    palette: "maroon",
  },
  {
    src: "/images/mahaprabhu.webp",
    alt: "Sri Chaitanya Mahaprabhu",
    title: "Sri Chaitanya Mahaprabhu",
    caption: "The golden ocean of mercy, who gives Krishna through Harinam.",
    palette: "gold",
  },
  {
    src: "/images/radha-rani.webp",
    alt: "Śrīmatī Radha Rani",
    title: "Śrīmatī Radha Rani",
    caption: "The merciful shelter who carries our prayers to Krishna.",
    palette: "forest",
  },
  {
    src: "/images/lotus-feet.webp",
    alt: "Lotus Feet",
    title: "Lotus Feet",
    caption: "Where the restless heart finally finds peace.",
    palette: "gold",
  },
  {
    src: "/images/festivals.webp",
    alt: "Festival Darshan",
    title: "Festival Darshan",
    caption: "Moments of seva, celebration, and divine grace.",
    palette: "maroon",
  },
  {
    src: "/images/mango-festival.webp",
    alt: "Mango Festival",
    title: "Mango Festival",
    caption: "A sweet offering of joy, color, and loving devotion.",
    palette: "gold",
  },
  {
    src: "/images/festival-ekadashi.webp",
    alt: "Ekadashi",
    title: "Ekadashi",
    caption: "A day of simplicity, surrender, and inner remembrance.",
    palette: "sky",
  },
  {
    src: "/images/kirtan-seva.webp",
    alt: "Kirtan & Seva",
    title: "Kirtan & Seva",
    caption: "Where devotion becomes movement, melody, and service.",
    palette: "forest",
  },
  {
    src: "/images/divinecouple.webp",
    alt: "Śrī Śrī Rādhā Kṛṣṇa",
    title: "Śrī Śrī Rādhā Kṛṣṇa",
    caption: "The eternal Divine Couple — the sweetness the soul was made for.",
    palette: "maroon",
  },
  {
    src: "/images/rathyatra.webp",
    alt: "Ratha Yātrā",
    title: "Ratha Yātrā",
    caption: "Lord Jagannath rides forth — the festival of the world's joy.",
    palette: "gold",
  },
  {
    src: "/images/janamashtmi.webp",
    alt: "Janmāṣṭamī",
    title: "Janmāṣṭamī",
    caption: "The midnight advent of Śrī Kṛṣṇa, awaited by all creation.",
    palette: "sky",
  },
  {
    src: "/images/madhavmaharaj.webp",
    alt: "Śrīla Bhakti Dayita Mādhava Gosvāmī Mahārāja",
    title: "Śrīla Bhakti Dayita Mādhava Gosvāmī Mahārāja",
    caption: "The causeless mercy of Śrī Gurudeva, shelter of surrendered souls.",
    palette: "gold",
  },
  {
    src: "/images/tirthmaharaj.webp",
    alt: "Śrīla Bhakti Ballabh Tīrtha Gosvāmī Mahārāja",
    title: "Śrīla Bhakti Ballabh Tīrtha Gosvāmī Mahārāja",
    caption: "The ācārya whose life was a river of Harinām and compassion.",
    palette: "maroon",
  },
];

// ------------------------------------------------------------------
//  Hero background image.
//
//  The home-page hero renders a composed background image that already
//  contains the full artwork — two inward-facing peacocks, the central cusped
//  cream arch panel (left EMPTY for text), floral vines, lotus crests, the gold
//  divider ornament and the bottom lotus, all on a light cream ground. The hero
//  overlays ONLY the heading text + CTA buttons into that empty central arch.
//
//  There is no single `hero-bg.webp` any more — the artwork is per-daypart
//  (see heroBackgrounds below). If every candidate is missing, the hero falls
//  back to the hand-authored ornamental SVG composition (components/ui/*).
// ------------------------------------------------------------------

// ------------------------------------------------------------------
//  Time-of-day hero backgrounds.
//
//  The home hero swaps between three compositions based on the current
//  Jalandhar time (see lib/daypart.ts): "day" (morning, 04:00–12:00),
//  "evening" (12:00–18:00) and "night" (18:00–04:00). Drop optimized files
//  into /public/images with these exact names:
//
//    hero-morning.webp         -> day artwork,     desktop 16:9 (>=1024x576)
//    hero-morning-mobile.webp  -> day artwork,     mobile portrait 9:16
//    hero-evening.webp         -> evening artwork, desktop 16:9
//    hero-evening-mobile.webp  -> evening artwork, mobile portrait 9:16
//    hero-night.webp           -> night artwork,   desktop 16:9
//    hero-night-mobile.webp    -> night artwork,   mobile portrait 9:16
//
//  If any file is missing, that layer gracefully falls back to the existing
//  hero-bg.webp / hero-bg-mobile.webp (heroFallback), and if THAT is missing
//  too the hand-authored ornamental SVG hero is shown.
// ------------------------------------------------------------------

export const heroBackgrounds = {
  day: {
    desktop: "/images/hero-morning.webp",
    desktopVideo: "/video/morning.mp4",
    mobile: "/images/hero-morning-mobile.webp",
  },
  evening: {
    desktop: "/images/hero-evening.webp",
    desktopVideo: "/video/evening.mp4",
    mobile: "/images/hero-evening-mobile.webp",
  },
  night: {
    desktop: "/images/hero-night.webp",
    desktopVideo: "/video/night.mp4",
    mobile: "/images/hero-night-mobile.webp",
  },
} as const;

/**
 * Intermediate rung of the hero fallback chain: daypart artwork → this →
 * ornamental SVG. It previously pointed at /images/hero-bg.webp and
 * /images/hero-bg-mobile.webp, neither of which exists, so the rung was dead
 * and a missing daypart image skipped straight to the SVG. Pointing it at the
 * morning artwork (which does ship) makes the chain real again.
 */
export const heroFallback = {
  desktop: "/images/hero-morning.webp",
  mobile: "/images/hero-morning-mobile.webp",
} as const;
