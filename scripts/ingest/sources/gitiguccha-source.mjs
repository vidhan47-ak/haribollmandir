/* ------------------------------------------------------------------ */
/*  Source: "Śrī Gauḍīya Gītiguccha" — a compiled Gauḍīya Vaiṣṇava       */
/*  songbook (Devanāgarī) from the Śrī Chaitanya Gauḍīya Maṭha lineage.  */
/*                                                                      */
/*  Parsed from the CLEAN, born-digital text layer of the searchable    */
/*  PDF (content-sources/geeti_kuccha_extracted.txt, produced by         */
/*  _extract_geeti.mjs). Unlike the original Bhajana Gīti PDF (corrupt    */
/*  OCR), this text layer is trustworthy, so we slice it into songs      */
/*  without retyping a single Devanāgarī character.                      */
/*                                                                      */
/*  The two books share the same tradition and overlap heavily, so every */
/*  parsed song is DEDUPED against the existing Bhajana Gīti collection  */
/*  (by a normalised Devanāgarī first-line / title key). Only songs NOT   */
/*  already present are emitted — "add the new bhajans, nothing repeats". */
/*                                                                      */
/*  STRUCTURE (confirmed):                                               */
/*   • Page delimiters:  ===== PAGE NNNN =====                           */
/*   • Running headers:  even "<devnum> श्रीगौड़ीय–गीतिगुच्छ";              */
/*                       odd  "<section> <devnum>"  (dropped as chrome).  */
/*   • Songs carry short heading lines; Sanskrit/Bengali verses end in    */
/*     a daṇḍa "॥ N॥"; Hindi translations either open with "अनुवाद—" or    */
/*     mirror the verse numbering — both read as prose (Hindi function-   */
/*     word density), while Sanskrit ślokas (≈0 function words) read as    */
/*     verse.                                                             */
/* ------------------------------------------------------------------ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* --------------------------- text helpers ------------------------- */

function tidy(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

/** Precomposed nukta letters → their base, so keys are nukta-insensitive
 *  (गौड़ीय == गौडीय, लीढ़ == लीढ) across the two books' transcriptions. */
const NUKTA_MAP = {
  "\u0958": "\u0915", "\u0959": "\u0916", "\u095A": "\u0917",
  "\u095B": "\u091C", "\u095C": "\u0921", "\u095D": "\u0922",
  "\u095E": "\u092B", "\u095F": "\u092F",
};

/** Devanāgarī letters + matras only (drops digits, daṇḍa, spaces, Latin),
 *  normalised nukta-insensitive for robust cross-book dedupe. */
function devKey(text) {
  let out = "";
  for (const ch of String(text)) {
    const mapped = NUKTA_MAP[ch] || ch;
    const c = mapped.codePointAt(0);
    if (c === 0x093c) continue; // standalone nukta combining mark
    if (c >= 0x0900 && c <= 0x0963) out += mapped;
  }
  return out;
}

function devLen(text) {
  return devKey(text).length;
}

/** Word-preserving Devanāgarī key (letters + single spaces). */
function normKey(text) {
  let out = "";
  let space = false;
  for (const ch of String(text)) {
    const c = ch.codePointAt(0);
    if (c >= 0x0900 && c <= 0x0963) {
      out += ch;
      space = false;
    } else if (!space && out.length) {
      out += " ";
      space = true;
    }
  }
  return out.trim();
}

function cleanTitle(text) {
  let t = tidy(text);
  t = t.replace(/^["'‘’“”(\[{*.\s]+/, "").trim();
  t = t.replace(/[\s|।॥:*_.\-)\]}]+$/, "").trim();
  return t;
}

/** A line closing a stanza with a double daṇḍa "॥" (optionally "॥ N॥"). */
function isStanzaEnd(text) {
  return /॥[\s०-९\d।]*$/.test(text.trim());
}

/* --------------------------- vocabularies ------------------------- */

const HINDI_MARKERS = new Set([
  "हैं", "है", "की", "को", "के", "में", "और", "से", "जो", "कि", "हूँ", "हूं",
  "करता", "करते", "वाले", "वाला", "आदि", "अर्थात", "अर्थात्", "तथा", "यह",
  "वह", "पर", "ने", "भी", "तो", "हो", "गया", "रहे", "कर", "हुए", "हुआ", "उन्हें",
  "उन्हीं", "जिनके", "जिन्होंने", "इस", "उस", "एवं", "अपने", "किया", "होता",
]);

function hindiMarkerCount(text) {
  const words = normKey(text).split(" ").filter(Boolean);
  let n = 0;
  for (const w of words) if (HINDI_MARKERS.has(w)) n += 1;
  return n;
}

/** Heading vocabulary — a short line ending in one of these reads as a title. */
const HEADING_WORDS = [
  "प्रणामः", "प्रणाम", "वन्दना", "वन्दन",
  "ष्टकम्", "ष्टक", "द्वादशकम्", "दशकम्", "एकादशकम्", "स्तवकैकादशकम्", "स्तवकः", "स्तवक",
  "स्तोत्रम्", "स्तोत्र", "गीतम्", "गीति", "गीत", "आरती", "प्रार्थना",
  "कीर्त्तन", "कीर्तन", "महामन्त्र", "महात्म्य", "महिमा", "शिक्षाष्टकम्",
  "ध्वनियाँ", "ध्वनि", "उच्छ्वास", "आक्षेप", "लालसामयी", "लालसा", "विज्ञप्ति",
  "विलाप", "परम्परा", "शरण", "स्तुति", "दैन्य", "याम", "पद", "तत्त्व",
  "नामावली", "मङ्गल", "गुण", "विनोदविहारि",
  // additional section-title endings seen in Gītiguccha
  "निष्ठा", "वर्णन", "माहात्म्य", "शिक्षा", "आत्मनिवेदन", "समर्पण",
  "बोधिका", "प्रार्थनात्मक", "दुःखात्मक", "गुणवर्णन", "रूपानुगत्य",
];
const HEADING_END_RE = new RegExp(
  "(" + HEADING_WORDS.join("|") + ")[\\s।॥ःऽ!'’)\\]-]*$",
);

/** Curated whole-line section headers that don't end in a vocabulary word. */
const CURATED_HEADERS = new Set(
  [
    "हिन्दी कीर्तन", "संस्कृत गीति", "जय ध्वनि", "श्रीगौर तत्त्व",
    "श्रीराधा तत्त्व", "नाम तत्त्व", "आक्षेप", "श्रीराधा प्रार्थना",
    "एकादशी कीर्तन", "गीतम्", "गीति",
  ].map((h) => normKey(h)),
);

const COMPOSERS = [
  [/भक्ति\s*विनोद|भक्तिविनोद|विनोद\s*(कहे|बले|कय|माने|धरे|धरिछे)/, "Bhaktivinoda Ṭhākura"],
  [/नरोत्तम/, "Narottama Dāsa Ṭhākura"],
  [/लोचन/, "Locana Dāsa Ṭhākura"],
  [/वासुदेव\s*घोष/, "Vāsudeva Ghoṣa"],
  [/विश्वनाथ/, "Viśvanātha Cakravartī Ṭhākura"],
  [/रूप\s*गोस्वामी|रूपगोस्वामी/, "Śrīla Rūpa Gosvāmī"],
  [/जयदेव/, "Jayadeva Gosvāmī"],
  [/श्रीनिवास/, "Śrīnivāsa Ācārya"],
  [/भक्तिवेदान्त|त्रिविक्रम/, "Śrīla Bhakti Vedānta Trivikrama Mahārāja"],
  [/भक्तिप्रज्ञान\s*केशव|केशव/, "Śrīla Bhakti Prajñāna Keśava Gosvāmī Mahārāja"],
  [/भक्तिसिद्धान्त|सरस्वती/, "Śrīla Bhaktisiddhānta Sarasvatī Ṭhākura"],
  [/जयदेव|गीतगोविन्द/, "Jayadeva Gosvāmī"],
  [/ब्रह्माण्ड\s*पुराण/, "Brahmāṇḍa Purāṇa"],
];
function composerFrom(text) {
  for (const [re, name] of COMPOSERS) if (re.test(text)) return name;
  return null;
}

function deriveTags(title, body) {
  const hay = `${title}\n${body}`;
  const tags = new Set();
  if (/गुरु|गौरकिशोर|भक्तिविनोद|प्रभुपाद|परम्परा|केशव|सरस्वती/.test(hay)) tags.add("Guru Tattva");
  if (/कृष्ण|गोविन्द|गोपाल|श्याम|मुरारी|माधव|यशोदा|नन्दनन्दन|मदन|गिरिधारी|कन्हैया/.test(hay)) tags.add("Krishna");
  if (/राधा|राधे|राधिका|वृषभानु|गान्धर्वा|ललिता/.test(hay)) tags.add("Radha");
  if (/गौर|गौरांग|गौराङ्ग|चैतन्य|महाप्रभु|निमाइ|शची|नदिया/.test(hay)) tags.add("Mahaprabhu");
  if (/नित्यानन्द|निताइ|निताई|बलदेव|बलराम/.test(hay)) tags.add("Nityananda");
  if (/हरिनाम|नाम-?संकीर्तन|नाम-?ध्वनि|महामन्त्र|कीर्तन|संकीर्तन|हरे कृष्ण|हरिबोल/.test(hay)) tags.add("Harinam");
  if (/जगन्नाथ|नीलाचल|पुरी|सुभद्रा/.test(hay)) tags.add("Jagannath");
  if (/वृन्दावन|यमुना|राधाकुण्ड|श्यामकुण्ड|गोवर्धन/.test(hay)) tags.add("Rasa");
  tags.add("Bhakti");
  return [...tags].slice(0, 6);
}

/* --------------------------- line typing -------------------------- */

/** Running header / book-title / bare-number chrome to drop. */
function isChrome(line, isFirstOfPage) {
  const t = line.trim();
  if (!t) return true;
  if (/गीतिगुच्छ/.test(t)) return true; // "<n> श्रीगौड़ीय–गीतिगुच्छ" (even header)
  if (/^[०-९\s.]+$/.test(t)) return true; // bare page number
  if (isFirstOfPage && /[०-९]\s*$/.test(t) && !/[।॥]/.test(t) && devLen(t) <= 40) {
    return true; // "<section> <n>" (odd running header) — duplicated by body heading
  }
  return false;
}

function isHeading(line, nextLine) {
  let t = line.trim();
  // allow a wholly-parenthetical section label e.g. "(एकादशी–कीर्तन)"
  const paren = /^[(（].*[)）]$/.test(t);
  if (paren) t = t.replace(/^[(（]|[)）]$/g, "").trim();
  if (/^अनुवाद/.test(t)) return false;
  if (/^[०-९]/.test(t)) return false; // starts with a page/verse number → not a title
  const dev = devLen(t);
  if (dev < 3 || dev > 40) return false; // real titles are short; long = a sentence
  if (/[।॥]/.test(t)) return false; // verses carry daṇḍas
  if (/,/.test(t)) return false; // titles have no commas; translation sentences do
  if (/[–—]\s*$/.test(t)) return false; // verse lines wrap on a trailing dash
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length > 8) return false;
  if (hindiMarkerCount(t) >= 2) return false; // a prose sentence, not a title
  const key = normKey(t);
  if (HEADING_END_RE.test(t)) return true;
  if (CURATED_HEADERS.has(key)) return true;
  // NOTE: no generic "short line before a verse" rule — it shatters multi-line
  // stanzas into fake songs. Song titles here reliably end in the heading
  // vocabulary above (or are curated section headers).
  return false;
}

/* ------------------------ block assembly -------------------------- */

/**
 * Segment one song's body lines into verse (poem) and Hindi-prose (paragraph)
 * blocks. A stanza is flushed on its closing daṇḍa "॥"; its type is decided by
 * Hindi function-word density (Sanskrit śloka ≈ 0 → verse; Hindi translation →
 * prose). An "अनुवाद—" line forces prose until the next heading.
 */
/**
 * Segment a song's body lines into verse (poem) and Hindi-prose (paragraph)
 * blocks. Lines accumulate into a stanza that is flushed on its closing daṇḍa
 * "॥" (or at an "अनुवाद" marker / heading). The stanza's type is decided by
 * Hindi function-word DENSITY across the whole stanza — not per line — so a
 * translation sentence the PDF wrapped across lines (its content words on one
 * line, its "…करता हूँ" on the next) is still recognised as prose, while a
 * Sanskrit śloka or a Bengali/Hindi lyric stanza (few function words relative
 * to its length) stays verse.
 */
function buildBlocks(items) {
  const blocks = [];
  let region = [];
  let proseMode = false; // set once "अनुवाद" appears, until the next heading

  const flush = () => {
    if (!region.length) return;
    let marks = 0;
    let dev = 0;
    for (const l of region) {
      marks += hindiMarkerCount(l);
      dev += devLen(l);
    }
    // ≥1 Hindi function word per ~50 Devanāgarī letters reads as prose.
    const isProse = proseMode || (marks >= 2 && marks * 50 >= dev);
    if (isProse) {
      const text = tidy(region.join(" "));
      if (text) blocks.push({ type: "paragraph", text });
    } else {
      blocks.push({ type: "poem", lines: region.slice() });
    }
    region = [];
  };

  for (const it of items) {
    if (it.kind === "heading") {
      flush();
      proseMode = false;
      const text = cleanTitle(it.text);
      if (text) blocks.push({ type: "heading", level: 3, text });
      continue;
    }
    let line = tidy(it.text);
    if (!line) continue;
    if (/^अनुवाद\s*[—–-]*/.test(line)) {
      flush();
      proseMode = true;
      line = line.replace(/^अनुवाद\s*[—–-]*\s*/, "").trim();
      if (!line) continue;
    }
    region.push(line);
    if (isStanzaEnd(line)) flush();
  }
  flush();
  return blocks;
}

function excerptFor(items) {
  const first = items.find((it) => it.kind === "body" && devLen(it.text) > 2);
  return first ? tidy(first.text).slice(0, 200) : "";
}

function firstBodyLine(items) {
  const first = items.find((it) => it.kind === "body" && devLen(it.text) > 2);
  return first ? first.text : "";
}

/* --------------------------- dedupe key --------------------------- */

/** Normalised Devanāgarī key of the opening words (first ~16 letters). */
function openingKey(text) {
  return devKey(text).slice(0, 16);
}
function titleKeyOf(text) {
  return devKey(cleanTitle(text)).slice(0, 24);
}

/** Collect first-line + title keys from the existing Bhajana Gīti collection. */
function bhajanGitiKeys(rootDir) {
  const keys = new Set();
  const file = path.join(rootDir, "content", "grantha", "bhajan-giti.json");
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    console.warn("[gitiguccha] bhajan-giti.json not found — dedupe disabled");
    return keys;
  }
  for (const a of json.articles || []) {
    if (a.title) keys.add("t:" + titleKeyOf(a.title));
    // opening line: first poem line, else first paragraph, else excerpt
    let opening = "";
    for (const b of a.blocks || []) {
      if (b.type === "poem" && b.lines?.length) { opening = b.lines[0]; break; }
      if (b.type === "paragraph" && b.text) { opening = b.text; break; }
    }
    if (!opening) opening = a.excerpt || "";
    const k = openingKey(opening);
    if (k.length >= 8) keys.add("o:" + k);
  }
  return keys;
}

/* --------------------------- file parsing ------------------------- */

function readBodyLines(sourcePath) {
  let raw = fs.readFileSync(sourcePath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  const pages = raw.split(/^===== PAGE \d+ =====$/m).slice(1);
  const out = [];
  for (const page of pages) {
    const lines = page.split(/\r?\n/);
    let firstSeen = false;
    for (const rawLine of lines) {
      const clean = tidy(rawLine);
      if (!clean) continue;
      const isFirst = !firstSeen;
      firstSeen = true;
      if (isChrome(clean, isFirst)) continue;
      out.push(clean);
    }
  }
  return out;
}

/* ---------------------------- assembly ---------------------------- */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..");

function dedupeSlugs(articles) {
  const seen = new Map();
  articles.forEach((a, i) => {
    let base = a.title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!base) base = `gitiguccha-${i + 1}`;
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    a.slug = n === 0 ? base : `${base}-${n + 1}`;
  });
  return articles;
}

/**
 * @param {{ sourcePath: string, pdfUrl?: string, pdfLabel?: string, addedAt?: string }} opts
 * @returns {Promise<import("../core/types.mjs").RawCollection[]>}
 */
export async function gitigucchaSource(opts) {
  const { sourcePath, pdfUrl, pdfLabel, addedAt } = opts;
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    console.warn(`[gitiguccha] extracted text not found: ${sourcePath}`);
    return [];
  }

  const lines = readBodyLines(sourcePath);
  const bgKeys = bhajanGitiKeys(ROOT);

  // Segment into songs by heading lines.
  const songs = [];
  let cur = null;
  const startSong = (title) => {
    cur = { title: cleanTitle(title), items: [], attribution: null };
    songs.push(cur);
  };
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const next = lines[i + 1] || "";

    if (isHeading(line, next)) {
      startSong(line);
      continue;
    }
    if (!cur) continue; // preamble before the first heading (jaya-dhvani intro)

    // Wholly-parenthetical author attribution line.
    if (/^[(（].*[)）]$/.test(line)) {
      const comp = composerFrom(line.slice(1, -1));
      if (comp) cur.attribution = comp;
      continue;
    }
    cur.items.push({ kind: "body", text: line });
  }

  // Build articles, dedupe against Bhajana Gīti + internally.
  const internalKeys = new Set();
  const articles = [];
  let dropped = 0;
  for (const song of songs) {
    if (!song.items.some((it) => it.kind === "body")) continue;
    const opening = firstBodyLine(song.items);
    const oKey = openingKey(opening);
    const tKey = titleKeyOf(song.title);

    // Duplicate of a Bhajana Gīti song? (same opening line or same title.)
    if (bgKeys.has("o:" + oKey) || bgKeys.has("t:" + tKey)) { dropped += 1; continue; }
    // Internal duplicate within Gītiguccha?
    if (oKey.length >= 8 && internalKeys.has(oKey)) { dropped += 1; continue; }
    if (oKey.length >= 8) internalKeys.add(oKey);

    const blocks = buildBlocks(song.items);
    if (!blocks.some((b) => b.type === "poem" || b.type === "paragraph")) continue;

    const bodyText = song.items.map((it) => it.text).join("\n");
    const author = song.attribution || composerFrom(bodyText) || "Gauḍīya Vaiṣṇava Tradition";

    articles.push({
      title: song.title || "गीति",
      author,
      category: "Kirtan",
      tags: deriveTags(song.title, bodyText),
      excerpt: excerptFor(song.items),
      blocks,
      language: { code: "hi", label: "Devanagari" },
      sourceCategory: "Bhajan",
      contentAvailability: "text",
    });
  }

  dedupeSlugs(articles);
  console.log(
    `[gitiguccha] songs parsed: ${songs.length}, unique kept: ${articles.length}, deduped: ${dropped}`,
  );

  return [
    {
      slug: "gaudiya-gitiguccha",
      kind: "book",
      title: "Śrī Gauḍīya Gītiguccha",
      description:
        "Bhajans and kīrtanas from Śrī Gauḍīya Gītiguccha — the songbook of " +
        "the Śrī Chaitanya Gauḍīya Maṭha lineage. Only the songs not already " +
        "in the Bhajana Gīti collection are gathered here, so nothing repeats.",
      pdfUrl,
      pdfLabel,
      featured: false,
      addedAt,
      articles,
    },
  ];
}
