/* ------------------------------------------------------------------ */
/*  Devanāgarī → Latin transliteration for SEARCH.                     */
/*                                                                     */
/*  The library holds many Devanāgarī bhajans, but visitors search in   */
/*  romanised English ("madhav", "radha", "govinda"). This produces a   */
/*  diacritic-free, lowercase phonetic romanisation so a Latin query     */
/*  matches a Devanāgarī song by substring — माधव → "madhava" (so        */
/*  "madhav" matches), कृष्ण → "krishna", राधा → "radha".                 */
/*                                                                     */
/*  It is intentionally forgiving (built for recall, not scholarly IAST) */
/*  and client-safe (no `fs`), so both the data layer and components can  */
/*  use it. Non-Devanāgarī text passes through lowercased unchanged.     */
/* ------------------------------------------------------------------ */

import type { Article, ArticleBlock } from "./grantha-types";

const VOWELS: Record<string, string> = {
  "अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u",
  "ऋ": "ri", "ॠ": "ri", "ऌ": "li", "ॡ": "li",
  "ए": "e", "ऐ": "ai", "ओ": "o", "औ": "au",
  "ऍ": "e", "ऎ": "e", "ऑ": "o", "ऒ": "o", "ॲ": "a",
};

const MATRAS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u",
  "ृ": "ri", "ॄ": "ri", "ॢ": "li", "ॣ": "li",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
  "ॅ": "e", "ॆ": "e", "ॉ": "o", "ॊ": "o",
};

const CONSONANTS: Record<string, string> = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "n",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "n",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v",
  "श": "sh", "ष": "sh", "स": "s", "ह": "h", "ळ": "l",
  // nukta-composed forms
  "क़": "k", "ख़": "kh", "ग़": "g", "ज़": "z", "ड़": "r",
  "ढ़": "rh", "फ़": "f", "य़": "y",
};

const SIGNS: Record<string, string> = {
  "ं": "n", "ः": "h", "ँ": "n", "ऽ": "", "ॐ": "om", "़": "",
};

const HALANT = "\u094d"; // virama — suppresses the inherent "a"
const DIGITS = "०१२३४५६७८९";

/** Phonetic, diacritic-free, lowercase romanisation of Devanāgarī text. */
export function devanagariToLatin(text: string): string {
  const s = String(text || "");
  let out = "";
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    const cons = CONSONANTS[ch];
    if (cons !== undefined) {
      out += cons;
      const next = s[i + 1];
      if (next === HALANT) {
        i += 1; // conjunct — no vowel between the consonants
      } else if (MATRAS[next] !== undefined) {
        out += MATRAS[next];
        i += 1;
      } else {
        out += "a"; // inherent vowel
      }
      continue;
    }
    if (VOWELS[ch] !== undefined) { out += VOWELS[ch]; continue; }
    if (MATRAS[ch] !== undefined) { out += MATRAS[ch]; continue; }
    if (SIGNS[ch] !== undefined) { out += SIGNS[ch]; continue; }
    const digit = DIGITS.indexOf(ch);
    if (digit >= 0) { out += String(digit); continue; }
    out += ch.toLowerCase(); // pass through Latin, spaces, punctuation
  }
  return out;
}

const DEVANAGARI_RE = /[\u0900-\u097f]/;

/** Gather a block's searchable text. */
function blockText(block: ArticleBlock): string {
  if (block.type === "poem") return block.lines.join(" ");
  if (block.type === "verse") {
    return [block.sanskrit, block.transliteration, block.translation]
      .filter(Boolean)
      .join(" ");
  }
  if (block.type === "divider") return "";
  return block.text;
}

/**
 * A compact romanised search index for an article. Empty for articles with no
 * Devanāgarī (their English text is already searched directly), so the client
 * payload only grows for the bhajan collections. Words are de-duplicated and
 * the result capped, so even a long kīrtana section stays small.
 */
export function romanizeArticleForSearch(article: Article): string {
  const parts = [
    article.title,
    article.excerpt,
    article.author,
    ...(article.tags || []),
    ...(article.blocks || []).map(blockText),
  ];
  const combined = parts.filter(Boolean).join(" ");
  if (!DEVANAGARI_RE.test(combined)) return ""; // no Devanāgarī → nothing to add
  const roman = devanagariToLatin(combined);
  // De-duplicate words (a bhajan repeats refrains) and cap the length.
  const seen = new Set<string>();
  const words: string[] = [];
  for (const w of roman.split(/[^a-z0-9]+/)) {
    if (w.length < 2 || seen.has(w)) continue;
    seen.add(w);
    words.push(w);
    if (words.length >= 400) break;
  }
  return words.join(" ").slice(0, 2000);
}
