/* ------------------------------------------------------------------ */
/*  bbtirtha.org source adapter.                                       */
/*                                                                     */
/*  Imports devotional teachings (Hari-kathā, articles, chapters,      */
/*  kīrtanas, audio, letters, blog — and now Books, Magazines and      */
/*  Letters presented as Questions & Answers) from https://bbtirtha.org */
/*  into the shared Grantha ingestion contract.                        */
/*                                                                     */
/*  Site shape (custom server-rendered app, UIkit markup):             */
/*    - detail pages live at  /<locale>/text/<id>  and                 */
/*      /<locale>/audio/<id>  (audio pages carry a full transcript);   */
/*    - /<locale>/collection/<id> pages list member teachings and are   */
/*      how MAGAZINES are grouped (h6 "Collection, Magazine");         */
/*    - /<locale>/book/<id> pages group a BOOK's chapters as an         */
/*      accordion of /<locale>/text/<textid>/<bookid> links;           */
/*    - /<locale>/letters lists individual /<locale>/text/<id> letters; */
/*    - a page's real title is in <p class="uk-h1 …"> (detail) or the   */
/*      first <p class="… bb-font-serif-headline …"> (book/collection); */
/*      the category + author is in <p class="uk-h6 …">, a summary in   */
/*      .uk-card-body, and the body in <ul uk-accordion> with <shloka>  */
/*      verses inside paragraphs.                                       */
/*                                                                     */
/*  Behaviour:                                                          */
/*    1. reads robots.txt first and respects Disallow for our UA;       */
/*    2. when `seeds` are supplied it runs a TARGETED, section-driven    */
/*       crawl (books / magazines / letters) seeded only from those     */
/*       URLs; otherwise it falls back to the original homepage crawl;  */
/*    3. fetches politely — one request at a time, >=1s apart, 30s       */
/*       timeout, up to 3 attempts honouring Retry-After;              */
/*    4. NEVER imports content that already exists in the library — it   */
/*       loads every content/grantha/*.json and skips by canonical      */
/*       sourceUrl, by source content-id, and by normalized title       */
/*       within the same kind;                                          */
/*    5. MERGES into existing collections — existing articles are kept   */
/*       exactly as they are and only new, deduped articles are          */
/*       appended. Existing collections are never regenerated or lost.   */
/*                                                                     */
/*  It never throws to the runner: if the site is unreachable or        */
/*  nothing is found it logs a warning and returns []. Sanskrit /        */
/*  Bengali / Hindi Unicode is preserved as-is; no transliteration,      */
/*  translation or transcript is invented.                              */
/* ------------------------------------------------------------------ */

import fs from "node:fs";
import { slugify } from "../core/normalize.mjs";
import { classify } from "../core/classify.mjs";
import { CONTENT_DIR } from "../core/write-collection.mjs";

/* ----------------------------- config ----------------------------- */

const DEFAULT_ORIGIN = "https://bbtirtha.org";
const DEFAULT_UA =
  "Mozilla/5.0 (compatible; GranthaMandirArchiveImporter/1.0; +https://bbtirtha.org)";

const GURU = "Śrīla Bhakti Ballabh Tīrtha Gosvāmī Mahārāja";
const MATH = "Sree Chaitanya Gaudiya Math";
const SUBTITLE = "Śrī Chaitanya Gauḍīya Maṭha";
const QA_TAG = "Questions & Answers";

// Source category → Grantha kind + collection metadata. Fixed order.
const CATEGORY_ORDER = [
  "Harikatha",
  "Article",
  "Chapter",
  "Kirtan",
  "Audio",
  "Letter",
  "Blog",
  "Magazine",
];

const CATEGORY_META = {
  Harikatha: {
    kind: "lecture",
    slug: "bbtirtha-harikatha",
    title: "Hari-kathā — Śrīla B.B. Tīrtha Gosvāmī Mahārāja",
    description:
      "Recorded Hari-kathā discourses — the transcendental narrations of Śrīla Bhakti Ballabh Tīrtha Gosvāmī Mahārāja and the Śrī Chaitanya Gauḍīya Maṭha.",
    defaultAuthor: GURU,
  },
  Article: {
    kind: "article",
    slug: "bbtirtha-articles",
    title: "Articles — Sree Chaitanya Gaudiya Math",
    description:
      "Devotional articles from the treasury of Śrīla Bhakti Ballabh Tīrtha Gosvāmī Mahārāja and the Śrī Chaitanya Gauḍīya Maṭha.",
    defaultAuthor: MATH,
  },
  Chapter: {
    kind: "book",
    slug: "bbtirtha-chapters",
    title: "Chapters — Lives of the Associates",
    description:
      "Book chapters and biographical narrations of the great Vaiṣṇava ācāryas and their eternal associates.",
    defaultAuthor: MATH,
  },
  Kirtan: {
    kind: "kirtan",
    slug: "bbtirtha-kirtans",
    title: "Kīrtana — Songs of the Vaiṣṇavas",
    description: "Kīrtana lyrics and glorifications treasured in the Gauḍīya Vaiṣṇava tradition.",
    defaultAuthor: MATH,
  },
  Audio: {
    kind: "lecture",
    slug: "bbtirtha-audio",
    title: "Audio Teachings — Śrīla B.B. Tīrtha Gosvāmī Mahārāja",
    description:
      "Audio teachings and recorded discourses of Śrīla Bhakti Ballabh Tīrtha Gosvāmī Mahārāja and the Śrī Chaitanya Gauḍīya Maṭha.",
    defaultAuthor: GURU,
  },
  Letter: {
    kind: "article",
    slug: "bbtirtha-letters",
    title: "Letters — Instructions to Devotees",
    description: "Letters and written instructions of Śrīla Bhakti Ballabh Tīrtha Gosvāmī Mahārāja to the devotees.",
    defaultAuthor: MATH,
  },
  Blog: {
    kind: "article",
    slug: "bbtirtha-blog",
    title: "Blog — Sree Chaitanya Gaudiya Math",
    description: "Devotional reflections and writings of the Śrī Chaitanya Gauḍīya Maṭha.",
    defaultAuthor: MATH,
  },
  Magazine: {
    kind: "patrika",
    slug: "bbtirtha-magazines",
    title: "Magazine Collections — Śrī Chaitanya Gauḍīya Maṭha",
    description:
      "Themed magazine collections of teachings — discourses and articles gathered by topic and occasion from Śrīla Bhakti Ballabh Tīrtha Gosvāmī Mahārāja and the Śrī Chaitanya Gauḍīya Maṭha.",
    defaultAuthor: GURU,
  },
};

// Visible category label (lowercased) → source category.
const CATEGORY_LABEL_MAP = {
  harikatha: "Harikatha",
  "hari-katha": "Harikatha",
  "hari katha": "Harikatha",
  article: "Article",
  articles: "Article",
  chapter: "Chapter",
  chapters: "Chapter",
  kirtan: "Kirtan",
  kirtana: "Kirtan",
  kirtans: "Kirtan",
  audio: "Audio",
  letter: "Letter",
  letters: "Letter",
  blog: "Blog",
  blogs: "Blog",
  magazine: "Magazine",
  magazines: "Magazine",
};

const LOCALES = new Set(["en", "hn", "hi", "bn", "or", "ta", "te", "gu", "mr"]);
const LOCALE_LANG = {
  en: { code: "en", label: "English" },
  hn: { code: "hi", label: "Hindi" },
  hi: { code: "hi", label: "Hindi" },
  bn: { code: "bn", label: "Bengali" },
  or: { code: "or", label: "Odia" },
};

// Content-type path tokens.
const DETAIL_TYPES = new Set(["text", "audio"]);
const LISTING_TYPES = new Set([
  "collection",
  "library",
  "texts",
  "audios",
  "book",
  "books",
  "magazine",
  "magazines",
  "letters",
]);
const EXCLUDE_TYPES = new Set([
  "event",
  "events",
  "calendar",
  "apps",
  "app",
  "search",
  "album",
  "albums",
  "media",
  "login",
  "account",
  "cart",
  "checkout",
  "donate",
  "donation",
  "contact",
  "privacy",
  "terms",
  "switch_item_language",
]);

const EXCLUDE_EXT =
  /\.(?:jpe?g|png|gif|webp|svg|ico|css|js|pdf|zip|rar|gz|xml|json|woff2?|ttf|eot|mp4|webm|mov)(?:$|\?)/i;
const AUDIO_EXT = /\.(?:mp3|m4a|ogg|oga|wav|aac|flac)(?:$|\?)/i;

/* --------------------------- small utils -------------------------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const NAMED_ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201c",
  rdquo: "\u201d",
  laquo: "«",
  raquo: "»",
  copy: "©",
  reg: "®",
  trade: "™",
  deg: "°",
  middot: "·",
  bull: "•",
};

function decodeEntities(text) {
  return String(text).replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi, (m, body) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
      if (Number.isFinite(code) && code > 0) {
        try {
          return String.fromCodePoint(code);
        } catch {
          return m;
        }
      }
      return m;
    }
    const key = body.toLowerCase();
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, key)
      ? NAMED_ENTITIES[key]
      : m;
  });
}

/** innerHTML → plain text: <br> and block ends become newlines, tags stripped. */
function htmlToText(html) {
  return decodeEntities(
    String(html)
      .replace(/<\s*br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(?:p|div|li|h[1-6]|blockquote|tr)\s*>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inlineText(html) {
  return htmlToText(html).replace(/\s+/g, " ").trim();
}

const wordCount = (text) => String(text).split(/\s+/).filter(Boolean).length;

function firstMatch(html, re) {
  const m = re.exec(html);
  return m ? m[1] : "";
}

/** Inner HTML of the first element matching openRe, balanced across nesting. */
function sliceBalanced(html, tagName, openRe) {
  const open = openRe.exec(html);
  if (!open) return null;
  // Non-global regexes leave lastIndex at 0, so derive the offset from the match.
  const afterOpen = open.index + open[0].length;
  const scan = new RegExp(`<${tagName}\\b|</${tagName}\\s*>`, "gi");
  scan.lastIndex = afterOpen;
  let depth = 1;
  let m;
  while ((m = scan.exec(html))) {
    if (m[0][1] === "/") {
      depth -= 1;
      if (depth === 0) return html.slice(afterOpen, m.index);
    } else {
      depth += 1;
    }
  }
  return html.slice(afterOpen);
}

/** Inner HTML of every top-level <tag> element (nesting aware). */
function topLevelElements(html, tagName) {
  const re = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}\\s*>`, "gi");
  const items = [];
  let depth = 0;
  let start = -1;
  let m;
  while ((m = re.exec(html))) {
    if (m[0][1] === "/") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        items.push(html.slice(start, m.index));
        start = -1;
      }
    } else {
      if (depth === 0) start = re.lastIndex;
      depth += 1;
    }
  }
  return items;
}

/** All hrefs on a page, in document order (raw, undecoded). */
function extractAllLinks(html) {
  const out = [];
  const re = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

/** De-duplicate while preserving first-seen order. */
function uniqueOrdered(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

/** Robust title key for the "same title within a kind" dedup safety net. */
function normalizeTitle(title) {
  return String(title)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/* ----------------------- URL canonicalisation --------------------- */

function makeOriginHosts(origin) {
  const host = new URL(origin).host.toLowerCase();
  const bare = host.replace(/^www\./, "");
  return new Set([bare, `www.${bare}`]);
}

function canonicalize(href, base, originHosts) {
  let url;
  try {
    url = new URL(href, base);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (!originHosts.has(url.host.toLowerCase())) return null;
  url.protocol = "https:";
  url.host = url.host.toLowerCase();
  url.hash = "";
  const drop = /^(utm_|fbclid$|gclid$|replytocom$|share$|print$)/i;
  const params = [...url.searchParams.entries()].filter(([k]) => !drop.test(k));
  params.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1));
  url.search = params.length
    ? "?" + params.map(([k, v]) => (v ? `${k}=${v}` : k)).join("&")
    : "";
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
  return url.toString();
}

function pathSegments(urlStr) {
  try {
    return new URL(urlStr).pathname
      .split("/")
      .filter(Boolean)
      .map((s) => decodeURIComponent(s).toLowerCase());
  } catch {
    return [];
  }
}

/** { locale, type, id } for a /<locale>/<type>/<id> style URL. */
function contentRef(urlStr) {
  const segs = pathSegments(urlStr);
  if (segs.length >= 2 && LOCALES.has(segs[0])) {
    return { locale: segs[0], type: segs[1], id: segs[2], segs };
  }
  return { locale: null, type: segs[0], id: segs[1], segs };
}

function isDetailUrl(urlStr) {
  const { type, id } = contentRef(urlStr);
  return DETAIL_TYPES.has(type) && /^\d+$/.test(id || "");
}

function isListingUrl(urlStr) {
  const { type, id, segs } = contentRef(urlStr);
  if (segs.length <= 1) return true; // home / locale root
  if (LISTING_TYPES.has(type)) return true;
  return type === "collection" && Boolean(id);
}

function isExcludedUrl(urlStr) {
  if (EXCLUDE_EXT.test(urlStr)) return true;
  const { type, segs } = contentRef(urlStr);
  if (EXCLUDE_TYPES.has(type)) return true;
  return segs.some((s) => EXCLUDE_TYPES.has(s));
}

/** Source content-id ("text/1551", "audio/799") — locale/book-segment agnostic. */
function contentIdOf(urlStr) {
  const { type, id } = contentRef(urlStr);
  if (DETAIL_TYPES.has(type) && /^\d+$/.test(id || "")) return `${type}/${id}`;
  return null;
}

/** Which section a seed URL belongs to (books / magazines / letters). */
function sectionOf(urlStr) {
  const segs = pathSegments(urlStr);
  const last = segs[segs.length - 1] || "";
  if (/^books?$/.test(last)) return "books";
  if (/^magazines?$/.test(last)) return "magazines";
  if (/^letters?$/.test(last)) return "letters";
  return null;
}

/** Same-origin detail (text/audio) URLs linked from a page, in document order. */
function extractDetailUrls(html, base, originHosts) {
  const out = [];
  for (const h of extractAllLinks(html)) {
    const c = canonicalize(h, base, originHosts);
    if (c && isDetailUrl(c) && !isExcludedUrl(c)) out.push(c);
  }
  return uniqueOrdered(out);
}

/** Same-origin URLs of a given path type (e.g. "book", "collection"). */
function extractTypeUrls(html, base, originHosts, wantType) {
  const out = [];
  for (const h of extractAllLinks(html)) {
    const c = canonicalize(h, base, originHosts);
    if (!c) continue;
    const { type, id } = contentRef(c);
    if (type === wantType && /^\d+$/.test(id || "")) out.push(c);
  }
  return uniqueOrdered(out);
}

/* --------------------------- robots.txt --------------------------- */

function parseRobots(text, uaToken) {
  const groups = [];
  let current = null;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === "user-agent") {
      if (!current || current.hasRules) {
        current = { agents: [], disallow: [], hasRules: false };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (field === "disallow" && current) {
      current.hasRules = true;
      if (value) current.disallow.push(value);
    } else if (field === "allow" && current) {
      current.hasRules = true;
    }
  }
  const ua = uaToken.toLowerCase();
  const match =
    groups.find((g) => g.agents.some((a) => a !== "*" && ua.includes(a))) ||
    groups.find((g) => g.agents.includes("*"));
  return match ? match.disallow : [];
}

function makeRobotsMatcher(disallow) {
  return (urlStr) => {
    let pathname;
    try {
      pathname = new URL(urlStr).pathname;
    } catch {
      return false;
    }
    return !disallow.some((rule) => rule && pathname.startsWith(rule));
  };
}

/* ------------------------- polite fetching ------------------------ */

function createFetcher({ userAgent, minDelayMs, timeoutMs, maxAttempts, log }) {
  let lastStart = 0;

  async function throttle() {
    const wait = lastStart + minDelayMs - Date.now();
    if (wait > 0) await sleep(wait);
    lastStart = Date.now();
  }

  function retryAfterMs(res) {
    const header = res.headers.get("retry-after");
    if (!header) return 0;
    const secs = Number(header);
    if (Number.isFinite(secs)) return Math.max(0, secs * 1000);
    const date = Date.parse(header);
    return Number.isFinite(date) ? Math.max(0, date - Date.now()) : 0;
  }

  return async function fetchText(url) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      await throttle();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          redirect: "follow",
          signal: controller.signal,
          headers: {
            "user-agent": userAgent,
            accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "accept-language": "en;q=0.9",
          },
        });
        clearTimeout(timer);
        if (res.status === 429 || res.status === 408 || res.status >= 500) {
          if (attempt < maxAttempts) {
            const backoff = Math.max(attempt === 1 ? 1000 : 4000, retryAfterMs(res));
            log(`   retry ${attempt}/${maxAttempts - 1} (${res.status}) after ${backoff}ms — ${url}`);
            await sleep(backoff);
            continue;
          }
          log(`   giving up (${res.status}) — ${url}`);
          return null;
        }
        if (!res.ok) {
          log(`   skip (${res.status}) — ${url}`);
          return null;
        }
        return { status: res.status, text: await res.text(), finalUrl: res.url || url };
      } catch (err) {
        clearTimeout(timer);
        if (attempt < maxAttempts) {
          const backoff = attempt === 1 ? 1000 : 4000;
          log(`   retry ${attempt}/${maxAttempts - 1} (${err.name || "error"}) after ${backoff}ms — ${url}`);
          await sleep(backoff);
          continue;
        }
        log(`   network fail (${err.message}) — ${url}`);
        return null;
      }
    }
    return null;
  };
}

/* --------------------- bbtirtha page extraction ------------------- */

function stripNoise(html) {
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
}

function extractTitle(html) {
  const t =
    firstMatch(html, /<p\b[^>]*class="[^"]*\buk-h1\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
    firstMatch(html, /<[^>]*class="[^"]*bb-font-serif-headline[^"]*"[^>]*>([\s\S]*?)<\//i);
  return inlineText(t);
}

/** The title of a book/collection page — the first serif-headline heading. */
function extractCollectionTitle(html) {
  const t = firstMatch(
    html,
    /<p\b[^>]*class="[^"]*bb-font-serif-headline[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
  );
  return inlineText(t) || extractTitle(html);
}

/** The "<Category>, <Author>" line in <p class="uk-h6 …">. */
function extractHeaderMeta(html) {
  const line = inlineText(
    firstMatch(html, /<p\b[^>]*class="[^"]*\buk-h6\b[^"]*"[^>]*>([\s\S]*?)<\/p>/i),
  );
  if (!line) return { category: null, author: "" };
  const comma = line.indexOf(",");
  const label = (comma === -1 ? line : line.slice(0, comma)).trim().toLowerCase();
  const author = comma === -1 ? "" : line.slice(comma + 1).trim();
  return { category: CATEGORY_LABEL_MAP[label] || null, author };
}

/** The summary paragraph in the pink .uk-card-body header block. */
function extractSummary(html) {
  const body = sliceBalanced(
    html,
    "div",
    /<div\b[^>]*class="[^"]*\buk-card-body\b[^"]*"[^>]*>/i,
  );
  if (!body) return "";
  return inlineText(firstMatch(body, /<p\b[^>]*>([\s\S]*?)<\/p>/i));
}

/** A single content fragment (accordion body / card) → ArticleBlock[]. */
function contentToBlocks(html) {
  const clean = stripNoise(html);
  const blocks = [];
  const re =
    /<(p|h2|h3|h4|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi;
  let m;
  while ((m = re.exec(clean))) {
    const tag = m[1].toLowerCase();
    const inner = m[2];

    if (tag === "ul" || tag === "ol") {
      for (const li of topLevelElements(inner, "li")) {
        const text = inlineText(li);
        if (text) blocks.push({ type: "paragraph", text });
      }
      continue;
    }
    if (tag === "blockquote") {
      const text = htmlToText(inner);
      if (text) blocks.push({ type: "quote", text });
      continue;
    }
    if (tag === "h2" || tag === "h3" || tag === "h4") {
      const text = inlineText(inner);
      if (text) blocks.push({ type: "heading", level: tag === "h2" ? 2 : 3, text });
      continue;
    }

    // paragraph — a <shloka> makes it a verse/poem stanza.
    if (/<shloka\b/i.test(inner)) {
      const shloka = firstMatch(inner, /<shloka\b[^>]*>([\s\S]*?)<\/shloka>/i) || inner;
      const lines = htmlToText(shloka)
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length) blocks.push({ type: "poem", lines });
      // any prose outside the shloka in the same <p>
      const rest = inlineText(inner.replace(/<shloka\b[\s\S]*?<\/shloka>/i, ""));
      if (rest) blocks.push({ type: "paragraph", text: rest });
      continue;
    }

    const text = htmlToText(inner);
    if (text) blocks.push({ type: "paragraph", text });
  }
  return blocks;
}

/** Full page → body ArticleBlock[] (accordion sections, else fallback). */
function extractBodyBlocks(html) {
  const accordion = sliceBalanced(html, "ul", /<ul\b[^>]*\buk-accordion\b[^>]*>/i);
  if (accordion) {
    const blocks = [];
    for (const li of topLevelElements(accordion, "li")) {
      const heading = inlineText(
        firstMatch(li, /<a\b[^>]*\buk-accordion-title\b[^>]*>([\s\S]*?)<\/a>/i),
      );
      if (heading) blocks.push({ type: "heading", level: 2, text: heading });
      const rest = li.replace(/<a\b[^>]*\buk-accordion-title\b[\s\S]*?<\/a>/i, "");
      blocks.push(...contentToBlocks(rest));
    }
    if (blocks.length) return blocks;
  }
  // Fallback: parse the main content column if there is no accordion.
  const main =
    sliceBalanced(html, "div", /<div\b[^>]*class="[^"]*\buk-width-3-4\b[^"]*"[^>]*>/i) ||
    sliceBalanced(html, "main", /<main\b[^>]*>/i);
  return main ? contentToBlocks(main) : [];
}

function extractAudioUrl(html, base, originHosts) {
  const candidates = [];
  const push = (re) => {
    let m;
    while ((m = re.exec(html))) candidates.push(m[1]);
  };
  push(/<audio\b[^>]*\bsrc=["']([^"']+)["']/gi);
  push(/<source\b[^>]*\bsrc=["']([^"']+)["']/gi);
  push(/<a\b[^>]*\bhref=["']([^"']+)["']/gi);
  push(/["'](\/media\/[^"']+\.(?:mp3|m4a|ogg|wav))["']/gi);

  for (const raw of candidates) {
    if (!AUDIO_EXT.test(raw)) continue;
    let abs;
    try {
      abs = new URL(raw, base);
    } catch {
      continue;
    }
    // Same-origin only — drops the Plyr demo clip (cdn.plyr.io) and other CDNs.
    if (!originHosts.has(abs.host.toLowerCase())) continue;
    abs.protocol = "https:";
    abs.hash = "";
    return abs.toString();
  }
  return undefined;
}

function detectLanguage(url, html, bodyText) {
  const { locale } = contentRef(url);
  if (locale && LOCALE_LANG[locale]) return LOCALE_LANG[locale];
  const langAttr = firstMatch(html, /<html\b[^>]*\blang=["']([^"']+)["']/i);
  if (langAttr) {
    const code = langAttr.toLowerCase().split("-")[0];
    return { code, label: LOCALE_LANG[code]?.label || langAttr };
  }
  const sample = String(bodyText).slice(0, 4000);
  const bengali = (sample.match(/[\u0980-\u09FF]/g) || []).length;
  const devanagari = (sample.match(/[\u0900-\u097F]/g) || []).length;
  const latin = (sample.match(/[A-Za-z]/g) || []).length;
  if (bengali > latin && bengali > 40) return { code: "bn", label: "Bengali" };
  if (latin >= bengali && latin >= devanagari && latin > 40)
    return { code: "en", label: "English" };
  return undefined;
}

/* ----------------------- existing library guard ------------------- */

function shortHash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16).padStart(8, "0").slice(0, 6);
}

/**
 * Load every existing collection so we can (a) skip already-imported content
 * and (b) merge into — never overwrite — existing collections.
 *
 * @returns {{
 *   bySlug: Map<string, any>,
 *   sourceUrlSet: Set<string>,
 *   contentIdSet: Set<string>,
 *   titlesByKind: Map<string, Set<string>>,
 *   slugs: Set<string>,
 * }}
 */
function loadExistingLibrary(origin, originHosts) {
  const bySlug = new Map();
  const sourceUrlSet = new Set();
  const contentIdSet = new Set();
  const titlesByKind = new Map();
  const slugs = new Set();

  let files = [];
  try {
    files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    files = [];
  }

  for (const file of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(`${CONTENT_DIR}/${file}`, "utf8"));
    } catch {
      continue; // never let a malformed file break the import
    }
    if (!data || !Array.isArray(data.articles)) continue;
    if (data.slug) bySlug.set(data.slug, data);
    const kind = data.kind || "article";
    for (const a of data.articles) {
      if (a.slug) slugs.add(a.slug);
      if (a.sourceUrl) {
        sourceUrlSet.add(a.sourceUrl);
        const c = canonicalize(a.sourceUrl, origin, originHosts);
        if (c) sourceUrlSet.add(c);
        const cid = contentIdOf(a.sourceUrl);
        if (cid) contentIdSet.add(cid);
      }
      const nt = normalizeTitle(a.title || "");
      if (nt) {
        if (!titlesByKind.has(kind)) titlesByKind.set(kind, new Set());
        titlesByKind.get(kind).add(nt);
      }
    }
  }
  return { bySlug, sourceUrlSet, contentIdSet, titlesByKind, slugs };
}

/**
 * Dedup helper over the existing-library index.
 *
 * Primary key: canonical sourceUrl / source content-id. This is reliable and
 * is what guards against importing the same page twice — both against the
 * existing library and within a single run.
 *
 * Secondary net: normalized title within a kind. This is frozen to the library
 * as it existed at run start, so it only prevents re-importing content that is
 * ALREADY in the library. It is deliberately NOT extended with freshly imported
 * titles — otherwise two genuinely distinct new pages that merely share a
 * normalized title (two different letters both titled "Conditioned Souls", or
 * the recurring "Foreword" / "About the Author" front-matter across different
 * books) would be wrongly dropped. Their unique source URLs already prove they
 * are distinct items, and slug collisions are resolved in buildArticle().
 */
function createDedup(existing) {
  const seenUrls = new Set(existing.sourceUrlSet);
  const seenIds = new Set(existing.contentIdSet);
  const existingTitlesByKind = existing.titlesByKind; // frozen snapshot
  return {
    seenUrl(url) {
      if (seenUrls.has(url)) return true;
      const cid = contentIdOf(url);
      return cid ? seenIds.has(cid) : false;
    },
    seenTitle(kind, title) {
      const s = existingTitlesByKind.get(kind);
      return s ? s.has(normalizeTitle(title)) : false;
    },
    record(url) {
      seenUrls.add(url);
      const cid = contentIdOf(url);
      if (cid) seenIds.add(cid);
    },
  };
}

/* --------------------------- article build ------------------------ */

/**
 * Parse one detail page into a raw article. Returns null (with a logged
 * reason) when the page carries no usable teaching content.
 */
function buildArticle({ url, html, originHosts, sourceCategory, defaultAuthor, slugs, log }) {
  const title = extractTitle(html);
  if (!title) {
    log(`      · no title, skipped — ${url}`);
    return null;
  }
  const { author: headerAuthor } = extractHeaderMeta(html);
  const summary = extractSummary(html);
  const body = extractBodyBlocks(html);
  const bodyWords = body.reduce((n, b) => n + wordCount(b.text || (b.lines || []).join(" ")), 0);
  const audioUrl = extractAudioUrl(html, url, originHosts);
  const language = detectLanguage(url, html, summary + " " + inlineText(html.slice(0, 6000)));

  let blocks = body;
  let contentAvailability;
  if (bodyWords >= 25) {
    contentAvailability = audioUrl ? "text-and-audio" : "text";
  } else if (audioUrl) {
    contentAvailability = "audio-only";
    blocks = summary
      ? [{ type: "paragraph", text: summary }]
      : [{ type: "paragraph", text: "A recorded audio discourse — please listen below." }];
  } else {
    log(`      · no teaching content, skipped — ${url}`);
    return null;
  }

  let slug = slugify(title) || "teaching";
  if (slugs.has(slug)) slug = `${slug}-${shortHash(url)}`;
  slugs.add(slug);

  return {
    slug,
    title,
    author: headerAuthor || defaultAuthor || MATH,
    excerpt: summary || undefined,
    audioUrl,
    blocks,
    language,
    sourceCategory,
    sourceUrl: url,
    contentAvailability,
  };
}

/* ---------------------- section-driven crawls --------------------- */

/** Letters → one "Questions & Answers" collection (kind "article"). */
async function crawlLetters({ seedUrl, ctx, cap, today }) {
  const { fetchText, isAllowed, originHosts, dedup, slugs, log } = ctx;
  const res = isAllowed(seedUrl) ? await fetchText(seedUrl) : null;
  if (!res) {
    log(`letters: seed unreachable — ${seedUrl}`);
    return { collections: [], added: 0, skipped: 0 };
  }
  const urls = extractDetailUrls(res.text, res.finalUrl, originHosts);
  log(`letters: ${urls.length} letter link(s) discovered (cap ${cap})`);

  const articles = [];
  let skipped = 0;
  for (const url of urls) {
    if (articles.length >= cap) {
      log(`letters: cap ${cap} reached`);
      break;
    }
    if (!isAllowed(url)) { skipped += 1; continue; }
    if (dedup.seenUrl(url)) { skipped += 1; log(`   · skip (already in library) — ${url}`); continue; }
    const dres = await fetchText(url);
    if (!dres) { skipped += 1; continue; }
    const title = extractTitle(dres.text);
    if (title && dedup.seenTitle("article", title)) {
      skipped += 1;
      log(`   · skip (existing letter/Q&A title "${title}")`);
      continue;
    }
    const art = buildArticle({
      url,
      html: dres.text,
      originHosts,
      sourceCategory: "Letter",
      defaultAuthor: GURU,
      slugs,
      log,
    });
    if (!art) { skipped += 1; continue; }
    const blob =
      art.title + "\n" + art.blocks.map((b) => b.text || (b.lines || []).join(" ")).join("\n");
    art.tags = uniqueOrdered([QA_TAG, ...classify(blob).tags]).slice(0, 6);
    art.category = QA_TAG;
    dedup.record(url);
    articles.push(art);
    log(`   ✓ [Q&A] ${art.title}`);
  }

  const collections = [
    {
      slug: "bbtirtha-letters",
      kind: "article",
      retitle: true,
      title: "Questions & Answers",
      subtitle: SUBTITLE,
      description:
        "Sincere questions from devotees, answered in the mood of the ācāryas — the correspondence and replies of Śrīla Bhakti Ballabh Tīrtha Gosvāmī Mahārāja and the Śrī Chaitanya Gauḍīya Maṭha.",
      addedAt: today,
      articles,
    },
  ];
  return { collections, added: articles.length, skipped };
}

/** Books → one collection per book (kind "book"); untitled books fall back
 *  into the shared bbtirtha-chapters collection. */
async function crawlBooks({ seedUrl, ctx, cap, today }) {
  const { fetchText, isAllowed, originHosts, dedup, slugs, log } = ctx;
  const res = isAllowed(seedUrl) ? await fetchText(seedUrl) : null;
  if (!res) {
    log(`books: seed unreachable — ${seedUrl}`);
    return { collections: [], added: 0, skipped: 0 };
  }
  const bookUrls = extractTypeUrls(res.text, res.finalUrl, originHosts, "book");
  log(`books: ${bookUrls.length} book(s) discovered (cap ${cap})`);

  const collections = [];
  const fallbackChapters = [];
  const plannedSlugs = new Set();
  let added = 0;
  let skipped = 0;

  for (const bookUrl of bookUrls) {
    if (added >= cap) { log(`books: cap ${cap} reached`); break; }
    if (!isAllowed(bookUrl)) continue;
    const bres = await fetchText(bookUrl);
    if (!bres) { log(`   · book page unreachable — ${bookUrl}`); continue; }

    const bookTitle = extractCollectionTitle(bres.text);
    const { id: bookId } = contentRef(bookUrl);
    const chapterUrls = extractDetailUrls(bres.text, bres.finalUrl, originHosts);
    if (!chapterUrls.length) {
      log(`   · book "${bookTitle || bookUrl}" has no chapters, skipped`);
      continue;
    }

    const groupArticles = [];
    for (const chapUrl of chapterUrls) {
      if (added >= cap) break;
      if (!isAllowed(chapUrl)) { skipped += 1; continue; }
      if (dedup.seenUrl(chapUrl)) { skipped += 1; log(`   · skip chapter (already in library) — ${chapUrl}`); continue; }
      const cres = await fetchText(chapUrl);
      if (!cres) { skipped += 1; continue; }
      const t = extractTitle(cres.text);
      if (t && dedup.seenTitle("book", t)) {
        skipped += 1;
        log(`   · skip chapter (existing book title "${t}")`);
        continue;
      }
      const art = buildArticle({
        url: chapUrl,
        html: cres.text,
        originHosts,
        sourceCategory: "Book",
        defaultAuthor: GURU,
        slugs,
        log,
      });
      if (!art) { skipped += 1; continue; }
      dedup.record(chapUrl);
      groupArticles.push(art);
      added += 1;
    }

    if (!groupArticles.length) {
      log(`   · book "${bookTitle || bookUrl}" — no new chapters`);
      continue;
    }

    if (bookTitle) {
      let slug = "bbtirtha-book-" + (slugify(bookTitle) || `id-${bookId}`);
      if (plannedSlugs.has(slug)) slug = `${slug}-${bookId}`;
      plannedSlugs.add(slug);
      collections.push({
        slug,
        kind: "book",
        title: bookTitle,
        subtitle: SUBTITLE,
        description: `${bookTitle} — a sacred book preserved in the library of the Śrī Chaitanya Gauḍīya Maṭha.`,
        addedAt: today,
        articles: groupArticles,
      });
      log(`   ✓ book "${bookTitle}" — ${groupArticles.length} chapter(s) [${slug}]`);
    } else {
      fallbackChapters.push(...groupArticles);
      log(`   ✓ book (untitled ${bookUrl}) — ${groupArticles.length} chapter(s) → bbtirtha-chapters`);
    }
  }

  if (fallbackChapters.length) {
    collections.push({
      slug: CATEGORY_META.Chapter.slug,
      kind: CATEGORY_META.Chapter.kind,
      title: CATEGORY_META.Chapter.title,
      subtitle: SUBTITLE,
      description: CATEGORY_META.Chapter.description,
      addedAt: today,
      articles: fallbackChapters,
    });
  }
  return { collections, added, skipped };
}

/** Magazines → one collection per magazine (kind "patrika"). */
async function crawlMagazines({ seedUrl, ctx, cap, today }) {
  const { fetchText, isAllowed, originHosts, dedup, slugs, log } = ctx;
  const res = isAllowed(seedUrl) ? await fetchText(seedUrl) : null;
  if (!res) {
    log(`magazines: seed unreachable — ${seedUrl}`);
    return { collections: [], added: 0, skipped: 0 };
  }
  const magUrls = extractTypeUrls(res.text, res.finalUrl, originHosts, "collection");
  log(`magazines: ${magUrls.length} magazine collection(s) discovered (cap ${cap})`);

  const collections = [];
  const plannedSlugs = new Set();
  let added = 0;
  let skipped = 0;

  for (const magUrl of magUrls) {
    if (added >= cap) { log(`magazines: cap ${cap} reached`); break; }
    if (!isAllowed(magUrl)) continue;
    const mres = await fetchText(magUrl);
    if (!mres) { log(`   · magazine page unreachable — ${magUrl}`); continue; }

    const magTitle = extractCollectionTitle(mres.text);
    const { id: magId } = contentRef(magUrl);
    const memberUrls = extractDetailUrls(mres.text, mres.finalUrl, originHosts);
    if (!memberUrls.length) {
      log(`   · magazine "${magTitle || magUrl}" has no members, skipped`);
      continue;
    }

    const groupArticles = [];
    for (const memberUrl of memberUrls) {
      if (added >= cap) break;
      if (!isAllowed(memberUrl)) { skipped += 1; continue; }
      if (dedup.seenUrl(memberUrl)) { skipped += 1; log(`   · skip member (already in library) — ${memberUrl}`); continue; }
      const dres = await fetchText(memberUrl);
      if (!dres) { skipped += 1; continue; }
      const t = extractTitle(dres.text);
      if (t && dedup.seenTitle("patrika", t)) {
        skipped += 1;
        log(`   · skip member (existing magazine title "${t}")`);
        continue;
      }
      const art = buildArticle({
        url: memberUrl,
        html: dres.text,
        originHosts,
        sourceCategory: "Magazine",
        defaultAuthor: GURU,
        slugs,
        log,
      });
      if (!art) { skipped += 1; continue; }
      dedup.record(memberUrl);
      groupArticles.push(art);
      added += 1;
    }

    if (!groupArticles.length) {
      log(`   · magazine "${magTitle || magUrl}" — no new members`);
      continue;
    }

    let slug = "bbtirtha-magazine-" + (slugify(magTitle) || `id-${magId}`);
    if (plannedSlugs.has(slug)) slug = `${slug}-${magId}`;
    plannedSlugs.add(slug);
    collections.push({
      slug,
      kind: "patrika",
      title: magTitle || `Magazine ${magId}`,
      subtitle: SUBTITLE,
      description: `${magTitle || "A magazine collection"} — a themed treasury of teachings gathered by the Śrī Chaitanya Gauḍīya Maṭha.`,
      addedAt: today,
      articles: groupArticles,
    });
    log(`   ✓ magazine "${magTitle}" — ${groupArticles.length} teaching(s) [${slug}]`);
  }
  return { collections, added, skipped };
}

/* --------------------------- generic crawl ------------------------ */

async function discover({ origin, originHosts, fetchText, isAllowed, maxItems, maxPages, log }) {
  const queued = new Set();
  const frontier = [];
  const details = new Set();
  let pagesFetched = 0;

  const enqueue = (url) => {
    if (!queued.has(url)) {
      queued.add(url);
      frontier.push(url);
    }
  };
  for (const seed of [`${origin}/`, `${origin}/EN`]) {
    const c = canonicalize(seed, origin, originHosts);
    if (c) enqueue(c);
  }

  while (frontier.length && pagesFetched < maxPages && details.size < maxItems) {
    const url = frontier.shift();
    if (!isAllowed(url)) continue;
    const res = await fetchText(url);
    pagesFetched += 1;
    if (!res) continue;

    const anchor = /<a\b[^>]*\bhref=["']([^"']+)["']/gi;
    let m;
    while ((m = anchor.exec(res.text))) {
      const link = canonicalize(m[1], res.finalUrl, originHosts);
      if (!link || isExcludedUrl(link)) continue;
      if (isDetailUrl(link)) {
        if (details.size < maxItems) details.add(link);
      } else if (isListingUrl(link)) {
        enqueue(link);
      }
    }
    log(`   ${details.size} detail candidate(s) after ${pagesFetched} listing page(s)`);
  }

  return [...details].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** Original homepage-seeded crawl, grouped by each page's stated category. */
async function crawlGeneric({ origin, originHosts, ctx, maxItems, maxPages, today }) {
  const { fetchText, isAllowed, dedup, slugs, log } = ctx;
  const detailUrls = await discover({ origin, originHosts, fetchText, isAllowed, maxItems, maxPages, log });
  log(`discovery complete — ${detailUrls.length} detail page(s) to consider.`);

  const byCategory = new Map();
  let added = 0;
  let skipped = 0;

  for (const url of detailUrls) {
    if (added >= maxItems) break;
    if (!isAllowed(url)) continue;
    if (dedup.seenUrl(url)) { skipped += 1; continue; }
    const res = await fetchText(url);
    if (!res) { skipped += 1; continue; }
    const { category: labelCategory } = extractHeaderMeta(res.text);
    const { type } = contentRef(url);
    const category = labelCategory || (type === "audio" ? "Audio" : "Article");
    const meta = CATEGORY_META[category] || CATEGORY_META.Article;
    const title = extractTitle(res.text);
    if (title && dedup.seenTitle(meta.kind, title)) { skipped += 1; continue; }
    const art = buildArticle({
      url,
      html: res.text,
      originHosts,
      sourceCategory: category,
      defaultAuthor: meta.defaultAuthor,
      slugs,
      log,
    });
    if (!art) { skipped += 1; continue; }
    dedup.record(url);
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(art);
    added += 1;
    log(`   [${category}]${art.audioUrl ? " ♪" : ""} ${art.title}`);
  }

  const collections = [];
  for (const category of CATEGORY_ORDER) {
    const articles = byCategory.get(category);
    if (!articles || articles.length === 0) continue;
    articles.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
    const meta = CATEGORY_META[category];
    collections.push({
      slug: meta.slug,
      kind: meta.kind,
      title: meta.title,
      subtitle: SUBTITLE,
      description: meta.description,
      addedAt: today,
      articles,
    });
  }
  return { collections, added, skipped };
}

/* ------------------------------ merge ----------------------------- */

/**
 * Merge planned collections into the existing library. Existing collections
 * keep ALL their articles, in order, exactly as they are — only new, deduped
 * articles are appended. New collections are created as-is. A collection that
 * gains nothing (and is not being retitled) is left untouched on disk.
 */
function mergeWithExisting(planned, bySlug, log) {
  const combined = new Map();
  const order = [];
  for (const pc of planned) {
    if (combined.has(pc.slug)) {
      const c = combined.get(pc.slug);
      c.articles = [...c.articles, ...pc.articles];
      if (pc.retitle) {
        c.retitle = true;
        c.title = pc.title;
        c.description = pc.description;
      }
    } else {
      combined.set(pc.slug, { ...pc, articles: [...pc.articles] });
      order.push(pc.slug);
    }
  }

  const out = [];
  for (const slug of order) {
    const pc = combined.get(slug);
    const existing = bySlug.get(slug);
    if (existing) {
      const haveSlugs = new Set((existing.articles || []).map((a) => a.slug));
      const haveUrls = new Set((existing.articles || []).map((a) => a.sourceUrl).filter(Boolean));
      const appended = pc.articles.filter(
        (a) => !haveSlugs.has(a.slug) && !(a.sourceUrl && haveUrls.has(a.sourceUrl)),
      );
      const before = (existing.articles || []).length;
      if (appended.length === 0 && !pc.retitle) {
        log(`   = ${slug}: unchanged (${before} article(s))`);
        continue;
      }
      out.push({
        slug: existing.slug,
        kind: existing.kind || pc.kind,
        title: pc.retitle ? pc.title : existing.title,
        subtitle: existing.subtitle ?? pc.subtitle,
        description: pc.retitle ? pc.description : existing.description ?? pc.description ?? "",
        year: existing.year,
        issue: existing.issue,
        cover: existing.cover,
        pdfUrl: existing.pdfUrl,
        pdfLabel: existing.pdfLabel,
        featured: existing.featured,
        addedAt: existing.addedAt,
        articles: [...(existing.articles || []), ...appended],
      });
      log(
        `   ⇢ ${slug}: ${before} existing + ${appended.length} new = ${before + appended.length}` +
          (pc.retitle ? " (retitled → Questions & Answers)" : ""),
      );
    } else {
      if (!pc.articles.length) {
        log(`   ∅ ${slug}: no articles, skipped`);
        continue;
      }
      out.push({
        slug: pc.slug,
        kind: pc.kind,
        title: pc.title,
        subtitle: pc.subtitle,
        description: pc.description || "",
        addedAt: pc.addedAt,
        articles: pc.articles,
      });
      log(`   + ${slug}: ${pc.articles.length} new article(s)`);
    }
  }
  return out;
}

/* ------------------------------ main ------------------------------ */

/**
 * @param {object} [opts]
 * @param {string} [opts.origin="https://bbtirtha.org"]
 * @param {string[]} [opts.seeds]         section seeds; enables targeted crawl
 * @param {number} [opts.maxItems=300]    global cap on imported detail pages
 * @param {number} [opts.booksMax=200]
 * @param {number} [opts.magazinesMax=200]
 * @param {number} [opts.lettersMax=150]
 * @param {number} [opts.maxPages]        cap on pages fetched (generic crawl)
 * @param {number} [opts.minDelayMs=1000] min gap between request starts
 * @param {number} [opts.timeoutMs=30000]
 * @param {number} [opts.maxAttempts=3]
 * @param {string} [opts.userAgent]
 * @param {boolean} [opts.verbose=true]
 * @returns {Promise<import("../core/types.mjs").RawCollection[]>}
 */
export async function bbtirthaSource(opts = {}) {
  const origin = (opts.origin || DEFAULT_ORIGIN).replace(/\/+$/, "");
  const maxItems = opts.maxItems ?? 300;
  const maxPages = opts.maxPages ?? Math.min(maxItems + 60, 400);
  const minDelayMs = opts.minDelayMs ?? 1000;
  const timeoutMs = opts.timeoutMs ?? 30000;
  const maxAttempts = opts.maxAttempts ?? 3;
  const userAgent = opts.userAgent || DEFAULT_UA;
  const verbose = opts.verbose !== false;
  const log = (msg) => {
    if (verbose) console.log(`[bbtirtha] ${msg}`);
  };

  if (typeof fetch !== "function") {
    console.warn(
      "[bbtirtha] global fetch is unavailable (Node < 18). Skipping import; pipeline continues.",
    );
    return [];
  }

  const originHosts = makeOriginHosts(origin);
  const fetchText = createFetcher({ userAgent, minDelayMs, timeoutMs, maxAttempts, log });

  // 1. robots.txt first — respect Disallow for our UA.
  let isAllowed = () => true;
  const robotsRes = await fetchText(`${origin}/robots.txt`);
  if (robotsRes) {
    const disallow = parseRobots(robotsRes.text, userAgent);
    isAllowed = makeRobotsMatcher(disallow);
    log(`robots.txt loaded — ${disallow.length} disallow rule(s) for our UA.`);
  } else {
    log("robots.txt not available; assuming crawling is permitted (allow-all).");
  }

  const today = new Date().toISOString().slice(0, 10);
  const existing = loadExistingLibrary(origin, originHosts);
  log(
    `existing library indexed — ${existing.bySlug.size} collection(s), ` +
      `${existing.sourceUrlSet.size} source URL(s), ${existing.slugs.size} slug(s).`,
  );
  const dedup = createDedup(existing);
  const ctx = { fetchText, isAllowed, originHosts, dedup, slugs: existing.slugs, log };

  const seeds = Array.isArray(opts.seeds)
    ? uniqueOrdered(opts.seeds.map((s) => canonicalize(s, origin, originHosts)).filter(Boolean))
    : [];

  let planned = [];

  if (seeds.length) {
    // ------------------------- targeted, section-driven crawl -------------
    const probe = await fetchText(seeds[0]);
    if (!probe) {
      console.warn(
        `[bbtirtha] ${seeds[0]} is unreachable right now. No content imported; a networked run is required.`,
      );
      return [];
    }

    const bySection = { books: [], magazines: [], letters: [] };
    for (const s of seeds) {
      const sec = sectionOf(s);
      if (sec) bySection[sec].push(s);
      else log(`seed ignored (unknown section): ${s}`);
    }

    const caps = {
      letters: opts.lettersMax ?? 150,
      books: opts.booksMax ?? 200,
      magazines: opts.magazinesMax ?? 200,
    };
    let remaining = maxItems;
    const stats = { letters: { added: 0, skipped: 0 }, books: { added: 0, skipped: 0 }, magazines: { added: 0, skipped: 0 } };

    // Letters (Q&A) and Books first — small, fully coverable, explicitly structured.
    for (const s of bySection.letters) {
      if (remaining <= 0) break;
      const r = await crawlLetters({ seedUrl: s, ctx, cap: Math.min(caps.letters, remaining), today });
      planned.push(...r.collections);
      stats.letters.added += r.added;
      stats.letters.skipped += r.skipped;
      remaining -= r.added;
    }
    for (const s of bySection.books) {
      if (remaining <= 0) break;
      const r = await crawlBooks({ seedUrl: s, ctx, cap: Math.min(caps.books, remaining), today });
      planned.push(...r.collections);
      stats.books.added += r.added;
      stats.books.skipped += r.skipped;
      remaining -= r.added;
    }
    for (const s of bySection.magazines) {
      if (remaining <= 0) { log(`magazines: global cap ${maxItems} reached before this section`); break; }
      const r = await crawlMagazines({ seedUrl: s, ctx, cap: Math.min(caps.magazines, remaining), today });
      planned.push(...r.collections);
      stats.magazines.added += r.added;
      stats.magazines.skipped += r.skipped;
      remaining -= r.added;
    }

    log("──────── section summary ────────");
    log(`Books:     +${stats.books.added} new, ${stats.books.skipped} skipped`);
    log(`Magazines: +${stats.magazines.added} new, ${stats.magazines.skipped} skipped`);
    log(`Q&A:       +${stats.letters.added} new, ${stats.letters.skipped} skipped`);
  } else {
    // ------------------------- generic homepage crawl --------------------
    const home = await fetchText(`${origin}/`);
    if (!home) {
      console.warn(
        `[bbtirtha] ${origin} is unreachable right now. No content imported; a networked run is required.`,
      );
      return [];
    }
    log("discovering listing and detail pages…");
    const r = await crawlGeneric({ origin, originHosts, ctx, maxItems, maxPages, today });
    planned = r.collections;
    log(`generic crawl — +${r.added} new, ${r.skipped} skipped`);
  }

  // Merge into the existing library (never overwrite).
  log("──────── merge ────────");
  const collections = mergeWithExisting(planned, existing.bySlug, log);

  if (collections.length === 0) {
    log("nothing new to write — every discovered teaching already exists.");
  } else {
    log(`done — ${collections.length} collection file(s) to write.`);
  }
  return collections;
}

export default bbtirthaSource;
