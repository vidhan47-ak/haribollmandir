import fs from "fs";
import path from "path";
import {
  estimateReadingMinutes,
  type ArticleRef,
  type GranthaCollection,
} from "./grantha-types";

/* ------------------------------------------------------------------ */
/*  Grantha Mandir — server data layer.                                */
/*                                                                     */
/*  All library content lives as JSON collections in content/grantha.  */
/*  The ingestion pipeline (scripts/ingest) writes the same schema, so */
/*  new sources (Bhagavat Patrika crawls, books, lectures…) appear in  */
/*  the library without frontend changes.                              */
/*                                                                     */
/*  Types, constants and pure helpers live in ./grantha-types so that  */
/*  client components can import them without pulling in `fs`.         */
/* ------------------------------------------------------------------ */

export * from "./grantha-types";

const CONTENT_DIR = path.join(process.cwd(), "content", "grantha");

let cache: { data: GranthaCollection[]; mtimes: Map<string, number> } | null =
  null;

function readCollections(): GranthaCollection[] {
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(CONTENT_DIR)
      .filter((file) => file.endsWith(".json"))
      .sort();
  } catch {
    return [];
  }

  const currentMtimes = new Map<string, number>();
  for (const file of files) {
    try {
      currentMtimes.set(file, fs.statSync(path.join(CONTENT_DIR, file)).mtimeMs);
    } catch {
      // ignore unreadable files
    }
  }

  if (cache) {
    let changed = false;
    for (const [file, mtime] of currentMtimes) {
      if (cache.mtimes.get(file) !== mtime) {
        changed = true;
        break;
      }
    }
    if (!changed) return cache.data;
  }

  const collections: GranthaCollection[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
      const parsed = JSON.parse(raw) as GranthaCollection;
      if (parsed?.slug && Array.isArray(parsed.articles)) {
        collections.push(parsed);
      }
    } catch {
      // A malformed import must never take the library down.
    }
  }

  cache = { data: collections, mtimes: currentMtimes };
  return collections;
}

export function getCollections(): GranthaCollection[] {
  return readCollections();
}

export function getAllArticles(): ArticleRef[] {
  return getCollections().flatMap((collection) =>
    collection.articles.map((article) => ({
      ...article,
      collectionSlug: collection.slug,
      collectionTitle: collection.title,
      kind: collection.kind,
      pdfUrl: collection.pdfUrl,
      readingMinutes: estimateReadingMinutes(article.blocks),
    })),
  );
}

export function getCollection(slug: string): GranthaCollection | undefined {
  return getCollections().find((collection) => collection.slug === slug);
}

export function getArticle(slug: string): ArticleRef | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}

/** Siblings inside the same collection, in table-of-contents order. */
export function getArticleNeighbours(slug: string): {
  previous?: ArticleRef;
  next?: ArticleRef;
} {
  const article = getArticle(slug);
  if (!article) return {};
  const siblings = getAllArticles().filter(
    (candidate) => candidate.collectionSlug === article.collectionSlug,
  );
  const index = siblings.findIndex((candidate) => candidate.slug === slug);
  return {
    previous: index > 0 ? siblings[index - 1] : undefined,
    next: index < siblings.length - 1 ? siblings[index + 1] : undefined,
  };
}

export function getRelatedArticles(slug: string, limit = 3): ArticleRef[] {
  const article = getArticle(slug);
  if (!article) return [];
  return getAllArticles()
    .filter((candidate) => candidate.slug !== slug)
    .map((candidate) => ({
      candidate,
      score:
        candidate.tags.filter((tag) => article.tags.includes(tag)).length +
        (candidate.collectionSlug === article.collectionSlug ? 1 : 0) +
        (candidate.category === article.category ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}
