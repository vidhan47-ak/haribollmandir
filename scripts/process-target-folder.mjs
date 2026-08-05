import sharp from "sharp";
import fs from "fs";
import path from "path";

const inDir = "D:/haribolll/_gdrive_specific";
const outDir = "D:/haribolll/public/images/gallery";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const PALETTES = ["maroon", "gold", "forest", "sky", "cream"];
const CATEGORIES = ["darshan", "festivals", "architecture", "sankirtan", "heritage"];

async function processTargetFolder() {
  if (!fs.existsSync(inDir)) {
    console.log("No _gdrive_target folder found.");
    return;
  }

  // Recursive search for files
  function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(fullPath));
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const allFiles = getFiles(inDir);
  console.log(`Found ${allFiles.length} photos in target GDrive folder.`);

  let newItems = [];
  let counter = Date.now();

  for (const fPath of allFiles) {
    counter++;
    const outName = `target-photo-${counter}.webp`;
    const outPath = path.join(outDir, outName);

    try {
      await sharp(fPath)
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outPath);

      // Delete raw JPG
      try { fs.unlinkSync(fPath); } catch (e) {}

      const palette = PALETTES[counter % PALETTES.length];
      const category = CATEGORIES[counter % CATEGORIES.length];

      newItems.push({
        id: `tphoto-${counter}`,
        src: `/images/gallery/${outName}`,
        alt: `Hariboll Mandir Photo ${counter}`,
        category: category,
        palette: palette,
      });

      console.log(`Optimized: ${path.basename(fPath)} -> ${outName}`);
    } catch (err) {
      console.error(`Error processing ${fPath}:`, err);
    }
  }

  if (newItems.length > 0 && fs.existsSync(dataPath)) {
    let code = fs.readFileSync(dataPath, "utf-8");
    const insertPos = code.lastIndexOf("];");

    if (insertPos !== -1) {
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
      console.log(`Successfully appended ${newItems.length} photos to gallery-data.ts!`);
    }
  }
}

processTargetFolder().catch((err) => console.error("Error processing target folder:", err));
