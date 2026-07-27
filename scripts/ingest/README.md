# Grantha Mandir — ingestion pipeline

A modular importer that turns any source (PDF archives, authored JSON,
future crawlers) into the JSON schema the library frontend reads. **New
sources never require frontend changes** — they just write another
collection into `content/grantha/`.

```
scripts/ingest/
  run.mjs               CLI runner — reads ingest.config.mjs, runs sources, writes collections
  ingest.config.mjs     Declares which sources to run and with what options
  core/
    types.mjs           Shared shapes (JSDoc): RawArticle, RawCollection, Source
    normalize.mjs       slugify, reading-time, excerpt, whitespace
    parse-blocks.mjs    raw lines/text → ArticleBlock[] (verses, headings, paragraphs)
    classify.mjs        auto-tagging + primary category from the fixed vocabulary
    write-collection.mjs finalizeArticle + writeCollection → content/grantha/<slug>.json
  sources/
    pdf-source.mjs      A directory of PDFs → collections (uses pdfjs-dist, lazy)
    json-source.mjs     A directory of authored .json collections → normalized collections
```

## Running

```bash
npm run ingest
```

This reads `ingest.config.mjs`, runs each configured source, and writes one
`<slug>.json` per collection into `content/grantha/`. The website picks them
up automatically on the next build (see `lib/grantha.ts`).

## Data flow

1. A **source** discovers content from one origin and emits `RawCollection[]`
   (raw articles carry `blocks` and optionally curator hints).
2. `writeCollection()` runs every article through `finalizeArticle()`, which:
   - derives a slug from the title (unless provided),
   - auto-tags and picks a primary category via `classify.mjs`
     (curator-supplied `tags`/`category` win over the auto values),
   - derives an excerpt from the first substantial paragraph,
   - writes the exact `GranthaCollection` schema `lib/grantha-types.ts` defines.

Because the contract is the JSON schema on disk, the frontend and the
pipeline are fully decoupled.

## Adding a new source (e.g. Chaitanya Charitamrita, lecture transcripts)

1. Write `sources/<name>-source.mjs` exporting an async function that returns
   `RawCollection[]`. Reuse `parseBlocks` for free verse/heading detection.
2. Register it in `ingest.config.mjs`.
3. Run `npm run ingest`.

No component, route, or type change is needed.

## PDF ingestion (Bhagavat Patrika)

`pdf-source.mjs` extracts the text layer of each PDF with `pdfjs-dist`
(install with `npm install pdfjs-dist` — loaded lazily so the website build
never depends on it), reflows positioned text into lines, splits an issue
into articles by detecting title lines, and parses each into blocks. Filename
metadata like `Bhagavat Patrika 1955 Issue 1.pdf` seeds year/issue.

Point it at a directory of downloaded issues from the archive
(https://www.purebhakti.com/resources/bhagavat-patrika — republished with
permission) via `ingest.config.mjs`.

> Cover thumbnails are generated procedurally in the UI
> (`components/grantha/GranthaCover.tsx`) from each item's title, so no cover
> image files are required; a `cover` URL in the JSON is used if present.
