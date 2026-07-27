/* ------------------------------------------------------------------ */
/*  Grantha Mandir — client-safe types, constants & pure helpers.      */
/*                                                                     */
/*  This module never touches `fs`, so both client components and the  */
/*  server data layer (lib/grantha.ts) can import from it freely.      */
/* ------------------------------------------------------------------ */

export type BlockType =
  | "paragraph"
  | "heading"
  | "verse"
  | "poem"
  | "quote"
  | "divider";

export interface VerseBlock {
  type: "verse";
  sanskrit?: string;
  transliteration?: string;
  translation?: string;
  reference?: string;
}

/**
 * A stanza of metrical poetry in a single language (e.g. the English
 * blank-verse Gita, or a kirtan). Distinct from `verse`, which
 * pairs Sanskrit with transliteration + translation. An optional speaker
 * label ("Krishna.", "Arjuna.") sits above the lines.
 */
export interface PoemBlock {
  type: "poem";
  speaker?: string;
  lines: string[];
}

export interface TextBlock {
  type: "paragraph" | "heading" | "quote";
  text: string;
  level?: 2 | 3; // headings only
  attribution?: string; // quotes only
}

export interface DividerBlock {
  type: "divider";
}

export type ArticleBlock = VerseBlock | PoemBlock | TextBlock | DividerBlock;

export type ContentKind =
  | "patrika"
  | "book"
  | "lecture"
  | "article"
  | "kirtan";

/**
 * A human-readable language label plus a normalized code (BCP-47 where known,
 * or "und" for undetermined). Optional metadata carried by imported content.
 */
export interface ContentLanguage {
  code: string;
  label: string;
}

/**
 * Whether an entry offers readable text, text with audio, or audio only.
 * Absent on legacy content (treated as plain text by consumers).
 */
export type ContentAvailability = "text" | "text-and-audio" | "audio-only";

export interface Article {
  slug: string;
  title: string;
  author: string;
  published?: string; // human readable, e.g. "1955 · Issue 1"
  category: string;
  tags: string[];
  excerpt: string;
  cover?: string;
  audioUrl?: string;
  blocks: ArticleBlock[];

  /* ------------------------------------------------------------------ */
  /*  Optional provenance / metadata for imported content.               */
  /*  All optional so existing JSON and components keep working — legacy  */
  /*  entries simply omit them and render exactly as before.              */
  /* ------------------------------------------------------------------ */

  /** Source language of the teaching, e.g. { code: "en", label: "English" }. */
  language?: ContentLanguage;
  /** The category stated by the origin, e.g. "Harikatha", "Kirtan", "Letter". */
  sourceCategory?: string;
  /** Canonical source URL this entry was imported from (provenance). */
  sourceUrl?: string;
  /** Availability of readable text vs. audio for this entry. */
  contentAvailability?: ContentAvailability;
  /**
   * Romanised (Devanāgarī → Latin) search index, so a Latin query ("madhav")
   * matches a Devanāgarī bhajan (माधव). Computed at the data layer for the
   * library; empty for entries with no Devanāgarī. See lib/translit.ts.
   */
  roman?: string;
}

export interface GranthaCollection {
  slug: string;
  kind: ContentKind;
  title: string;
  subtitle?: string;
  description: string;
  year?: string;
  issue?: string;
  cover?: string;
  pdfUrl?: string;
  pdfLabel?: string; // button text for the download, e.g. "Hindi PDF"
  featured?: boolean;
  addedAt?: string; // ISO date, drives "Recently added"
  articles: Article[];
}

export interface ArticleRef extends Article {
  collectionSlug: string;
  collectionTitle: string;
  kind: ContentKind;
  readingMinutes: number;
  pdfUrl?: string;
}

/* ----------------------------- filters ---------------------------- */

export const LIBRARY_FILTERS = [
  "All",
  "Bhagavat Patrika",
  "Books",
  "Lectures",
  "Articles",
  "Kirtans",
  "Festival Special",
  "Jagannath",
  "Gaura Lila",
  "Radha Krishna",
  "Guru Tattva",
  "Bhakti",
  "Harinam",
] as const;

export type LibraryFilter = (typeof LIBRARY_FILTERS)[number];

/** Automatic tag vocabulary used by the ingestion pipeline. */
export const TAG_VOCABULARY = [
  "Guru Tattva",
  "Krishna",
  "Radha",
  "Mahaprabhu",
  "Nityananda",
  "Harinam",
  "Bhakti",
  "Rasa",
  "Jagannath",
  "Rath Yatra",
  "Ekadashi",
  "Festivals",
  "Srimad Bhagavatam",
  "Bhagavad Gita",
  "Chaitanya Charitamrita",
  "Gaudiya History",
  "Vaisnava Etiquette",
  "Questions & Answers",
] as const;

/* --------------------------- pure helpers ------------------------- */

function wordsInBlock(block: ArticleBlock): number {
  if (block.type === "divider") return 0;
  if (block.type === "verse") {
    return [block.sanskrit, block.transliteration, block.translation]
      .filter(Boolean)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
  }
  if (block.type === "poem") {
    return block.lines.join(" ").split(/\s+/).filter(Boolean).length;
  }
  return block.text.split(/\s+/).filter(Boolean).length;
}

export function estimateReadingMinutes(blocks: ArticleBlock[]): number {
  const words = blocks.reduce((sum, block) => sum + wordsInBlock(block), 0);
  return Math.max(1, Math.round(words / 180));
}
