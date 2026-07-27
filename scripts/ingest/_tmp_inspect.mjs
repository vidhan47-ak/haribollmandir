import fs from "node:fs";

const out = [];
const log = (...a) => out.push(a.join(" "));

const pdf = "d:/haribolll/public/downloads/bhajan-giti.pdf";
log("pdf exists:", fs.existsSync(pdf), fs.existsSync(pdf) ? fs.statSync(pdf).size + " bytes" : "");

const p = "d:/haribolll/content/grantha/bhajan-giti.json";
const j = JSON.parse(fs.readFileSync(p, "utf8"));

const cps = (s) => [...s].map((c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")).join(" ");

const targets = /[\u0951\u0952]|[\u0900-\u097F]:|(^|[\s\[\]।॥(){}])3[o%]([\s\[\]।॥(){}]|$)/;
for (const a of j.articles.slice(0, 6)) {
  log("\n===== " + a.slug + " | title: " + JSON.stringify(a.title));
  log("  title cps:", cps(a.title));
  log("  excerpt:", JSON.stringify(a.excerpt));
  a.blocks.forEach((b, i) => {
    const texts = [];
    if (b.type === "poem") b.lines.forEach((l, k) => texts.push(["poem.line" + k, l]));
    else if (b.type === "paragraph" || b.type === "heading" || b.type === "quote") texts.push([b.type, b.text]);
    else if (b.type === "verse") ["sanskrit", "transliteration", "translation", "reference"].forEach((f) => b[f] && texts.push(["verse." + f, b[f]]));
    for (const [kind, t] of texts) {
      if (targets.test(t)) log("  [" + i + " " + kind + "] " + JSON.stringify(t));
    }
  });
}

fs.writeFileSync("d:/haribolll/scripts/ingest/_tmp_out.txt", out.join("\n"), "utf8");
