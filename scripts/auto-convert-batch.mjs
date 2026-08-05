import sharp from "sharp";
import fs from "fs";
import path from "path";

const batchDir = "D:/haribolll/_gdrive_batch";
const outDir = "D:/haribolll/public/images/gallery";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function processBatch() {
  if (!fs.existsSync(batchDir)) {
    console.log("No _gdrive_batch directory found.");
    return;
  }

  const subfolders = fs.readdirSync(batchDir);
  let newEntries = [];
  let fileCounter = Date.now();

  for (const sub of subfolders) {
    const subPath = path.join(batchDir, sub);
    if (!fs.statSync(subPath).isDirectory()) continue;

    const files = fs.readdirSync(subPath).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    console.log(`Processing subfolder ${sub}: ${files.length} images found.`);

    for (const f of files) {
      fileCounter++;
      const inFilePath = path.join(subPath, f);
      const outFileName = `darshan-batch-${fileCounter}.webp`;
      const outFilePath = path.join(outDir, outFileName);

      try {
        await sharp(inFilePath)
          .resize({ width: 1400, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(outFilePath);

        // Delete raw JPG immediately to keep disk space minimal
        fs.unlinkSync(inFilePath);

        const category =
          sub.includes("02") || sub.includes("05")
            ? "festivals"
            : sub.includes("03") || sub.includes("06")
            ? "sankirtan"
            : sub.includes("04") || sub.includes("07")
            ? "heritage"
            : sub.includes("08")
            ? "architecture"
            : "darshan";

        newEntries.push({
          id: `gdrive-batch-${fileCounter}`,
          src: `/images/gallery/${outFileName}`,
          alt: `Śrī Śrī Rādhā Mādhav Darṣana ${newEntries.length + 1}`,
          title: `Śrī Śrī Rādhā Mādhav Darṣana #${newEntries.length + 13}`,
          titleHi: `श्री श्री राधा माधव दिव्य दर्शन #${newEntries.length + 13}`,
          caption: "Blissful transcendental darshan at Sree Chaitanya Mahaprabhu Sree Radha Madhav Mandir.",
          captionHi: "श्री चैतन्य महाप्रभु श्री राधा माधव मंदिर का परम पावन दर्शन।",
          category: category,
          date: "Divine Darshan",
          tags: ["darshan", "radha-madhav", "gdrive", category],
          palette: "maroon",
        });

        console.log(`Converted & deleted original: ${f} -> ${outFileName}`);
      } catch (err) {
        console.error(`Error processing ${f}:`, err);
      }
    }
  }

  if (newEntries.length > 0) {
    console.log(`Updating ${dataPath} with ${newEntries.length} new catalog entries...`);

    let code = fs.readFileSync(dataPath, "utf-8");
    const insertPos = code.lastIndexOf("];");

    if (insertPos !== -1) {
      const entriesString = newEntries
        .map(
          (e) => `  {
    id: "${e.id}",
    src: "${e.src}",
    alt: "${e.alt}",
    title: "${e.title}",
    titleHi: "${e.titleHi}",
    caption: "${e.caption}",
    captionHi: "${e.captionHi}",
    category: "${e.category}",
    date: "${e.date}",
    tags: ${JSON.stringify(e.tags)},
    palette: "${e.palette}",
  },`
        )
        .join("\n");

      const updatedCode = code.slice(0, insertPos) + entriesString + "\n" + code.slice(insertPos);
      fs.writeFileSync(dataPath, updatedCode, "utf-8");
      console.log("Successfully appended new entries to gallery-data.ts!");
    }
  }
}

processBatch().catch((err) => console.error("Batch processing error:", err));
