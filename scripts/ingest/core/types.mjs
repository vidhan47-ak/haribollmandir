/* ------------------------------------------------------------------ */
/*  Grantha Mandir — ingestion core types (JSDoc only).                */
/*                                                                     */
/*  The pipeline is source-agnostic. Every source implements the       */
/*  Source contract below and emits RawArticle records; the core       */
/*  normalises, auto-tags, generates covers and writes the same JSON   */
/*  schema that lib/grantha.ts reads — so new sources never touch the  */
/*  frontend.                                                          */
/* ------------------------------------------------------------------ */

/**
 * @typedef {"patrika"|"book"|"lecture"|"article"|"kirtan"} ContentKind
 */

/**
 * @typedef {Object} RawBlock
 * @property {"paragraph"|"heading"|"verse"|"poem"|"quote"|"divider"} type
 * @property {string} [text]
 * @property {2|3} [level]
 * @property {string} [attribution]
 * @property {string} [sanskrit]
 * @property {string} [transliteration]
 * @property {string} [translation]
 * @property {string} [reference]
 * @property {string} [speaker]      poem only — e.g. "Krishna."
 * @property {string[]} [lines]      poem only — stanza lines
 */

/**
 * @typedef {Object} ContentLanguage
 * @property {string} code   Normalized language code (BCP-47 where known, else "und").
 * @property {string} label  Human-readable label, e.g. "English".
 */

/**
 * @typedef {Object} RawArticle
 * @property {string} title
 * @property {string} [author]
 * @property {string} [published]
 * @property {string} [category]
 * @property {string[]} [tags]
 * @property {string} [excerpt]
 * @property {string} [slug]
 * @property {string} [cover]
 * @property {string} [audioUrl]
 * @property {RawBlock[]} blocks
 *
 * Optional provenance / metadata for imported content (all backward compatible).
 * @property {ContentLanguage} [language]
 * @property {string} [sourceCategory]                  Category stated by the origin.
 * @property {string} [sourceUrl]                        Canonical source URL (provenance).
 * @property {"text"|"text-and-audio"|"audio-only"} [contentAvailability]
 */

/**
 * @typedef {Object} RawCollection
 * @property {string} slug
 * @property {ContentKind} kind
 * @property {string} title
 * @property {string} [subtitle]
 * @property {string} description
 * @property {string} [year]
 * @property {string} [issue]
 * @property {string} [pdfUrl]
 * @property {string} [pdfLabel]
 * @property {boolean} [featured]
 * @property {string} [addedAt]
 * @property {RawArticle[]} articles
 */

/**
 * A Source knows how to discover and fetch collections from one origin.
 * @typedef {Object} Source
 * @property {string} id                     Stable identifier, e.g. "bhagavat-patrika".
 * @property {() => Promise<RawCollection[]>} collect  Returns fully-formed raw collections.
 */

export {};
