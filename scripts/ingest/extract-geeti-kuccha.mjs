import fs from "node:fs";

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const file = "content-sources/geeti_kuccha_searchable_compact.pdf";
const data = new Uint8Array(fs.readFileSync(file));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

const out = [];
for (let i = 1; i <= doc.numPages; i += 1) {
  const page = await doc.getPage(i);
  const content = await page.getTextContent();
  // Re-flow positioned items into lines by their y-coordinate (like pdf-source).
  const items = content.items
    .map((it) => ({ x: it.transform[4], y: Math.round(it.transform[5]), s: it.str }))
    .filter((it) => it.s !== undefined);
  // group into lines
  const lines = [];
  let cur = { y: null, parts: [] };
  for (const it of items) {
    if (cur.y === null || Math.abs(cur.y - it.y) <= 2) {
      cur.y = cur.y ?? it.y;
      cur.parts.push(it);
    } else {
      cur.parts.sort((a, b) => a.x - b.x);
      lines.push(cur.parts.map((p) => p.s).join(""));
      cur = { y: it.y, parts: [it] };
    }
  }
  if (cur.parts.length) {
    cur.parts.sort((a, b) => a.x - b.x);
    lines.push(cur.parts.map((p) => p.s).join(""));
  }
  out.push(`===== PAGE ${String(i).padStart(4, "0")} =====\n` + lines.join("\n"));
}

fs.writeFileSync("content-sources/geeti_kuccha_extracted.txt", out.join("\n\n"), "utf8");
console.log("pages:", doc.numPages, "-> content-sources/geeti_kuccha_extracted.txt", "chars:", out.join("").length);
