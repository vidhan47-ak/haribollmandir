/* Shared normalisation helpers: slugify, reading-time, excerpts. */

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function wordsInBlock(block) {
  if (block.type === "divider") return 0;
  if (block.type === "verse") {
    return [block.sanskrit, block.transliteration, block.translation]
      .filter(Boolean)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
  }
  if (block.type === "poem") {
    return (block.lines || [])
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
  }
  return String(block.text || "")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function readingMinutes(blocks) {
  const words = blocks.reduce((sum, b) => sum + wordsInBlock(b), 0);
  return Math.max(1, Math.round(words / 180));
}

/** First meaningful paragraph (or poem stanza), trimmed to a graceful excerpt. */
export function deriveExcerpt(blocks, max = 220) {
  const para = blocks.find(
    (b) => b.type === "paragraph" && String(b.text || "").trim().length > 40,
  );
  let text = para ? String(para.text).trim() : "";
  if (!text) {
    // Poetry-only articles (e.g. Song Celestial): draw from the first stanza.
    const poem = blocks.find(
      (b) => b.type === "poem" && (b.lines || []).join(" ").trim().length > 40,
    );
    if (poem) text = poem.lines.join(" ").replace(/\s+/g, " ").trim();
  }
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export function collapseWhitespace(text) {
  return String(text).replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
}

/** Alias kept for the collection writer's naming. */
export const excerptFrom = deriveExcerpt;
