# Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir — Hariboll Mandir

A premium, calm and fully responsive devotional website for **Hariboll Mandir**,
Pratap Bagh, Jalandhar, Punjab. Built around Gaudiya Vaishnavism — Sri Chaitanya
Mahaprabhu, Sri Sri Radha Madhav Ji, Harinam Sankirtan, seva, darshan and
festivals.

The experience is image-led and peaceful: warm cream, gold, maroon, deep green
and soft blue, elegant serif typography, subtle floral / peacock textures,
buttery smooth scrolling and gentle scroll-reveal animations. No 3D, no heavy
effects, no clutter.

---

## Tech stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **Framer Motion** for subtle fade / slide / blur reveal animations
- **Lenis** for smooth, cinematic scrolling
- **next/font** (Playfair Display, Cinzel, Inter, Handlee)

The whole site is statically pre-rendered, so it deploys anywhere.

---

## Getting started

### 1. Prerequisites

Install **Node.js 18.17 or newer** (LTS recommended) from
<https://nodejs.org>. Verify:

```bash
node --version
npm --version
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally (development)

```bash
npm run dev
```

Open <http://localhost:3000> in your browser. Edits hot-reload automatically.

### 4. Production build

```bash
npm run build
npm start
```

---

## Adding your own photos

The site works out of the box: until you add real photos, each image slot shows
an elegant themed placeholder (lotus mandala + name) so nothing ever looks
broken.

To use your own images, drop these files into **`public/images/`** using the
exact names below:

| File name           | Used for                                        |
| ------------------- | ----------------------------------------------- |
| `mahaprabhu.jpg`    | Sri Chaitanya Mahaprabhu (Darshan card)         |
| `radha-madhav.jpg`  | Sri Sri Radha Madhav Ji (Darshan, hero, quote)  |
| `radha-rani.jpg`    | Śrīmatī Radha Rani (Darshan card)               |
| `temple.jpg`        | Temple / main darshan (Hero background + About) |
| `festivals.jpg`     | Festival celebration (Festival cards)           |
| `gallery-1.jpg`     | Gallery photo                                   |
| `gallery-2.jpg`     | Gallery photo                                   |

Recommendations:

- Deity / card images: **portrait ~1200 × 1500 px (4:5)**.
- Hero / temple image: **wide, 1920 px+** for a crisp full-screen background.
- Compress images (JPG or WEBP) so pages stay fast.

To change **which image appears where**, or to add more gallery photos, edit a
single file: **`lib/images.ts`**.

---

## Editing the content (text)

All wording lives in clearly named section components under
**`components/sections/`**:

| Section                     | File                                  |
| --------------------------- | ------------------------------------- |
| Hero (title, subtitle, CTAs)| `components/sections/Hero.tsx`        |
| Divine Darshan cards        | `components/sections/Darshan.tsx`     |
| About the temple            | `components/sections/About.tsx`       |
| Harinam / Darshan / Seva    | `components/sections/HarinamSeva.tsx` |
| Festivals                   | `components/sections/Festivals.tsx`   |
| Devotional quotes           | `components/sections/QuoteBand.tsx`   |
| Gallery                     | `components/sections/MagneticGallery.tsx` |
| Visit Us (address, timings) | `components/sections/VisitUs.tsx`     |
| Footer                      | `components/sections/Footer.tsx`      |

Common edits:

- **Address, map, Instagram, Get Directions, darshan timings** →
  `components/sections/VisitUs.tsx` (and the Instagram link in
  `components/sections/Footer.tsx`).
- **Navigation labels** → `components/Navbar.tsx`.
- **Page title / SEO description** → `app/layout.tsx` (the `metadata` export).

> The map uses a free Google Maps embed based on the temple name and area.
> For a precise pin, search your temple on Google Maps, choose **Share → Embed
> a map**, and replace `MAP_EMBED_URL` in `components/sections/VisitUs.tsx`.
> Darshan timings in that file are placeholders — update them to your actual
> timings.

---

## Customizing the look

- **Colors** — the full palette (cream / gold / maroon / forest / sky / ink)
  lives in `tailwind.config.ts` under `theme.extend.colors`.
- **Fonts** — swap the Google fonts in `app/layout.tsx`; they are exposed to
  Tailwind as `font-heading`, `font-display`, `font-body`, `font-script`.
- **Global styles, buttons, patterns** — `app/globals.css` (reusable classes
  like `.btn-gold`, `.card-temple`, `.divider-lotus`, `.pattern-floral`).
- **Scroll feel** — tune `lerp` / `wheelMultiplier` in
  `components/SmoothScroll.tsx`. Reduced-motion users automatically get calm,
  native scrolling and reduced animation.

---

## Project structure

```
app/
  layout.tsx        Root layout: fonts, metadata, smooth scroll, navbar
  page.tsx          Composes all sections in order
  globals.css       Tailwind + custom styles, patterns, buttons
  icon.svg          Lotus favicon
components/
  Navbar.tsx        Responsive nav + animated mobile menu
  SmoothScroll.tsx  Lenis provider + useSmoothScrollTo hook
  sections/         The nine page sections
  ui/               Reveal (animations), Parallax, FallbackImage,
                    SectionHeading, LotusMark
lib/
  images.ts         Single source of truth for all images
public/
  images/           Drop your photos here
```

---

## Temple facts live in one place

Darshan timings, ārati times, the postal address, the temple email and every
social link are declared **once** in `lib/temple.ts` and derived everywhere
else (Visit Us, the footer, the Daily Bhakti countdown, the live-darshan
windows, the offline page). Before this, the same facts were restated in five
places and disagreed with each other.

To correct a time or add a link, edit `lib/temple.ts` only.

> The Sandhyā Ārati time is currently **7:30 PM**. Please confirm it with the
> temple — the codebase previously held both 6:30 PM and 7:30 PM.

## Larger subsystems

| Area | Entry point |
| ---- | ----------- |
| Grantha Mandir (scripture + bhajan library) | `app/grantha-mandir/`, `components/grantha/`, `lib/grantha.ts` |
| Vaiṣṇava calendar | `app/vaishnava-calendar/`, `lib/sacred-calendar.ts` |
| Gauḍīya heritage | `app/gaudiya-heritage/`, `components/heritage/` |
| Daily devotional features | `components/features/` |
| Content ingestion | `scripts/ingest/`, `content-sources/` -> `content/` |
| PWA / offline | `components/features/PWAClient.tsx`, `public/sw.js`, `public/offline.html` |

## Motion system

One curve and one duration scale, stated once per language:

- `lib/springs.ts` — `EASE_DEVOTIONAL` plus the Apple-calibrated `spring.*` presets
- `app/globals.css` — `--ease-devotional` / `--ease-out` and `--dur-press` ... `--dur-ceremony`
- `tailwind.config.ts` — the `ease-devotional` utility
- `components/ui/Reveal.tsx` — scroll-reveal tokens (`LOTUS_BREATH_TOKENS`)

Interactive chrome stays under 300ms; the longer durations are for
once-per-scroll ceremonial reveals only. Reduced motion drops movement but
keeps opacity and colour transitions, so state changes stay legible.

## Deployment

Because the site is static, it deploys almost anywhere.

### Vercel (easiest)

1. Push this project to GitHub / GitLab.
2. Import the repo at <https://vercel.com/new>.
3. Vercel auto-detects Next.js — just click **Deploy**.

### Netlify

- Build command: `npm run build`
- Publish directory: `.next` (use the official Next.js Netlify plugin), or
  configure static export (below).

### Any static host (Cloudflare Pages, GitHub Pages, Nginx…)

This site has no server code, so you can export static HTML. Add to
`next.config.mjs`:

```js
const nextConfig = { output: "export", images: { unoptimized: true } };
```

Then run `npm run build` — the static site is generated in the `out/` folder,
which you can upload to any static host.

---

## Notes

- Smooth scrolling, parallax and reveal animations are intentionally gentle and
  respect the OS **"reduce motion"** setting.
- No 3D, no Three.js / React Three Fiber, no heavy effects — by design.

_Made with devotion. Haribol!_
