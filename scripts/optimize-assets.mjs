import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const imagesDir = path.resolve("public/images");

const targets = [
  { file: "janamashtmi.webp", width: 1600, quality: 75 },
  { file: "tirthmaharaj.webp", width: 1400, quality: 75 },
  { file: "madhavmaharaj.webp", width: 1400, quality: 75 },
  { file: "hero-morning-mobile.webp", width: 1080, quality: 75 },
  { file: "hero-morning.webp", width: 1920, quality: 75 },
  { file: "hero-night-mobile.webp", width: 1080, quality: 75 },
  { file: "hero-night.webp", width: 1920, quality: 75 },
  { file: "bhakti.webp", width: 1400, quality: 75 },
  { file: "Hariboll.png", width: 1200, quality: 80, png: true },
];

async function run() {
  console.log("Starting image asset optimization...");

  for (const item of targets) {
    const inputPath = path.join(imagesDir, item.file);
    if (!fs.existsSync(inputPath)) continue;

    const statsBefore = fs.statSync(inputPath);
    const tempPath = path.join(imagesDir, `_opt_${item.file}`);

    if (item.png) {
      await sharp(inputPath)
        .resize({ width: item.width, fit: "inside", withoutEnlargement: true })
        .png({ quality: item.quality, compressionLevel: 9 })
        .toFile(tempPath);
    } else {
      await sharp(inputPath)
        .resize({ width: item.width, fit: "inside", withoutEnlargement: true })
        .webp({ quality: item.quality, effort: 6 })
        .toFile(tempPath);
    }

    const statsAfter = fs.statSync(tempPath);
    fs.renameSync(tempPath, inputPath);

    console.log(
      `Optimized ${item.file}: ${(statsBefore.size / 1024 / 1024).toFixed(2)} MB -> ${(statsAfter.size / 1024).toFixed(0)} KB`,
    );
  }

  console.log("Image optimization complete!");
}

run().catch(console.error);
