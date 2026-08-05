import sharp from "sharp";
import fs from "fs";
import path from "path";

const batchDir = "D:/haribolll/_gdrive_balanced";
const outDir = "D:/haribolll/public/images/gallery";
const dataPath = "D:/haribolll/lib/gallery-data.ts";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const PALETTES = ["maroon", "gold", "forest", "sky", "cream"];
const CATEGORIES = ["darshan", "festivals", "architecture", "sankirtan", "heritage"];

async function processBalanced() {
  if (!fs.existsSync(batchDir)) {
    console.log("No _gdrive_balanced directory found.");
    return;
  }

  const subfolders = fs.readdirSync(batchDir).sort();
  console.log(`Found ${subfolders.length} GDrive link folders to process.`);

  let newItems = [];
  let counter = 1;

  for (const sub of subfolders) {
    const subPath = path.join(batchDir, sub);
    if (!fs.statSync(subPath).isDirectory()) continue;

    const files = fs
      .readdirSync(subPath)
      .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .slice(0, 5); // Take top 5 photos per folder for colorful diversity

    console.log(`Folder ${sub}: Processing ${files.length} photos...`);

    for (const f of files) {
      const inPath = path.join(subPath, f);
      const outName = `gdrive-photo-${counter}.webp`;
      const outPath = path.join(outDir, outName);

      try {
        await sharp(inPath)
          .resize({ width: 1400, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toFile(outPath);

        // Delete raw JPG immediately
        try { fs.unlinkSync(inPath); } catch (e) {}

        const palette = PALETTES[counter % PALETTES.length];
        const category = CATEGORIES[counter % CATEGORIES.length];

        newItems.push({
          id: `photo-${counter}`,
          src: `/images/gallery/${outName}`,
          alt: `Hariboll Mandir Gallery Photo ${counter}`,
          title: `Temple Gallery Darshan #${counter}`,
          titleHi: `दिव्य दर्शन #${counter}`,
          category: category,
          palette: palette,
        });

        counter++;
        console.log(`Processed: ${f} -> ${outName}`);
      } catch (err) {
        console.error(`Error processing ${f}:`, err);
      }
    }
  }

  // Combine default base images + all new diverse GDrive photos
  const basePhotos = [
    { id: "radha-madhav", src: "/images/radha-madhav.webp", alt: "Sri Sri Radha Madhav Ji", title: "Śrī Śrī Rādhā Mādhav Ji", titleHi: "श्री श्री राधा माधव जी", category: "darshan", palette: "maroon" },
    { id: "mahaprabhu", src: "/images/mahaprabhu.webp", alt: "Sri Chaitanya Mahaprabhu", title: "Śrī Chaitanya Mahāprabhu", titleHi: "श्री चैतन्य महाप्रभु", category: "darshan", palette: "gold" },
    { id: "radha-rani", src: "/images/radha-rani.webp", alt: "Śrīmatī Radharani", title: "Śrīmatī Rādhārāṇī", titleHi: "श्रीमती राधारानी", category: "darshan", palette: "forest" },
    { id: "divinecouple", src: "/images/divinecouple.webp", alt: "Śrī Śrī Rādhā Kṛṣṇa", title: "Śrī Śrī Rādhā Kṛṣṇa", titleHi: "श्री श्री राधा कृष्ण", category: "darshan", palette: "maroon" },
    { id: "janamashtmi", src: "/images/janamashtmi.webp", alt: "Janmashtami Celebrations", title: "Janmāṣṭamī Mahotsava", titleHi: "जन्माष्टमी महोत्सव", category: "festivals", palette: "sky" },
    { id: "rathyatra", src: "/images/rathyatra.webp", alt: "Ratha Yatra", title: "Śrī Ratha Yātrā", titleHi: "श्री रथ यात्रा", category: "festivals", palette: "gold" },
    { id: "mango-festival", src: "/images/mango-festival.webp", alt: "Mango Festival", title: "Mango Festival Seva", titleHi: "आम महोत्सव सेवा", category: "festivals", palette: "gold" },
    { id: "kirtan-seva", src: "/images/kirtan-seva.webp", alt: "Harinam Sankirtan", title: "Harinām Saṅkīrtan", titleHi: "हरिनाम संकीर्तन", category: "sankirtan", palette: "forest" },
    { id: "temple", src: "/images/temple.webp", alt: "Hariboll Mandir Exterior", title: "Hariboll Mandir", titleHi: "हरिबोल मंदिर", category: "architecture", palette: "cream" },
    { id: "tirthmaharaj", src: "/images/tirthmaharaj.webp", alt: "Srila Bhakti Ballabh Tirtha Goswami Maharaj", title: "Śrīla B. B. Tīrtha Mahārāja", titleHi: "श्रील बी. बी. तीर्थ महाराज", category: "heritage", palette: "maroon" },
    { id: "madhavmaharaj", src: "/images/madhavmaharaj.webp", alt: "Srila Bhakti Dayita Madhava Goswami Maharaj", title: "Śrīla B. D. Mādhava Mahārāja", titleHi: "श्रील बी. डी. माधव महाराज", category: "heritage", palette: "gold" },
  ];

  const allItems = [...basePhotos, ...newItems];

  console.log(`Writing ${allItems.length} clean items to ${dataPath}...`);

  const fileContent = `export type GalleryCategory = "all" | "darshan" | "festivals" | "architecture" | "heritage" | "sankirtan";

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  titleHi: string;
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

export const GALLERY_ITEMS: GalleryItem[] = ${JSON.stringify(allItems, null, 2)};
`;

  fs.writeFileSync(dataPath, fileContent, "utf-8");
  console.log("Successfully rebuilt gallery-data.ts with multi-link photos!");
}

processBalanced().catch((err) => console.error("Error:", err));
