import sharp from "sharp";
import fs from "fs";
import path from "path";

const inDir = "D:/haribolll/_gdrive_new_folder";
const outDir = "D:/haribolll/public/images/gallery";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const PALETTES = ["maroon", "gold", "forest", "sky", "cream"];
const CATEGORIES = ["darshan", "festivals", "architecture", "sankirtan", "heritage"];

async function processNewFolder() {
  const files = fs.readdirSync(inDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Found ${files.length} brand new photos from folder 1J_eNLVimSrmkKjO9XppCvtwBiPZfWjAI to process...`);

  let newItems = [];
  let counter = 1;

  for (const f of files) {
    const inPath = path.join(inDir, f);
    const outName = `new-drive-photo-${counter}.webp`;
    const outPath = path.join(outDir, outName);

    try {
      await sharp(inPath)
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outPath);

      // Remove raw file immediately
      try { fs.unlinkSync(inPath); } catch (e) {}

      const palette = PALETTES[counter % PALETTES.length];
      const category = CATEGORIES[counter % CATEGORIES.length];

      newItems.push({
        id: `new-gdrive-photo-${counter}`,
        src: `/images/gallery/${outName}`,
        alt: `Hariboll Mandir Photo ${counter}`,
        category: category,
        palette: palette,
      });

      console.log(`Optimized: ${f} -> ${outName}`);
      counter++;
    } catch (err) {
      console.error(`Error processing ${f}:`, err);
    }
  }

  // Prepend to gallery-data.ts so they appear first!
  if (newItems.length > 0 && fs.existsSync(dataPath)) {
    let code = fs.readFileSync(dataPath, "utf-8");
    const insertPos = code.indexOf("export const GALLERY_ITEMS: GalleryItem[] = [");

    if (insertPos !== -1) {
      const headerEndPos = code.indexOf("[", insertPos) + 1;
      const entriesString = "\n" + newItems
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

      const updatedCode = code.slice(0, headerEndPos) + entriesString + code.slice(headerEndPos);
      fs.writeFileSync(dataPath, updatedCode, "utf-8");
      console.log(`Successfully added ${newItems.length} BRAND NEW photos to the top of gallery-data.ts!`);
    }
  }

  // Clean up directory
  try { fs.rmdirSync(inDir); } catch (e) {}
}

processNewFolder().catch((err) => console.error("Error processing new folder:", err));
