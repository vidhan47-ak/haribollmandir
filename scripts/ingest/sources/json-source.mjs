/* ------------------------------------------------------------------ */
/*  JSON / Markdown manuscript source.                                  */
/*                                                                      */
/*  For content that already exists as structured text (temple          */
/*  newsletters, lecture transcripts, kirtan lyrics, hand-curated       */
/*  books) — drop authored `.json` files describing a collection into   */
/*  a directory and this source normalises + auto-tags them.            */
/*                                                                      */
/*  A source file may either be a full collection (with `articles`) or  */
/*  a lightweight shape where each article carries raw `text` that the  */
/*  block parser converts. Missing tags/categories are auto-derived.    */
/* ------------------------------------------------------------------ */

import fs from "fs";
import path from "path";
import { parseBlocks } from "../core/parse-blocks.mjs";
import { slugify } from "../core/normalize.mjs";

/**
 * Produce a RawArticle. Tags, category, excerpt and slug are intentionally
 * left for the core `finalizeArticle` step (in write-collection.mjs) so every
 * source classifies identically. Curator-supplied hints are passed through.
 */
function normaliseArticle(raw) {
  const blocks =
    Array.isArray(raw.blocks) && raw.blocks.length
      ? raw.blocks
      : parseBlocks(String(raw.text || ""));

  return {
    slug: raw.slug,
    title: raw.title || "Untitled",
    author: raw.author || "Hariboll Mandir",
    published: raw.published,
    category: raw.category,
    tags: raw.tags,
    excerpt: raw.excerpt,
    cover: raw.cover,
    audioUrl: raw.audioUrl,
    blocks,
  };
}

/**
 * @param {object} opts
 * @param {string} opts.dir  directory of authored collection .json files
 * @returns {Promise<import("../core/types.mjs").RawCollection[]>}
 */
export async function jsonSource(opts) {
  const { dir } = opts;
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  } catch {
    console.warn(`[json-source] directory not found: ${dir}`);
    return [];
  }

  const collections = [];
  for (const file of files) {
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
    } catch (err) {
      console.warn(`[json-source] skipped ${file}: ${err.message}`);
      continue;
    }
    if (!raw || !Array.isArray(raw.articles)) continue;

    collections.push({
      slug: raw.slug ? slugify(raw.slug) : slugify(raw.title || file),
      kind: raw.kind || "article",
      title: raw.title || file.replace(/\.json$/, ""),
      subtitle: raw.subtitle,
      description: raw.description || "",
      year: raw.year,
      issue: raw.issue,
      cover: raw.cover,
      pdfUrl: raw.pdfUrl,
      featured: raw.featured,
      addedAt: raw.addedAt,
      articles: raw.articles.map(normaliseArticle),
    });
  }

  return collections;
}
