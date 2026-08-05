import sharp from "sharp";
import fs from "fs";
import path from "path";

const inDir = "D:/haribolll/_gdrive_new_link";
const outDir = "D:/haribolll/public/images/gallery";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const PALETTES = ["maroon", "gold", "forest", "sky", "cream"];
const CATEGORIES = ["darshan", "festivals", "architecture", "sankirtan", "heritage"];

async function processNewLinkPhotos() {
  if (!fs.existsSync(inDir)) {
    console.log("No _gdrive_new_link folder found.");
    return;
  }

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
  console.log(`Found ${allFiles.length} photos in new link directory.`);

  let counter = 1;
  let newItems = [];

  for (const fPath of allFiles) {
    const outName = `newlink-photo-${counter}.webp`;
    const outPath = path.join(outDir, outName);

    try {
      await sharp(fPath)
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(outPath);

      // Remove raw file
      try { fs.unlinkSync(fPath); } catch (e) {}

      const palette = PALETTES[counter % PALETTES.length];
      const category = CATEGORIES[counter % CATEGORIES.length];

      newItems.push({
        id: `nlphoto-${counter}`,
        src: `/images/gallery/${outName}`,
        alt: `Hariboll Mandir Photo ${counter}`,
        category: category,
        palette: palette,
      });

      console.log(`Converted: ${path.basename(fPath)} -> ${outName}`);
      counter++;
    } catch (err) {
      console.error(`Error processing ${fPath}:`, err);
    }
  }

  // Rebuild gallery-data.ts with all exclusive WebP photos in /images/gallery/
  const allWebp = fs.readdirSync(outDir).filter((f) => f.endsWith(".webp"));
  console.log(`Total exclusive gallery webp photos: ${allWebp.length}`);

  let items = [];
  let idx = 1;
  for (const f of allWebp) {
    const category = CATEGORIES[idx % CATEGORIES.length];
    const palette = PALETTES[idx % PALETTES.length];

    items.push({
      id: `gallery-photo-${idx}`,
      src: `/images/gallery/${f}`,
      alt: `Hariboll Mandir Photo ${idx}`,
      category: category,
      palette: palette,
    });
    idx++;
  }

  const code = `export type GalleryCategory = "all" | "darshan" | "festivals" | "architecture" | "heritage" | "sankirtan";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  palette: "maroon" | "gold" | "forest" | "sky" | "cream";
}

export const GALLERY_CATEGORIES: {
  key: GalleryCategory;
  label: string;
  labelHi: string;
  icon: string;
}[] = [
  { key: "all", label: "All Photos", labelHi: "सभी चित्र", icon: "✨" },
  { key: "darshan", label: "Divine Darshan", labelHi: "दिव्य दर्शन", icon: "🌸" },
  { key: "festivals", label: "Festivals & Utsav", labelHi: "उत्सव एवं त्यौहार", icon: "🪔" },
  { key: "architecture", label: "Temple Architecture", labelHi: "मंदिर स्थापत्य", icon: "🏛️" },
  { key: "heritage", label: "Heritage & Ācāryas", labelHi: "आचार्य एवं परंपरा", icon: "📜" },
  { key: "sankirtan", label: "Harinām Saṅkīrtan", labelHi: "हरिनाम संकीर्तन", icon: "🎵" },
];

export const GALLERY_ITEMS: GalleryItem[] = ${JSON.stringify(items, null, 2)};
`;

  fs.writeFileSync(dataPath, code, "utf-8");
  console.log(`Successfully updated gallery-data.ts with all ${items.length} photos!`);
}

processNewLinkPhotos().catch((err) => console.error("Error processing new link photos:", err));
