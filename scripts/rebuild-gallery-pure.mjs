import fs from "fs";
import path from "path";

const galleryDir = "D:/haribolll/public/images/gallery";
const imagesDir = "D:/haribolll/public/images";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

const CATEGORIES = ["darshan", "festivals", "architecture", "sankirtan", "heritage"];
const PALETTES = ["maroon", "gold", "forest", "sky", "cream"];

function buildPureGallery() {
  let allPhotos = [];
  let counter = 1;

  // 1. Collect all WebP photos from public/images/gallery
  if (fs.existsSync(galleryDir)) {
    const galleryFiles = fs.readdirSync(galleryDir).filter((f) => f.endsWith(".webp"));
    for (const f of galleryFiles) {
      const category = CATEGORIES[counter % CATEGORIES.length];
      const palette = PALETTES[counter % PALETTES.length];
      allPhotos.push({
        id: `gphoto-${counter}`,
        src: `/images/gallery/${f}`,
        alt: `Hariboll Mandir Darshan Photo ${counter}`,
        category: category,
        palette: palette,
      });
      counter++;
    }
  }

  // 2. Collect core photos from public/images
  if (fs.existsSync(imagesDir)) {
    const mainFiles = fs
      .readdirSync(imagesDir)
      .filter((f) => f.endsWith(".webp") && !f.includes("-mobile") && !f.includes("bg") && !f.includes("figure") && !f.includes("glass"));

    for (const f of mainFiles) {
      const category = f.includes("festival") || f.includes("janmashtami") || f.includes("rathyatra")
        ? "festivals"
        : f.includes("kirtan") || f.includes("harinam")
        ? "sankirtan"
        : f.includes("heritage") || f.includes("maharaj") || f.includes("prabhupad")
        ? "heritage"
        : f.includes("temple") || f.includes("about")
        ? "architecture"
        : "darshan";

      const palette = PALETTES[counter % PALETTES.length];
      allPhotos.push({
        id: `mphoto-${counter}`,
        src: `/images/${f}`,
        alt: `Hariboll Mandir Photo ${counter}`,
        category: category,
        palette: palette,
      });
      counter++;
    }
  }

  console.log(`Total photos collected for Gallery: ${allPhotos.length}`);

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

export const GALLERY_ITEMS: GalleryItem[] = ${JSON.stringify(allPhotos, null, 2)};
`;

  fs.writeFileSync(dataPath, code, "utf-8");
  console.log("Rebuilt gallery-data.ts with all 70+ photos!");
}

buildPureGallery();
