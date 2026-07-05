// ------------------------------------------------------------------
//  Central image configuration.
//
//  To use your own photos: drop the real .jpg files into /public/images
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
    src: "/images/temple.jpg",
    alt: "Evening darshan at Sree Radha Madhav Mandir",
    label: "Sri Sri Radha Madhav Darshan",
    palette: "maroon",
  },
  mahaprabhu: {
    src: "/images/mahaprabhu.jpg",
    alt: "Sri Chaitanya Mahaprabhu",
    label: "Sri Chaitanya Mahaprabhu",
    palette: "gold",
  },
  radhaMadhav: {
    src: "/images/radha-madhav.jpg",
    alt: "Sri Sri Radha Madhav Ji",
    label: "Sri Sri Radha Madhav Ji",
    palette: "maroon",
  },
  radhaRani: {
    src: "/images/radha-rani.jpg",
    alt: "Sri Radha Rani",
    label: "Sri Radha Rani",
    palette: "forest",
  },
  temple: {
    src: "/images/temple.jpg",
    alt: "Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir",
    label: "Hariboll Mandir",
    palette: "cream",
  },
  festivals: {
    src: "/images/festivals.jpg",
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
  harinam:  { src: "/images/quote-harinam.jpg",  label: "Harinam",  palette: "gold" },
  temple:   { src: "/images/quote-temple.jpg",   label: "Temple",   palette: "forest" },
  seva:     { src: "/images/quote-seva.jpg",     label: "Seva",     palette: "maroon" },
  festival: { src: "/images/quote-festival.jpg", label: "Festival", palette: "gold" },
  darshan:  { src: "/images/quote-darshan.jpg",  label: "Darshan",  palette: "maroon" },
} satisfies Record<string, { src: string; label: string; palette: Palette }>;

/**
 * Dedicated background images for the Festivals cards — SEPARATE from the
 * deity portraits so they can be tuned independently. Drop portrait images
 * (~1200x1500) into /public/images with these names; until then a themed
 * placeholder is shown.
 */
export const festivalImages = {
  prakatUtsav: { src: "/images/festival-prakat-utsav.jpg", label: "Prakat Utsav", palette: "maroon" },
  mango:       { src: "/images/festival-mango.jpg",        label: "Mango Festival", palette: "gold" },
  ekadashi:    { src: "/images/festival-ekadashi.jpg",     label: "Ekadashi", palette: "forest" },
  jhulan:      { src: "/images/festival-jhulan.jpg",       label: "Jhulan", palette: "sky" },
  janmashtami: { src: "/images/festival-janmashtami.jpg",  label: "Janmashtami", palette: "maroon" },
  kartik:      { src: "/images/festival-kartik.jpg",       label: "Kartik", palette: "gold" },
} satisfies Record<string, { src: string; label: string; palette: Palette }>;

/**
 * Dedicated images for the Gaudiya Heritage page cards — one per section.
 * SEPARATE from the deity portraits so they can be tuned independently. Drop
 * landscape-ish images (~1200x900) into /public/images with these names; until
 * then a themed placeholder is shown.
 */
export const heritageImages = {
  origins:      { src: "/images/heritage-origins.jpg",       label: "Sree Chaitanya Mahaprabhu",   palette: "gold" },
  prabhupad:    { src: "/images/heritage-prabhupad.jpg",     label: "Srila Prabhupad",             palette: "maroon" },
  paramGurudev: { src: "/images/heritage-param-gurudev.jpg", label: "Param Gurudev",               palette: "forest" },
  gurudev:      { src: "/images/heritage-gurudev.jpg",       label: "Gurudev",                     palette: "maroon" },
  teachings:    { src: "/images/heritage-teachings.jpg",     label: "Core Teachings",              palette: "gold" },
  math:         { src: "/images/heritage-math.jpg",          label: "Sree Chaitanya Gaudiya Math", palette: "forest" },
  mandir:       { src: "/images/heritage-mandir.jpg",        label: "Our Mandir",                  palette: "maroon" },
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
    src: "/images/radha-madhav.jpg",
    alt: "Sri Sri Radha Madhav Ji",
    title: "Sri Sri Radha Madhav Ji",
    caption: "The heart of the temple, where every darshan becomes shelter.",
    palette: "maroon",
  },
  {
    src: "/images/mahaprabhu.jpg",
    alt: "Sri Chaitanya Mahaprabhu",
    title: "Sri Chaitanya Mahaprabhu",
    caption: "The golden ocean of mercy, who gives Krishna through Harinam.",
    palette: "gold",
  },
  {
    src: "/images/radha-rani.jpg",
    alt: "Sri Radha Rani",
    title: "Sri Radha Rani",
    caption: "The merciful shelter who carries our prayers to Krishna.",
    palette: "forest",
  },
  {
    src: "/images/lotus-feet.jpg",
    alt: "Lotus Feet",
    title: "Lotus Feet",
    caption: "Where the restless heart finally finds peace.",
    palette: "gold",
  },
  {
    src: "/images/festivals.jpg",
    alt: "Festival Darshan",
    title: "Festival Darshan",
    caption: "Moments of seva, celebration, and divine grace.",
    palette: "maroon",
  },
  {
    src: "/images/mango-festival.jpg",
    alt: "Mango Festival",
    title: "Mango Festival",
    caption: "A sweet offering of joy, color, and loving devotion.",
    palette: "gold",
  },
  {
    src: "/images/ekadashi.jpg",
    alt: "Ekadashi",
    title: "Ekadashi",
    caption: "A day of simplicity, surrender, and inner remembrance.",
    palette: "sky",
  },
  {
    src: "/images/kirtan-seva.jpg",
    alt: "Kirtan & Seva",
    title: "Kirtan & Seva",
    caption: "Where devotion becomes movement, melody, and service.",
    palette: "forest",
  },
];

// ------------------------------------------------------------------
//  Hero background image.
//
//  The home-page hero renders ONE composed background image (16:9) that
//  already contains the full artwork — two inward-facing peacocks, the
//  central cusped cream arch panel (left EMPTY for text), floral vines,
//  lotus crests, the gold divider ornament and the bottom lotus, all on a
//  light cream ground. The hero overlays ONLY the heading text + CTA
//  buttons into that empty central arch.
//
//    hero-bg.jpg -> composed hero artwork (1024x576 or larger, 16:9)
//
//  If the file is missing, the hero falls back to the hand-authored
//  ornamental SVG composition (see components/ui/*).
// ------------------------------------------------------------------

export const heroDecor = { bg: "/images/hero-bg.jpg" } as const;
