import fs from "fs";
import path from "path";

const galleryDir = "D:/haribolll/public/images/gallery";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

const CATEGORIES = ["darshan", "festivals", "architecture", "sankirtan", "heritage"];
const PALETTES = ["maroon", "gold", "forest", "sky", "cream"];

function filterOutHomepagePhotos() {
  if (!fs.existsSync(galleryDir)) {
    console.log("No gallery directory found.");
    return;
  }

  // Get ALL photos specifically from /images/gallery (which are 100% exclusive GDrive photos, not used on homepage)
  const files = fs.readdirSync(galleryDir).filter((f) => f.endsWith(".webp"));
  console.log(`Found ${files.length} exclusive gallery photos in ${galleryDir}`);

  let exclusiveItems = [];
  let counter = 1;

  for (const f of files) {
    const category = CATEGORIES[counter % CATEGORIES.length];
    const palette = PALETTES[counter % PALETTES.length];

    exclusiveItems.push({
      id: `exphoto-${counter}`,
      src: `/images/gallery/${f}`,
      alt: `Hariboll Mandir Exclusive Photo ${counter}`,
      category: category,
      palette: palette,
    });
    counter++;
  }

  console.log(`Total exclusive non-homepage photos in Gallery: ${exclusiveItems.length}`);

  const fileContent = `export type GalleryCategory = "all" | "darshan" | "festivals" | "architecture" | "heritage" | "sankirtan";

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

export const GALLERY_ITEMS: GalleryItem[] = ${JSON.stringify(exclusiveItems, null, 2)};
`;

  fs.writeFileSync(dataPath, fileContent, "utf-8");
  console.log("Successfully rebuilt gallery-data.ts with ONLY non-homepage photos!");
}

filterOutHomepagePhotos();
