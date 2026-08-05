import sharp from "sharp";
import fs from "fs";
import path from "path";

const inDir = "D:/haribolll/_gdrive_direct";
const outDir = "D:/haribolll/public/images/gallery";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const PALETTES = ["maroon", "gold", "forest", "sky", "cream"];
const CATEGORIES = ["darshan", "festivals", "architecture", "sankirtan", "heritage"];

async function processDirect() {
  if (!fs.existsSync(inDir)) {
    console.log("No _gdrive_direct directory found.");
    return;
  }

  const files = fs.readdirSync(inDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Found ${files.length} direct images to process...`);

  let newItems = [];
  let counter = 100;

  for (const f of files) {
    counter++;
    const inPath = path.join(inDir, f);
    const outName = `gdrive-photo-multi-${counter}.webp`;
    const outPath = path.join(outDir, outName);

    try {
      await sharp(inPath)
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outPath);

      try { fs.unlinkSync(inPath); } catch (e) {}

      const palette = PALETTES[counter % PALETTES.length];
      const category = CATEGORIES[counter % CATEGORIES.length];

      newItems.push({
        id: `photo-multi-${counter}`,
        src: `/images/gallery/${outName}`,
        alt: `Hariboll Mandir Photo ${counter}`,
        category: category,
        palette: palette,
      });

      console.log(`Processed: ${f} -> ${outName}`);
    } catch (err) {
      console.error(`Error processing ${f}:`, err);
    }
  }

  // Load existing gallery data and append new items cleanly
  if (fs.existsSync(dataPath)) {
    let code = fs.readFileSync(dataPath, "utf-8");
    const insertPos = code.lastIndexOf("];");

    if (insertPos !== -1 && newItems.length > 0) {
      const entriesString = newItems
        .map(
          (e) => `  {
    id: "${e.id}",
    src: "${e.src}",
    alt: "${e.alt}",
    category: "${e.category}",
    palette: "${e.palette}",
  },`
        )
        .join("\n");

      const updatedCode = code.slice(0, insertPos) + entriesString + "\n" + code.slice(insertPos);
      fs.writeFileSync(dataPath, updatedCode, "utf-8");
      console.log(`Appended ${newItems.length} photos to gallery-data.ts!`);
    }
  }
}

processDirect().catch((err) => console.error("Error processing direct photos:", err));
