/* ------------------------------------------------------------------ */
/*  Block parsing.                                                     */
/*                                                                     */
/*  Turns a stream of raw lines (from a PDF text layer or HTML) into   */
/*  the ArticleBlock[] the frontend renders — preserving headings,     */
/*  Sanskrit verses, transliteration, translations and paragraphs.    */
/* ------------------------------------------------------------------ */

// Devanagari / Bengali unicode ranges signal an original-script verse line.
const SCRIPT_RE = /[ऀ-ॿঀ-৿]/;
// Diacritics used in IAST transliteration (ā ī ū ṛ ṁ ṇ ś ṣ ṭ etc.).
const IAST_RE = /[āīūṛṝḷēōṁṃḥṇṭḍśṣñṅ]/i;

function isBlank(line) {
  return line.trim().length === 0;
}

/** A short, title-cased line with no terminal punctuation reads as a heading. */
function looksLikeHeading(line) {
  const t = line.trim();
  if (t.length === 0 || t.length > 70) return false;
  if (/[.!?;:]$/.test(t)) return false;
  const words = t.split(/\s+/);
  if (words.length > 9) return false;
  const capitalised = words.filter((w) => /^[A-Z(]/.test(w)).length;
  return capitalised / words.length >= 0.6;
}

function looksLikeVerseLine(line) {
  return SCRIPT_RE.test(line) || IAST_RE.test(line);
}

/**
 * @param {string[]|string} input  raw lines, or a text blob to split on newlines
 * @returns {import("./types.mjs").ArticleBlock[]}
 */
export function parseBlocks(input) {
  const lines = Array.isArray(input) ? input : String(input || "").split("\n");
  const blocks = [];
  let paragraph = [];
  let verse = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "paragraph", text });
      paragraph = [];
    }
  };

  const flushVerse = () => {
    if (verse) {
      // Sort verse lines into script / transliteration / translation.
      const sanskrit = verse.filter((l) => SCRIPT_RE.test(l)).join("\n");
      const translit = verse
        .filter((l) => !SCRIPT_RE.test(l) && IAST_RE.test(l))
        .join("\n");
      const translation = verse
        .filter((l) => !SCRIPT_RE.test(l) && !IAST_RE.test(l))
        .join(" ")
        .trim();
      const block = { type: "verse" };
      if (sanskrit) block.sanskrit = sanskrit;
      if (translit) block.transliteration = translit;
      if (translation) block.translation = translation;
      if (block.sanskrit || block.transliteration || block.translation) {
        blocks.push(block);
      }
      verse = null;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/ /g, " ").trimEnd();

    if (isBlank(line)) {
      flushParagraph();
      flushVerse();
      continue;
    }

    if (looksLikeVerseLine(line)) {
      flushParagraph();
      verse = verse ?? [];
      verse.push(line.trim());
      continue;
    }

    // A non-verse line ends any open verse.
    flushVerse();

    if (looksLikeHeading(line)) {
      flushParagraph();
      blocks.push({ type: "heading", level: 2, text: line.trim() });
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushVerse();
  return blocks;
}
