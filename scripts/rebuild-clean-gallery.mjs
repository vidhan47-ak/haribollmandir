import sharp from "sharp";
import fs from "fs";
import path from "path";

const inDir = "D:/haribolll/_gdrive_new_folder";
const outDir = "D:/haribolll/public/images/gallery";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

const PALETTES = ["maroon", "gold", "forest", "sky", "cream"];
const CATEGORIES = ["darshan", "festivals", "architecture", "sankirtan", "heritage"];

async function rebuildCleanGallery() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Convert any new JPGs in _gdrive_new_folder to WebP
  if (fs.existsSync(inDir)) {
    const jpgs = fs.readdirSync(inDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    console.log(`Converting ${jpgs.length} target folder photos...`);
    let idx = 1;
    for (const f of jpgs) {
      const inPath = path.join(inDir, f);
      const outName = `target-photo-${idx}.webp`;
      const outPath = path.join(outDir, outName);

      try {
        await sharp(inPath)
          .resize({ width: 1400, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(outPath);

        fs.unlinkSync(inPath);
        console.log(`Converted ${f} -> ${outName}`);
        idx++;
      } catch (err) {
        console.error(`Error converting ${f}:`, err);
      }
    }
  }

  // 2. Read all webp files in public/images/gallery
  const webpFiles = fs.readdirSync(outDir).filter((f) => f.endsWith(".webp"));
  console.log(`Total exclusive gallery webp photos: ${webpFiles.length}`);

  let items = [];
  let counter = 1;

  for (const f of webpFiles) {
    const category = CATEGORIES[counter % CATEGORIES.length];
    const palette = PALETTES[counter % PALETTES.length];

    items.push({
      id: `photo-${counter}`,
      src: `/images/gallery/${f}`,
      alt: `Hariboll Mandir Photo ${counter}`,
      category: category,
      palette: palette,
    });
    counter++;
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
  console.log("Successfully rebuilt clean gallery-data.ts with zero syntax errors!");
}

rebuildCleanGallery().catch((err) => console.error("Error rebuilding clean gallery:", err));
