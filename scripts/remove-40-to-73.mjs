import fs from "fs";
import path from "path";

const dataPath = "D:/haribolll/lib/gallery-data.ts";

async function removePhotos40to73() {
  const code = fs.readFileSync(dataPath, "utf-8");

  // Parse items using regex matching
  const itemRegex = /{\s*id:\s*"([^"]+)",\s*src:\s*"([^"]+)",\s*alt:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*palette:\s*"([^"]+)",?\s*}/g;

  let matches = [];
  let match;
  while ((match = itemRegex.exec(code)) !== null) {
    matches.push({
      id: match[1],
      src: match[2],
      alt: match[3],
      category: match[4],
      palette: match[5],
    });
  }

  console.log(`Current total items matched: ${matches.length}`);

  if (matches.length < 73) {
    console.log("Fewer than 73 items found. Cleaning up all items after index 39.");
  }

  const removedItems = matches.slice(39, 73);
  const remainingItems = matches.filter((_, idx) => idx < 39 || idx >= 73);

  console.log(`Removing ${removedItems.length} items (photos 40 to 73)...`);
  console.log(`Remaining items in Gallery: ${remainingItems.length}`);

  // Delete removed webp files from public/images/gallery
  for (const item of removedItems) {
    if (item.src.startsWith("/images/gallery/")) {
      const filePath = path.join("D:/haribolll/public", item.src);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (e) {}
      }
    }
  }

  // Rebuild gallery-data.ts
  const newCode = `export type GalleryCategory = "all" | "darshan" | "festivals" | "architecture" | "heritage" | "sankirtan";

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

export const GALLERY_ITEMS: GalleryItem[] = ${JSON.stringify(remainingItems, null, 2)};
`;

  fs.writeFileSync(dataPath, newCode, "utf-8");
  console.log(`Successfully updated gallery-data.ts! Remaining items: ${remainingItems.length}`);
}

removePhotos40to73().catch((err) => console.error("Error removing photos 40 to 73:", err));
