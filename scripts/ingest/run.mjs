/* ------------------------------------------------------------------ */
/*  Grantha Mandir — ingestion runner (CLI).                           */
/*                                                                     */
/*  Usage:                                                             */
/*    node scripts/ingest/run.mjs                # run every source    */
/*    node scripts/ingest/run.mjs --source=pdf   # one source only     */
/*    node scripts/ingest/run.mjs --dry          # parse, don't write   */
/*                                                                     */
/*  Sources are declared in ingest.config.mjs. Each returns raw        */
/*  collections; the core normalises, auto-tags, generates covers and  */
/*  writes JSON into content/grantha — the same schema the site reads. */
/*  Adding a new origin never touches the frontend.                    */
/* ------------------------------------------------------------------ */

import { writeCollection } from "./core/write-collection.mjs";
import { loadSources } from "./ingest.config.mjs";

function parseArgs(argv) {
  const args = { source: null, dry: false };
  for (const arg of argv.slice(2)) {
    if (arg === "--dry") args.dry = true;
    else if (arg.startsWith("--source=")) args.source = arg.slice(9);
  }
  return args;
}

async function main() {
  const { source: only, dry } = parseArgs(process.argv);
  const sources = await loadSources();

  const selected = only
    ? sources.filter((s) => s.id === only)
    : sources;

  if (selected.length === 0) {
    console.warn(
      only
        ? `[ingest] no source named "${only}". Available: ${sources
            .map((s) => s.id)
            .join(", ")}`
        : "[ingest] no sources configured. Edit scripts/ingest/ingest.config.mjs.",
    );
    return;
  }

  let collectionCount = 0;
  let articleCount = 0;

  for (const source of selected) {
    console.log(`\n[ingest] ▸ ${source.id}`);
    let collections = [];
    try {
      collections = await source.collect();
    } catch (err) {
      console.error(`[ingest] ${source.id} failed: ${err.message}`);
      continue;
    }

    for (const collection of collections) {
      const n = collection.articles?.length ?? 0;
      articleCount += n;
      collectionCount += 1;
      if (dry) {
        console.log(`   · ${collection.title} — ${n} articles (dry run)`);
        continue;
      }
      const file = writeCollection(collection);
      console.log(`   ✓ ${collection.title} — ${n} articles → ${file}`);
    }
  }

  console.log(
    `\n[ingest] done — ${collectionCount} collection(s), ${articleCount} article(s)${
      dry ? " (dry run, nothing written)" : ""
    }.`,
  );
}

main().catch((err) => {
  console.error("[ingest] fatal:", err);
  process.exitCode = 1;
});
