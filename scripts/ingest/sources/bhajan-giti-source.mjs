/* ------------------------------------------------------------------ */
/*  Source: "Bhajana Gīti" — a compiled Gauḍīya Vaiṣṇava bhajan /       */
/*  kīrtana songbook (Devanāgarī), sung in daily temple worship.       */
/*                                                                     */
/*  This source parses a HUMAN-VERIFIED, word-for-word plain-text        */
/*  transcription of the whole book (content-sources/…word_verified.txt) */
/*  — NOT the OCR/PDF text layer, which was corrupt. Because the source  */
/*  text is already clean Unicode, there is NO glyph repair, no pdfjs    */
/*  and no PDF geometry here: we only SLICE the verified text into        */
/*  articles / blocks, never paraphrasing, transliterating or retyping    */
/*  a single Devanāgarī character.                                        */
/*                                                                     */
/*  FILE STRUCTURE (confirmed):                                          */
/*   • Page delimiters:  ===== IMAGE PAGE NNNN =====                      */
/*   • Pages 0001–0006 = printed index (भजन-सूची): "<first-line> <pg>".   */
/*   • Page 0007 onward = body; each body page begins with a bare page-   */
/*     number line then the running header "भजन-गीति".                    */
/*   • Songs carry short heading lines; Sanskrit / Bengali-in-Devanāgarī  */
/*     verses end in a daṇḍa (॥ 2॥); Hindi translations are long prose    */
/*     ending in "(2)". Author lines are wholly parenthetical.            */
/*                                                                     */
/*  Song boundaries are recovered from (a) short heading lines that match */
/*  a heading vocabulary / curated section header, and (b) body lines     */
/*  whose Devanāgarī prefix matches a first-line key harvested from the    */
/*  printed index. A handful of repetitive tail sections (jaya-dhvani,    */
/*  śrī-nāma-dhvani, śrī-nāma-mahimā, dainika-vandanā) are kept as single  */
/*  articles so their repeated praṇāmas are not duplicated.               */
/* ------------------------------------------------------------------ */

import fs from "node:fs";

/* --------------------------- text helpers ------------------------- */

/** Collapse every run of whitespace to a single space and trim. */
function tidy(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

/** Extract only Devanāgarī letters + matras (no digits, daṇḍa, spaces). */
function devKey(text) {
  let out = "";
  for (const ch of String(text)) {
    const c = ch.codePointAt(0);
    if (c >= 0x0900 && c <= 0x0963) out += ch; // letters, vowels, matras, avagraha
  }
  return out;
}

/** Count Devanāgarī letters/matras in a string. */
function devLen(text) {
  return devKey(text).length;
}

/**
 * Word-preserving Devanāgarī key: letters + single spaces (drops digits,
 * daṇḍa, Latin, punctuation). Used for whole-line title / curated matching.
 */
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

/** Trim wrapping quotes/brackets and trailing stray punctuation from a title. */
function cleanTitle(text) {
  let t = tidy(text);
  t = t.replace(/^["'‘’“”(\[{*.\s]+/, "").trim();
  t = t.replace(/[\s|।॥:*_.\-)\]}]+$/, "").trim();
  return t;
}

/** A line ending in a daṇḍa (। or ॥, optionally with a stanza number). */
function endsWithDanda(text) {
  return /[।॥]\s*[०-९\d]*\s*[।॥]?\s*$/.test(text);
}

/** Does a verse line close a stanza (ends in ॥, optionally "॥ N॥")? */
function isStanzaEnd(text) {
  return /॥\s*[०-९\d]*\s*॥?\s*$/.test(text);
}

/* --------------------------- vocabularies ------------------------- */

/**
 * Heading vocabulary — a short line that ENDS with one of these words (allowing
 * trailing punctuation) reads as a song/section title. Longer forms are listed
 * before their prefixes so the end-anchored match prefers the full word.
 */
const HEADING_WORDS = [
  "मंगलाचरण",
  "प्रणामः", "प्रणाम",
  "वन्दना",
  // "अष्टकम्" family: sandhi turns the independent अ into a matra in compounds
  // (श्रीगुरुदेव + अष्टकम् → श्रीगुरुदेवाष्टकम्), so match the surviving core "ष्टकम्".
  // Matched WITH its final म् so the bare word पिष्टक (a food term) is not a title.
  "ष्टकम्",
  "द्वादशकम्",
  "स्तवकैकादशकम्", "स्तवकः", "स्तवक",
  "स्तोत्रम्", "स्तोत्र",
  "गीतम्", "गीत",
  "आरती",
  "प्रार्थना",
  "कीर्त्तन", "कीर्तन",
  "महामन्त्र",
  "महात्म्य", "महिमा",
  "शिक्षाष्टकम्", "शिक्षा",
  "ध्वनियाँ", "ध्वनि",
  "उच्छ्वास", "उच्छूवास",
  "आक्षेप",
  "लालसामयी", "लालसा",
  "विज्ञप्ति",
  "विलाप",
  "परम्परा",
  "शरण",
  "स्तुति",
  "दैन्य",
  "याम",
  "पद",
];

const HEADING_END_RE = new RegExp(
  "(" + HEADING_WORDS.join("|") + ")[\\s।॥ःऽ!'’)\\]-]*$",
);

/**
 * Curated section headers (full-line matches, normalised). Some do not end in a
 * heading-vocabulary word, so they are recognised by whole-line equality.
 */
const CURATED_HEADERS = new Set(
  [
    "मंगलाचरण", "प्रार्थना", "उच्छ्वास", "आक्षेप", "लालसामयी-प्रार्थना",
    "सावरण-श्रीगौरमहिमा", "स्वाभीष्ट-लालसा", "दैन्य-बोधिका-प्रार्थना",
    "दैन्य-अपराधात्मक", "प्रातःकालीय कीर्तन", "उच्छ्वास कीर्त्तन",
    "मंगल-आरती", "सन्ध्या-आरती", "श्रीभोग-आरती", "श्रीतुलसी-आरती",
    "श्रीतुलसी-वन्दना", "प्रसाद-सेवाकालिक कीर्त्तन", "हिन्दी-कीर्त्तन",
    "श्रीगौर-गोपाल कीर्तन", "श्रीगौरहरि कीर्त्तन", "विरह कीर्तन",
    "मंगला-कीर्तन", "ब्रज के पद", "गोविन्द-दामोदर स्तोत्र",
    "प्रथम-याम-कीर्तन", "द्वितीय-याम-कीर्तन", "तृतीय-याम कीर्तन",
    "चतुर्थ-याम कीर्तन", "पंचम-याम-कीर्तन", "षष्ठ-याम-कीर्तन",
    "सप्तम-याम-कीर्तन", "अष्टम-याम-कीर्तन",
  ].map((h) => normKey(h)),
);

/** Sections whose many verses stay together (don't split on index anchors). */
const STOTRA_RE =
  /(ष्टक|स्तोत्र|स्तवक|द्वादशक|गीतम|याम|आरती|महामन्त्र|परम्परा|वन्दना|महिमा|ध्वनि|दशावतार)/;

/** Hindi function words that mark a long line as translation / commentary. */
const HINDI_MARKERS = new Set([
  "हैं", "है", "की", "को", "के", "में", "और", "से", "जो", "कि", "हूँ", "हूं",
  "करता", "करते", "वाले", "वाला", "आदि", "अर्थात", "अर्थात्", "तथा", "यह",
  "वह", "पर", "ने", "भी", "तो", "हो", "गया", "रहे", "कर",
]);

/** Pure invocation / benediction lines to drop wherever they appear. */
const DROP_LINES = new Set([normKey("श्री श्रीगुरु गौरांगौ जयतः")]);

/* ------------------------ known attributions ---------------------- */

/** Map a Devanāgarī composer signature / attribution to a roman author. */
const COMPOSERS = [
  [/भक्ति\s*विनोद|भक्तिविनोद|विनोद\s*(कहे|बले|कय|माने|धरे|धरिछे)/, "Bhaktivinoda Ṭhākura"],
  [/नरोत्तम/, "Narottama Dāsa Ṭhākura"],
  [/लोचन/, "Locana Dāsa Ṭhākura"],
  [/वासुदेव\s*घोष/, "Vāsudeva Ghoṣa"],
  [/विश्वनाथ/, "Viśvanātha Cakravartī Ṭhākura"],
  [/रूप\s*गोस्वामी|रूपगोस्वामी/, "Śrīla Rūpa Gosvāmī"],
  [/जयदेव/, "Jayadeva Gosvāmī"],
  [/श्रीनिवास\s*आचार्य/, "Śrīnivāsa Ācārya"],
  [/वृन्दावन\s*दास/, "Vṛndāvana Dāsa Ṭhākura"],
  [/वल्लभाचार्य/, "Vallabhācārya"],
  [/सत्यव्रत\s*मुनि/, "Satyavrata Muni"],
  [/विद्यापति/, "Vidyāpati"],
  [/मीरा/, "Mīrābāī"],
  [/सूरदास/, "Sūradāsa"],
  [/तुलसीदास/, "Tulasīdāsa"],
  [/भक्ति\s*कुमुद\s*सन्त/, "Śrīla Bhakti Kumud Santa Mahārāja"],
  [/भक्ति\s*रक्षक|श्रीधर/, "Śrīla Bhakti Rakṣaka Śrīdhara Mahārāja"],
  [/ब्रह्म\s*संहिता|ब्रह्मसंहिता/, "Brahma-saṁhitā"],
  [/देवकीनन्दन/, "Devakīnandana Dāsa"],
];

function composerFrom(text) {
  for (const [re, name] of COMPOSERS) if (re.test(text)) return name;
  return null;
}

/* --------------------------- tag mapping -------------------------- */

/** Derive tags from the (Devanāgarī) title + body, from TAG_VOCABULARY. */
function deriveTags(title, body) {
  const hay = `${title}\n${body}`;
  const tags = new Set();
  if (/गुरु|गौरकिशोर|भक्तिविनोद|प्रभुपाद|परम्परा/.test(hay)) tags.add("Guru Tattva");
  if (/कृष्ण|गोविन्द|गोपाल|श्याम|मुरारी|माधव|यशोदा|नन्दनन्दन|मदनमोहन|गिरिधारी/.test(hay)) tags.add("Krishna");
  if (/राधा|राधे|राधिका|वृषभानु/.test(hay)) tags.add("Radha");
  if (/गौर|गौरांग|चैतन्य|महाप्रभु|निमाइ|शचीनन्दन|नदिया/.test(hay)) tags.add("Mahaprabhu");
  if (/नित्यानन्द|निताइ|निताई|बलदेव|बलराम/.test(hay)) tags.add("Nityananda");
  if (/हरिनाम|नाम-?संकीर्तन|नाम-?ध्वनि|महामन्त्र|कीर्तन|संकीर्तन|हरे कृष्ण|हरिबोल|हरि बोल/.test(hay))
    tags.add("Harinam");
  if (/जगन्नाथ|नीलाचल|पुरी|सुभद्रा/.test(hay)) tags.add("Jagannath");
  if (/तुलसी/.test(hay)) tags.add("Bhakti");
  if (tags.size === 0) tags.add("Bhakti");
  // Keep Bhakti present as a base tag for the library filter.
  tags.add("Bhakti");
  return [...tags].slice(0, 6);
}

/* --------------------------- line typing -------------------------- */

/** Running header / index title / ornamental / number-only lines to drop. */
function isChrome(text) {
  const t = text.trim();
  if (!t) return true;
  if (/^भजन\s*[-–]?\s*(गीति|सूची)$/.test(t)) return true; // header / index title
  if (devLen(t) === 0) return true; // page numbers, "▲ ▲ ▲ ▲", "1-", punctuation
  return false;
}

/**
 * Long Hindi translation / commentary prose vs. a Sanskrit / Bengali verse.
 * A stanza-numbered ending is always a verse; a "(N)" ending is always prose;
 * otherwise a long line with ≥2 Hindi function words reads as prose.
 */
function isProse(text) {
  const t = text.trim();
  if (isStanzaEnd(t)) return false; // "॥ 2॥" → verse
  if (/\([०-९\d]+\)\s*$/.test(t)) return true; // "…। (2)" → translation unit
  const words = normKey(t).split(" ").filter(Boolean);
  let marks = 0;
  for (const w of words) if (HINDI_MARKERS.has(w)) marks += 1;
  return marks >= 2 && devLen(t) >= 30;
}

/** Is this line a song/section title (heading vocabulary or curated header)? */
function isTitleLine(text) {
  const t = text.trim();
  if (!t) return false;
  if (endsWithDanda(t)) return false; // verses end in a daṇḍa
  if (/,\s*$/.test(t)) return false; // verses wrap on a trailing comma
  const dev = devLen(t);
  if (dev < 3 || dev > 55) return false;
  if (t.split(/\s+/).filter(Boolean).length > 8) return false;
  if (isProse(t)) return false;
  if (HEADING_END_RE.test(t)) return true;
  const key = normKey(t);
  if (CURATED_HEADERS.has(key)) return true;
  for (const h of CURATED_HEADERS) if (key.startsWith(h + " ") || h.startsWith(key + " ")) return true;
  return false;
}

/* ----------------------------- index ------------------------------ */

const MIN_ANCHOR_DEV = 9; // minimum matched Devanāgarī length to trust an anchor

/**
 * Harvest first-line keys from the printed index (भजन-सूची) pages. Each content
 * line holds 1–2 entries of the form "<first-line words> <pageNumber>".
 * @returns {{ byHead: Map<string, {key:string,raw:string}[]> }}
 */
function extractIndex(indexPages) {
  const entries = [];
  const seen = new Set();
  for (const page of indexPages) {
    for (const line of page.lines) {
      if (!/[०-९\d]/.test(line)) continue; // alphabet header (no page number)
      const tokens = line.split(" ");
      let buf = [];
      for (const tok of tokens) {
        if (/^[०-९\d]+$/.test(tok)) {
          const raw = cleanTitle(buf.join(" "));
          const key = devKey(normKey(raw));
          if (key.length >= MIN_ANCHOR_DEV && !seen.has(key)) {
            seen.add(key);
            entries.push({ key, raw });
          }
          buf = [];
        } else {
          buf.push(tok);
        }
      }
    }
  }
  const byHead = new Map();
  for (const e of entries) {
    const head = e.key.slice(0, 8);
    if (!byHead.has(head)) byHead.set(head, []);
    byHead.get(head).push(e);
  }
  // Longest keys first so a body line matches its most specific first-line.
  for (const list of byHead.values()) list.sort((a, b) => b.key.length - a.key.length);
  return { byHead };
}

/**
 * If a body line opens a song listed in the index, return the index entry.
 *
 * Matching is space-insensitive on the Devanāgarī letters (the printed index
 * compresses spaces, e.g. "एइबार" vs the body's "एइ बार") BUT the index key
 * must end exactly at a body WORD boundary. That word-boundary requirement is
 * what stops "कलियुग पावन" (an index key) from matching the middle of the prose
 * word "कलियुग पावनावतारी…".
 */
function indexAnchor(lineText, byHead) {
  const words = normKey(lineText).split(" ").filter(Boolean);
  if (!words.length) return null;
  // Cumulative Devanāgarī-letter string and the offsets that fall on a word end.
  let full = "";
  const wordEnds = new Set();
  for (const w of words) {
    full += devKey(w);
    wordEnds.add(full.length);
  }
  if (full.length < MIN_ANCHOR_DEV) return null;
  const candidates = byHead.get(full.slice(0, 8));
  if (!candidates) return null;
  for (const e of candidates) {
    // candidates are longest-first, so the most specific first-line wins.
    if (e.key.length >= MIN_ANCHOR_DEV && wordEnds.has(e.key.length) && full.startsWith(e.key)) {
      return e;
    }
  }
  return null;
}

/* ------------------------ block assembly -------------------------- */

/** Count Hindi function-word markers (from HINDI_MARKERS) in a line. */
function hindiMarkerCount(text) {
  const words = normKey(text).split(" ").filter(Boolean);
  let n = 0;
  for (const w of words) if (HINDI_MARKERS.has(w)) n += 1;
  return n;
}

/** Line ends with a translation index like "(2)" / "(१२)". */
function endsParenNum(text) {
  return /\([०-९\d]+\)\s*$/.test(text);
}

/**
 * Segment a song's body lines into verse (poem) and Hindi-prose (paragraph)
 * blocks by REGION, not per line. Lines accumulate into a pending region until
 * a DEFINITIVE terminator resolves the whole region's type:
 *   • a line closing a stanza with a daṇḍa "॥ (N)॥"  → the region is VERSE;
 *   • a line closing a translation with an index "(N)" → the region is PROSE.
 * A line ending in a bare daṇḍa "।" is ambiguous (a Sanskrit half-line OR a
 * prose sentence break), so it only accumulates and waits for the terminator.
 *
 * This is the crux of the fix: a translation's OPENING lines frequently carry
 * < 2 Hindi function words (name-lists, "kaliyuga-pāvanāvatārī …"), and the old
 * per-line classifier — seeded to "verse" after the śloka — mis-typed them as
 * brown-italic verse until a later line accumulated enough markers. By binding
 * every line up to the closing "(N)" into ONE prose region, those opening lines
 * are typed as prose along with the rest of the explanation.
 *
 * Regions that never reach a definitive terminator (an OCR-lost "(N)"/"॥", or a
 * song that ends mid-thought) are resolved by `flushDefault`: once a verse has
 * been emitted in the article, a residual region carrying Hindi prose markers
 * is the trailing translation (prose); otherwise it stays verse.
 */
function buildBlocks(items) {
  const blocks = [];
  let region = [];
  let emittedVerse = false;

  const flushVerse = () => {
    if (!region.length) return;
    blocks.push({ type: "poem", lines: region });
    region = [];
    emittedVerse = true;
  };
  const flushProse = () => {
    if (!region.length) return;
    const text = tidy(region.join(" "));
    if (text) blocks.push({ type: "paragraph", text });
    region = [];
  };
  const flushDefault = () => {
    if (!region.length) return;
    let marks = 0;
    for (const l of region) marks += hindiMarkerCount(l);
    if (emittedVerse && marks >= 2) flushProse();
    else flushVerse();
  };

  for (const it of items) {
    if (it.kind === "heading") {
      flushDefault();
      const text = cleanTitle(it.text);
      if (text) blocks.push({ type: "heading", level: 3, text });
      continue;
    }
    const line = tidy(it.text);
    if (!line) continue;
    region.push(line);
    if (isStanzaEnd(line)) flushVerse();       // "॥ 2॥" closes a stanza → verse
    else if (endsParenNum(line)) flushProse(); // "…। (2)" closes a translation → prose
  }
  flushDefault();
  return blocks;
}

/** First readable verse/prose line of an article → excerpt (≤ 200 chars). */
function excerptFor(items) {
  const first = items.find((it) => it.kind === "body" && devLen(it.text) > 2);
  return first ? tidy(first.text).slice(0, 200) : "";
}

/** Turn a collected article into a RawArticle (or null if it has no content). */
function toArticle(article) {
  const blocks = buildBlocks(article.items);
  if (!blocks.some((b) => b.type === "poem" || b.type === "paragraph")) return null;

  const bodyText = article.items
    .filter((it) => it.kind === "body")
    .map((it) => it.text)
    .join("\n");
  const author =
    article.attribution || composerFrom(bodyText) || "Gauḍīya Vaiṣṇava Tradition";

  return {
    title: cleanTitle(article.title) || "भजन",
    author,
    category: "Kirtan",
    tags: deriveTags(article.title, bodyText),
    excerpt: excerptFor(article.items),
    blocks,
    language: { code: "hi", label: "Devanagari" },
    sourceCategory: "Bhajan",
    contentAvailability: "text",
  };
}

/** Make article slugs unique within the collection (Devanāgarī → seeded). */
function dedupeSlugs(articles) {
  const seen = new Map();
  articles.forEach((a, i) => {
    let base = a.title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!base) base = `bhajana-${i + 1}`;
    const n = seen.get(base) || 0;
    seen.set(base, n + 1);
    a.slug = n === 0 ? base : `${base}-${n + 1}`;
  });
  return articles;
}

/* ------------------------- collapse sections ---------------------- */

/**
 * Repetitive tail sections kept as a SINGLE article each (printed page → title).
 * From each start page until the next collapse section (or the book's end),
 * all verses/headings fold into one article so repeated praṇāmas / dhvanis are
 * not duplicated.
 */
const COLLAPSE_SECTIONS = [
  { startPage: 224, title: "नगर-संकीर्तन जय-ध्वनि" },
  { startPage: 226, title: "श्रीनृसिंह जय-ध्वनि" },
  { startPage: 229, title: "श्रीनाम-ध्वनियाँ" },
  { startPage: 230, title: "श्रीनाम-महिमा" },
  { startPage: 232, title: "दैनिक वन्दना" },
];

/** The active collapse section for a printed page, or null. */
function collapseSectionFor(page) {
  let found = null;
  for (const s of COLLAPSE_SECTIONS) if (page >= s.startPage) found = s;
  return found;
}

/* --------------------------- file parsing ------------------------- */

/**
 * Split the verified transcription into pages, dropping chrome. Each body page
 * gets a printed page number (image page − 6; image 0007 == printed page 1).
 */
function readPages(sourcePath) {
  let raw = fs.readFileSync(sourcePath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1); // strip BOM
  const lines = raw.split(/\r?\n/);

  const pages = [];
  let cur = null;
  for (const rawLine of lines) {
    const delim = rawLine.match(/^=====\s*IMAGE PAGE\s+(\d{4})\s*=====\s*$/);
    if (delim) {
      const image = parseInt(delim[1], 10);
      cur = { image, printed: image - 6, lines: [] };
      pages.push(cur);
      continue;
    }
    if (!cur) continue; // anything before the first delimiter
    const clean = tidy(rawLine);
    if (isChrome(clean)) continue;
    cur.lines.push(clean);
  }
  return pages;
}

/* ---------------------------- assembly ---------------------------- */

/**
 * @param {{ sourcePath: string, pdfUrl?: string, pdfLabel?: string, addedAt?: string }} opts
 * @returns {Promise<import("../core/types.mjs").RawCollection[]>}
 */
export async function bhajanGitiSource(opts) {
  const { sourcePath, pdfUrl, pdfLabel, addedAt } = opts;

  if (!sourcePath || !fs.existsSync(sourcePath)) {
    console.warn(`[bhajan-giti] verified transcription not found: ${sourcePath}`);
    return [];
  }

  const pages = readPages(sourcePath);
  // Index = pages up to (but excluding) the first body page. The body begins at
  // printed page 1 (image page 0007); index pages are the six before it.
  const firstBody = pages.findIndex((p) => p.printed >= 1);
  const indexPages = firstBody > 0 ? pages.slice(0, firstBody) : pages.slice(0, 6);
  const bodyPages = firstBody >= 0 ? pages.slice(firstBody) : [];
  const { byHead } = extractIndex(indexPages);

  // Flatten the body into an ordered stream of { page, text } lines.
  const stream = [];
  for (const p of bodyPages) for (const text of p.lines) stream.push({ page: p.printed, text });

  const articles = [];
  let cur = null;
  let collapseTitle = null;

  const newArticle = (title, opts2 = {}) => ({
    title,
    items: [],
    attribution: null,
    isStotra: Boolean(opts2.isStotra),
    lastAnchor: null,
  });
  const hasBody = (a) => a && a.items.some((it) => it.kind === "body");
  const bodyCount = (a) => (a ? a.items.filter((it) => it.kind === "body").length : 0);
  const finalize = (a) => {
    if (!a) return;
    const built = toArticle(a);
    if (built) articles.push(built);
  };

  for (const { page, text } of stream) {
    const t = tidy(text);
    if (!t) continue;

    // (0) Enter / switch a collapse section on its start page.
    const sec = collapseSectionFor(page);
    if (sec && sec.title !== collapseTitle) {
      finalize(cur);
      collapseTitle = sec.title;
      cur = newArticle(sec.title, { isStotra: true });
    }

    if (DROP_LINES.has(normKey(t))) continue;

    // (A) Collapse mode — no further splitting; sub-labels become headings.
    if (collapseTitle) {
      if (normKey(t) === normKey(collapseTitle)) continue; // the section title itself
      if (/^[(\[].*[)\]]$/.test(t)) {
        const comp = composerFrom(t.slice(1, -1));
        if (comp && cur) cur.attribution = comp;
        continue;
      }
      if (isTitleLine(t)) cur.items.push({ kind: "heading", text: t });
      else cur.items.push({ kind: "body", text: t });
      continue;
    }

    // (B) Wholly-parenthetical author / attribution line.
    if (/^[(\[].*[)\]]$/.test(t)) {
      if (cur) {
        const comp = composerFrom(t.slice(1, -1));
        if (comp) cur.attribution = comp;
      }
      continue;
    }

    // (C) Heading title — hard song boundary (or a leading sub-label).
    if (isTitleLine(t)) {
      if (hasBody(cur)) {
        finalize(cur);
        cur = newArticle(cleanTitle(t), { isStotra: STOTRA_RE.test(t) });
      } else if (cur) {
        cur.items.push({ kind: "heading", text: t });
        if (STOTRA_RE.test(t)) cur.isStotra = true;
      } else {
        cur = newArticle(cleanTitle(t), { isStotra: STOTRA_RE.test(t) });
      }
      continue;
    }

    // (D) Index anchor — a body line whose prefix matches a printed first-line.
    if (cur && !cur.isStotra && bodyCount(cur) >= 2) {
      const idx = indexAnchor(t, byHead);
      if (idx && idx.key !== cur.lastAnchor) {
        finalize(cur);
        cur = newArticle(cleanTitle(idx.raw) || t, { isStotra: false });
        cur.lastAnchor = idx.key;
        cur.items.push({ kind: "body", text: t });
        continue;
      }
    }

    // (E) Ordinary content line.
    if (cur) cur.items.push({ kind: "body", text: t });
  }
  finalize(cur);

  dedupeSlugs(articles);

  return [
    {
      slug: "bhajan-giti",
      kind: "book",
      title: "Bhajana Gīti",
      description:
        "A treasury of bhajans and kīrtanas sung in daily temple worship in " +
        "the Gauḍīya Vaiṣṇava tradition — prayers to Śrī Guru, the maṅgala " +
        "and sandhyā āratīs, the aṣṭ-kāla līlā-smaraṇa kīrtanas, and songs of " +
        "Bhaktivinoda Ṭhākura, Narottama Dāsa Ṭhākura and the great ācāryas.",
      pdfUrl,
      pdfLabel,
      featured: false,
      addedAt,
      articles,
    },
  ];
}
