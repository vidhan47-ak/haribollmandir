/* ------------------------------------------------------------------ */
/*  Collection writer.                                                 */
/*                                                                     */
/*  Every source adapter produces raw articles; this module assembles  */
/*  them into a GranthaCollection and writes it to content/grantha,    */
/*  in the exact schema lib/grantha.ts reads. No frontend changes are  */
/*  ever needed to surface a new import.                               */
/* ------------------------------------------------------------------ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slugify, excerptFrom } from "./normalize.mjs";
import { classifyArticle } from "./classify.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(HERE, "..", "..", "..", "content", "grantha");

/**
 * Finalize a raw article: derive slug, tags, category, excerpt.
 * @param {import("./types.mjs").RawArticle} raw
 * @param {{ published?: string }} defaults
 */
export function finalizeArticle(raw, defaults = {}) {
  const { category, tags } = classifyArticle({
    title: raw.title,
    blocks: raw.blocks,
    hintTags: raw.tags,
    hintCategory: raw.category,
  });
  return {
    slug: raw.slug || slugify(raw.title),
    title: raw.title.trim(),
    author: (raw.author || defaults.author || "Bhagavat Patrika").trim(),
    published: raw.published || defaults.published,
    category,
    tags,
    excerpt: raw.excerpt || excerptFrom(raw.blocks),
    cover: raw.cover,
    audioUrl: raw.audioUrl,
    blocks: raw.blocks,
    // Optional provenance / metadata — undefined values are dropped by
    // JSON.stringify, so legacy sources are unaffected.
    language: raw.language,
    sourceCategory: raw.sourceCategory,
    sourceUrl: raw.sourceUrl,
    contentAvailability: raw.contentAvailability,
  };
}

/**
 * @param {import("./types.mjs").RawCollection} collection
 * @returns {string} the written file path
 */
export function writeCollection(collection) {
  const slug = collection.slug || slugify(collection.title);
  const published =
    [collection.year, collection.issue].filter(Boolean).join(" · ") ||
    undefined;

  const record = {
    slug,
    kind: collection.kind || "patrika",
    title: collection.title,
    subtitle: collection.subtitle,
    description: collection.description || "",
    year: collection.year,
    issue: collection.issue,
    cover: collection.cover,
    pdfUrl: collection.pdfUrl,
    pdfLabel: collection.pdfLabel,
    featured: Boolean(collection.featured),
    addedAt: collection.addedAt || new Date().toISOString().slice(0, 10),
    articles: (collection.articles || []).map((a) =>
      finalizeArticle(a, { published }),
    ),
  };

  fs.mkdirSync(CONTENT_DIR, { recursive: true });
  const file = path.join(CONTENT_DIR, `${slug}.json`);
  fs.writeFileSync(file, JSON.stringify(record, null, 2) + "\n", "utf8");
  return file;
}

export { CONTENT_DIR };
