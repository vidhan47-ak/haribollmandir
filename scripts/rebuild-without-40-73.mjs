import fs from "fs";
import path from "path";

const galleryDir = "D:/haribolll/public/images/gallery";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

const PALETTES = ["maroon", "gold", "forest", "sky", "cream"];
const CATEGORIES = ["darshan", "festivals", "architecture", "sankirtan", "heritage"];

function rebuildWithout40To73() {
  if (!fs.existsSync(galleryDir)) {
    console.log("No gallery directory found.");
    return;
  }

  const allFiles = fs.readdirSync(galleryDir).filter((f) => f.endsWith(".webp"));
  console.log(`Total available webp files in gallery: ${allFiles.length}`);

  // Sort files predictably
  allFiles.sort();

  // Exclude photos from index 40 to 73 (1-indexed: 40th to 73rd photo inclusive)
  const remainingFiles = allFiles.filter((_, idx) => idx < 39 || idx >= 73);

  console.log(`Excluding 34 photos (indices 40 to 73). Remaining files: ${remainingFiles.length}`);

  // Also delete the excluded files from disk so space is freed up
  const excludedFiles = allFiles.filter((_, idx) => idx >= 39 && idx < 73);
  for (const f of excludedFiles) {
    const fPath = path.join(galleryDir, f);
    try {
      fs.unlinkSync(fPath);
      console.log(`Deleted excluded photo: ${f}`);
    } catch (e) {}
  }

  let items = [];
  let counter = 1;

  for (const f of remainingFiles) {
    const category = CATEGORIES[counter % CATEGORIES.length];
    const palette = PALETTES[counter % PALETTES.length];

    items.push({
      id: `gallery-photo-${counter}`,
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
  console.log(`Successfully updated gallery-data.ts! Remaining photo count: ${items.length}`);
}

rebuildWithout40To73();
