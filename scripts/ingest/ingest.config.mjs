/* ------------------------------------------------------------------ */
/*  Grantha Mandir — ingestion configuration.                          */
/*                                                                     */
/*  Declare every content origin here. Each entry becomes a Source     */
/*  ({ id, collect }). The runner iterates them; adding a new origin    */
/*  (a books folder, lecture transcripts, kirtan lyrics…) is a matter   */
/*  of adding one entry — no frontend or core changes required.        */
/*                                                                     */
/*  Bhagavat Patrika (https://www.purebhakti.com/resources/bhagavat-   */
/*  patrika) is ingested by downloading the issue PDFs into            */
/*  `content-sources/bhagavat-patrika/` and pointing the pdf source at  */
/*  that folder. We keep the crawl + download step manual so the build  */
/*  never depends on network access or scrapes without oversight.      */
/* ------------------------------------------------------------------ */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { pdfSource } from "./sources/pdf-source.mjs";
import { jsonSource } from "./sources/json-source.mjs";
import { songCelestialSource } from "./sources/song-celestial-source.mjs";
import { bbtirthaSource } from "./sources/bbtirtha-source.mjs";
import { bhajanGitiSource } from "./sources/bhajan-giti-source.mjs";
import { gitigucchaSource } from "./sources/gitiguccha-source.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const sourceDir = (name) => path.join(ROOT, "content-sources", name);

/**
 * Returns the list of active sources.
 * @returns {Promise<import("./core/types.mjs").Source[]>}
 */
export async function loadSources() {
  return [
    // Bhagavat Patrika — issue PDFs downloaded from purebhakti.com.
    {
      id: "bhagavat-patrika",
      collect: () =>
        pdfSource({
          dir: sourceDir("bhagavat-patrika"),
          kind: "patrika",
          titlePrefix: "Bhagavat Patrika",
          sourceUrl: "https://www.purebhakti.com/resources/bhagavat-patrika",
        }),
    },

    // The Song Celestial — the public-domain English verse Gita
    // (Project Gutenberg #2388), parsed from a committed HTML snapshot. The
    // Hindi Gita Press edition is offered as a download alongside it.
    {
      id: "song-celestial",
      collect: () =>
        songCelestialSource({
          file: path.join(
            sourceDir("song-celestial"),
            "song-celestial-gutenberg-2388.htm",
          ),
          pdfUrl: "/downloads/bhagavad-gita-hindi-gita-press.pdf",
        }),
    },

    // Bhajana Gīti — a compiled Devanāgarī bhajan/kīrtana songbook. Content is
    // parsed from a human-verified, word-for-word plain-text transcription of
    // the whole book (the OCR/PDF text layer was corrupt), with songs recovered
    // from the printed index + in-text headings. The full book PDF is still
    // offered as a download alongside the readable text.
    {
      id: "bhajan-giti",
      collect: () =>
        bhajanGitiSource({
          sourcePath: path.join(
            ROOT,
            "content-sources",
            "bhajan_giti_transcription_word_verified.txt",
          ),
          pdfUrl: "/downloads/bhajan-giti.pdf",
          pdfLabel: "Full Bhajana Gīti (PDF)",
          addedAt: "2026-07-23",
        }),
    },

    // Śrī Gauḍīya Gītiguccha — a second Devanāgarī songbook from the same
    // Śrī Chaitanya Gauḍīya Maṭha lineage, parsed from the clean text layer of
    // its searchable PDF. Every song is deduped against Bhajana Gīti so only
    // genuinely new bhajans are added — nothing repeats.
    {
      id: "gitiguccha",
      collect: () =>
        gitigucchaSource({
          sourcePath: path.join(
            ROOT,
            "content-sources",
            "geeti_kuccha_extracted.txt",
          ),
          pdfUrl: "/downloads/gaudiya-gitiguccha.pdf",
          pdfLabel: "Full Śrī Gauḍīya Gītiguccha (PDF)",
          addedAt: "2026-07-24",
        }),
    },

    // bbtirtha.org — one-time import of teachings from the Sree Chaitanya
    // Gaudiya Math archive. Seeded from the Books, Magazines and Letters
    // section pages, it follows them into their book/collection/detail pages,
    // skips anything already in the library, and MERGES new teachings into the
    // matching collections (never overwriting). Discovery + parsing are polite
    // (robots respected, one request at a time, >=1s apart, 30s timeout). The
    // caps bound the run so it covers the sections without running away.
    {
      id: "bbtirtha",
      collect: () =>
        bbtirthaSource({
          origin: "https://bbtirtha.org",
          seeds: [
            "https://bbtirtha.org/EN/books",
            "https://bbtirtha.org/EN/magazines",
            "https://bbtirtha.org/EN/letters",
          ],
          maxItems: 400,
        }),
    },

    // Hand-authored / future collections (books, lectures, kirtans, temple
    // newsletters). Drop authored collection JSON into content-sources/curated.
    {
      id: "curated",
      collect: () => jsonSource({ dir: sourceDir("curated") }),
    },
  ];
}
