TEMPLE IMAGES
=============

Drop your real photos into this folder using these EXACT file names.
They will appear automatically across the site. Until a file is added,
an elegant themed placeholder (lotus mandala + name) is shown instead,
so the site never looks broken.

Required images
---------------
mahaprabhu.jpg    -> Sri Chaitanya Mahaprabhu (Darshan card + Darshan Gallery)
radha-madhav.jpg  -> Sri Sri Radha Madhav Ji (Darshan card + hero/quote + Darshan Gallery)
radha-rani.jpg    -> Sri Radha Rani (Darshan card + Darshan Gallery)
temple.jpg        -> Temple building / main darshan (Hero background + About)
festivals.jpg     -> Festival celebration photo (Festivals cards + Darshan Gallery)

Darshan Gallery photos (optional)
---------------------------------
The interactive "Darshan Gallery" (the section that replaced the old
masonry gallery) shows an ordered journey of eight darshans. Four of them
reuse the deity/festival photos above (radha-madhav.jpg, mahaprabhu.jpg,
radha-rani.jpg, festivals.jpg). The remaining four are optional extras —
until you add them, an elegant themed placeholder is shown automatically:

lotus-feet.jpg     -> Lotus Feet darshan
mango-festival.jpg -> Mango Festival
ekadashi.jpg       -> Ekadashi
kirtan-seva.jpg    -> Kirtan & Seva

Portrait images around 1200 x 1500 px (4:5) look best here.

Quote band backgrounds (optional)
---------------------------------
The five recurring devotional "quote bands" between sections now use their
OWN dedicated background images — SEPARATE from the deity portraits above,
so they can be tuned independently without affecting any darshan photo.
Until you add them, a faint themed placeholder is shown behind the band
overlay. Wide / banner-style images look best (around 1920 x 800 px):

quote-harinam.jpg   -> band 1 (Harinam)  — after Darshan
quote-temple.jpg    -> band 2 (Temple)   — after About
quote-seva.jpg      -> band 3 (Seva)     — after Harinam Seva
quote-festival.jpg  -> band 4 (Festival) — after Festivals
quote-darshan.jpg   -> band 5 (Darshan)  — after Gallery

Festival card images (optional)
---------------------------------
The six Festivals cards now use their OWN dedicated portrait images —
SEPARATE from the deity portraits above, so they can be tuned independently
without affecting any darshan photo. Until you add them, an elegant themed
placeholder is shown in each card. Portrait images around 1200 x 1500 px
(4:5) look best:

festival-prakat-utsav.jpg -> Prakat Utsav card
festival-mango.jpg        -> Mango Festival card
festival-ekadashi.jpg     -> Ekadashi card
festival-jhulan.jpg       -> Jhulan card
festival-janmashtami.jpg  -> Janmashtami card
festival-kartik.jpg       -> Kartik card

Tips
----
- Portrait images around 1200 x 1500 px (4:5) look best in the cards.
- The hero uses a wide, high-quality image (1920px+ wide recommended).
- Keep files optimized (compressed JPG/WEBP) for fast loading.
- To change which image goes where, edit  /lib/images.ts

Hero decoration
---------------
The home-page hero now uses ONE composed background image that already
contains the entire artwork — the two inward-facing peacocks, the central
cusped cream arch (left EMPTY for text), the floral vines, lotus crests,
the gold divider ornament and the bottom lotus, all on a light cream ground.

  hero-bg.jpg  -> composed hero artwork, 16:9 (1024 x 576 px or larger;
                  1920 x 1080 px recommended for crisp large screens).

How it works
- The image is drawn full-bleed (object-cover, centered), so on phones the
  crop focuses on the central arch — which is exactly what we want.
- Only the heading text + the three CTA buttons are overlaid, positioned to
  land inside the image's empty center arch. The arch, divider and vines are
  already baked into the picture, so no extra panel/divider is drawn.
- The page background is a matching cream (#f3e6c9) so any object-cover crop
  blends seamlessly at the edges.

Fallback
- If hero-bg.jpg is missing, the hero falls back to the hand-authored
  ornamental SVG composition (warm gradient + inward-facing peacocks + gold
  frame). See components/ui/PeacockOrnament.tsx and OrnateFrame.tsx. These
  SVG components remain in the repo ONLY as this fallback.

Gaudiya Heritage card images (one per section, ~1200x900 landscape):
  heritage-origins.jpg        - Section 01: How Gaudiya Vaishnavism Began
  heritage-prabhupad.jpg      - Section 02: Srila Prabhupad
  heritage-param-gurudev.jpg  - Section 03: Param Gurudev
  heritage-gurudev.jpg        - Section 04: Gurudev
  heritage-teachings.jpg      - Section 05: Core Teachings
  heritage-math.jpg           - Section 06: Sree Chaitanya Gaudiya Math
  heritage-mandir.jpg         - Section 07: Our Mandir's Connection

Custom cursor (optional)
---------------------------------
The site uses a custom tulsi-leaf cursor on mouse (desktop) devices, with a
soft green trail that fades. Drop your leaf image here to use it; until then a
hand-drawn SVG leaf is shown automatically. Transparent PNG, roughly square
(e.g. 256x256), leaf tip pointing toward the top-left works best:

  tulsi-cursor.png  -> the leaf that replaces the mouse cursor
