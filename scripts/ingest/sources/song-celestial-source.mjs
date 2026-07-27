/* ------------------------------------------------------------------ */
/*  Source: "The Song Celestial" — the public-domain English blank-     */
/*  verse Gita (public domain).                                         */
/*                                                                     */
/*  Parses the Project Gutenberg HTML (ebook #2388) into an 18-chapter  */
/*  collection. Each chapter becomes one article of `poem` blocks —     */
/*  centred metrical stanzas with speaker rubrics ("Krishna.",          */
/*  "Arjuna.") — plus each chapter colophon as a closing quote.         */
/*  A preface is ingested as the opening article.                       */
/*                                                                     */
/*  The parser reads a local HTML snapshot by default (committed under  */
/*  content-sources/song-celestial) so the ingest is reproducible with  */
/*  no network. Pass { url } to re-fetch from Gutenberg instead.        */
/* ------------------------------------------------------------------ */

import fs from "node:fs";

const CHAPTER_TITLES = [
  "The Distress of Arjuna",
  "The Book of Doctrines",
  "Virtue in Work",
  "The Religion of Knowledge",
  "The Religion of Renouncing Works",
  "Religion by Self-Restraint",
  "Religion by Discernment",
  "Religion by Service of the Supreme",
  "Religion by the Kingly Knowledge and the Kingly Mystery",
  "Religion by the Heavenly Perfections",
  "The Manifesting of the One and Manifold",
  "The Religion of Faith",
  "Religion by Separation of Matter and Spirit",
  "Religion by Separation from the Qualities",
  "Religion by Attaining the Supreme",
  "The Separateness of the Divine and Undivine",
  "Religion by the Threefold Faith",
  "Religion by Deliverance and Renunciation",
];

const ROMAN = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX",
  "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII",
];

/**
 * Matches a bare sign-off / signature line: a short line, all-caps or a
 * single proper name, optionally followed by post-nominal letters (e.g. a
 * dedication colophon). Such lines are a personal signature, not devotional
 * content, so the parser never emits them as blocks.
 */
const SIGNATURE_RE =
  /^[A-Z][A-Z.\s]{1,28}(?:,\s*[A-Z.]{2,10})?\.?$/;

/** Decode the handful of HTML entities Gutenberg emits, strip tags. */
function decode(text) {
  return String(text)
    .replace(/<[^>]+>/g, "")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/``|''/g, '"');
}

/** Normalise a single line: drop footnote markers, tidy whitespace. */
function cleanLine(line) {
  return decode(line)
    .replace(/\[FN#\d+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split a <p class="poem"> body into a poem block (speaker? + lines). */
function poemBlockFrom(html) {
  const rawLines = html
    .split(/<br\s*\/?>/i)
    .map(cleanLine)
    .filter((l) => l.length > 0 && !SIGNATURE_RE.test(l));
  if (rawLines.length === 0) return null;

  // A leading label like "Krishna." / "Arjuna." / "Sanjaya." is a speaker.
  let speaker;
  let lines = rawLines;
  const first = rawLines[0];
  if (/^[A-Z][A-Za-z]+:?\.?$/.test(first) && rawLines.length > 1) {
    speaker = first.replace(/[:.]+$/, "").trim();
    lines = rawLines.slice(1);
  }
  if (lines.length === 0) return null;
  return { type: "poem", speaker, lines };
}

/** Pull the text of every <p class="poem">…</p> inside a chapter slice. */
function poemParagraphs(slice) {
  const out = [];
  const re = /<p class="poem">([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = re.exec(slice)) !== null) out.push(m[1]);
  return out;
}

/**
 * @param {{ file?: string, url?: string, pdfUrl?: string }} [opts]
 * @returns {Promise<import("../core/types.mjs").RawCollection[]>}
 */
export async function songCelestialSource(opts = {}) {
  let html;
  if (opts.url) {
    const res = await fetch(opts.url);
    if (!res.ok) throw new Error(`fetch ${opts.url} → ${res.status}`);
    html = await res.text();
  } else if (opts.file && fs.existsSync(opts.file)) {
    html = fs.readFileSync(opts.file, "utf8");
  } else {
    console.warn(
      `[song-celestial] no source HTML found at ${opts.file}; skipping.`,
    );
    return [];
  }

  const articles = [];

  /* ---- Preface (opening introduction) -------------------------- */
  const prefaceMatch = html.match(
    /<h3>\s*PREFACE\s*<\/h3>([\s\S]*?)<p class="t3b">\s*CONTENTS/i,
  );
  if (prefaceMatch) {
    const paras = prefaceMatch[1]
      .split(/<\/p>/i)
      .map((p) => cleanLine(p.replace(/<p[^>]*>/i, "")))
      .filter((t) => t.length > 60 && !SIGNATURE_RE.test(t));
    if (paras.length) {
      articles.push({
        title: "Preface — The Song Celestial",
        author: "Bhagavān Śrī Kṛṣṇa",
        category: "Bhagavad Gita",
        tags: ["Bhagavad Gita", "Gaudiya History"],
        blocks: [
          { type: "heading", level: 2, text: "Preface" },
          ...paras.map((text) => ({ type: "paragraph", text })),
        ],
      });
    }
  }

  /* ---- 18 chapters --------------------------------------------- */
  for (let i = 0; i < 18; i++) {
    const startRe = new RegExp(`<h3><a id="chap${String(i + 1).padStart(2, "0")}"`, "i");
    const startIdx = html.search(startRe);
    if (startIdx < 0) continue;

    // Slice runs to the next chapter anchor (or end of document).
    const nextRe = new RegExp(`<h3><a id="chap${String(i + 2).padStart(2, "0")}"`, "i");
    const rest = html.slice(startIdx + 10);
    const nextRel = rest.search(nextRe);
    const slice = nextRel < 0 ? rest : rest.slice(0, nextRel);

    const blocks = [];
    for (const raw of poemParagraphs(slice)) {
      // The chapter colophon ("HERE ENDETH CHAPTER …") is set as a poem
      // paragraph; lift it into a closing quote for a graceful sign-off.
      if (/HERE ENDETH CHAPTER/i.test(raw)) {
        const colophon = raw
          .split(/<br\s*\/?>/i)
          .map(cleanLine)
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        blocks.push({ type: "divider" });
        blocks.push({ type: "quote", text: colophon, attribution: "Bhagavad Gita" });
        continue;
      }
      const block = poemBlockFrom(raw);
      if (block) blocks.push(block);
    }

    if (blocks.length === 0) continue;

    articles.push({
      title: `Chapter ${ROMAN[i]} — ${CHAPTER_TITLES[i]}`,
      author: "Bhagavān Śrī Kṛṣṇa",
      category: "Bhagavad Gita",
      tags: ["Bhagavad Gita", "Krishna", "Bhakti"],
      blocks,
    });
  }

  if (articles.length === 0) return [];

  return [
    {
      slug: "song-celestial-bhagavad-gita",
      kind: "book",
      title: "The Song Celestial",
      subtitle: "The Bhagavad Gita, rendered in English verse",
      description:
        "A celebrated English blank-verse rendering of the Bhagavad-gītā — " +
        "the timeless dialogue between Śrī Kṛṣṇa and Arjuna on the field of " +
        "Kurukṣetra. Read all eighteen chapters here, or download the Hindi " +
        "edition (Gītā Press, Gorakhpur) with the original Sanskrit and " +
        "commentary.",
      year: "1885",
      featured: true,
      pdfUrl: opts.pdfUrl,
      pdfLabel: opts.pdfUrl ? "Hindi PDF" : undefined,
      articles,
    },
  ];
}
