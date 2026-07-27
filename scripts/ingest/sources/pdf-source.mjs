/* ------------------------------------------------------------------ */
/*  PDF source adapter.                                                 */
/*                                                                      */
/*  Ingests a directory of PDF files (e.g. downloaded Bhagavat Patrika  */
/*  issues) into the Grantha collection schema. Each PDF becomes one    */
/*  collection; its text is split into articles by the block parser.    */
/*                                                                      */
/*  Text extraction is delegated to `pdfjs-dist` when available. The    */
/*  dependency is loaded lazily so the rest of the pipeline (and the    */
/*  website build) never require it. If it is missing, this source      */
/*  explains how to add it instead of crashing the run.                 */
/* ------------------------------------------------------------------ */

import fs from "fs";
import path from "path";
import { parseBlocks } from "../core/parse-blocks.mjs";
import { slugify } from "../core/normalize.mjs";

/** Lazily resolve pdfjs-dist; return null with guidance if absent. */
async function loadPdfjs() {
  try {
    // legacy build works in plain Node without a DOM
    const mod = await import("pdfjs-dist/legacy/build/pdf.mjs");
    return mod;
  } catch {
    return null;
  }
}

/**
 * Extract the text of every page. Returns an array of page strings so the
 * block parser can treat page breaks as soft paragraph boundaries and the
 * first page can seed a generated cover.
 */
async function extractPages(pdfjs, filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Re-flow the positioned text items into lines using their y-coordinates.
    const lines = [];
    let current = { y: null, parts: [] };
    for (const item of content.items) {
      const y = Math.round(item.transform[5]);
      if (current.y === null || Math.abs(current.y - y) <= 2) {
        current.y = current.y ?? y;
        current.parts.push(item.str);
      } else {
        lines.push(current.parts.join(""));
        current = { y, parts: [item.str] };
      }
    }
    if (current.parts.length) lines.push(current.parts.join(""));
    pages.push(lines.join("\n"));
  }
  return pages;
}

/**
 * Heuristic: split a full issue's text into individual articles. Titles are
 * detected as short, title-cased lines separated by blank space. When no
 * internal titles are found, the whole issue becomes a single article.
 */
function splitArticles(pages, fallbackTitle) {
  const full = pages.join("\n\n");
  const lines = full.split("\n");
  const sections = [];
  let currentTitle = fallbackTitle;
  let buffer = [];

  const looksLikeTitle = (line) => {
    const t = line.trim();
    if (t.length < 6 || t.length > 70) return false;
    if (/[.!?;:,]$/.test(t)) return false;
    const words = t.split(/\s+/);
    if (words.length > 9) return false;
    // Mostly capitalised words → a heading.
    const caps = words.filter((w) => /^[A-Z"'(]/.test(w)).length;
    return caps / words.length >= 0.7;
  };

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text.length > 120) sections.push({ title: currentTitle, text });
    buffer = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const prevBlank = i === 0 || lines[i - 1].trim() === "";
    const nextBlank = i === lines.length - 1 || lines[i + 1].trim() === "";
    if (prevBlank && nextBlank && looksLikeTitle(line)) {
      flush();
      currentTitle = line.trim();
      continue;
    }
    buffer.push(line);
  }
  flush();

  return sections.length ? sections : [{ title: fallbackTitle, text: full }];
}

/** Parse "Bhagavat Patrika 1955 Issue 1" style metadata from a filename. */
function metaFromFilename(file) {
  const base = path.basename(file, path.extname(file));
  const year = (base.match(/\b(1[89]\d\d|20\d\d)\b/) || [])[1];
  const issue = (base.match(/\bissue[ _-]?(\d+)\b/i) || [])[1];
  return { base, year, issue };
}

/**
 * @param {object} opts
 * @param {string} opts.dir           directory of .pdf files
 * @param {string} [opts.kind]        content kind (default "patrika")
 * @param {string} [opts.titlePrefix] collection title prefix
 * @param {string} [opts.sourceUrl]   original archive URL (Download PDF)
 * @returns {Promise<import("../core/types.mjs").RawCollection[]>}
 */
export async function pdfSource(opts) {
  const {
    dir,
    kind = "patrika",
    titlePrefix = "Bhagavat Patrika",
    sourceUrl,
  } = opts;

  const pdfjs = await loadPdfjs();
  if (!pdfjs) {
    console.warn(
      "\n[pdf-source] pdfjs-dist is not installed — cannot extract PDF text.\n" +
        "            Install it to enable PDF ingestion:\n" +
        "              npm install pdfjs-dist\n" +
        "            Skipping this source for now.\n",
    );
    return [];
  }

  let files = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".pdf"))
      .sort();
  } catch {
    console.warn(`[pdf-source] directory not found: ${dir}`);
    return [];
  }

  const collections = [];
  for (const file of files) {
    const full = path.join(dir, file);
    const { base, year, issue } = metaFromFilename(file);
    let pages;
    try {
      pages = await extractPages(pdfjs, full);
    } catch (err) {
      console.warn(`[pdf-source] failed to read ${file}: ${err.message}`);
      continue;
    }

    const collTitle = [titlePrefix, year, issue && `Issue ${issue}`]
      .filter(Boolean)
      .join(" · ");
    const sections = splitArticles(pages, collTitle);

    const articles = sections.map((section) => {
      const blocks = parseBlocks(section.text);
      return {
        title: section.title,
        author: "Bhagavat Patrika",
        published: [year, issue && `Issue ${issue}`].filter(Boolean).join(" · "),
        blocks,
      };
    });

    collections.push({
      slug: slugify(`${titlePrefix}-${year || base}-${issue || ""}`),
      kind,
      title: collTitle,
      description: `Every article from ${collTitle}, presented as a living reading experience.`,
      year,
      issue: issue ? `Issue ${issue}` : undefined,
      pdfUrl: sourceUrl,
      articles,
    });
  }

  return collections;
}
