import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputDir = "D:/haribolll/gdrive_downloads/folder_01";
const outputDir = "D:/haribolll/public/images/gallery";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function processPhotos() {
  const files = fs.readdirSync(inputDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  console.log(`Found ${files.length} downloaded photos to optimize...`);

  let count = 0;
  for (const file of files) {
    count++;
    const inPath = path.join(inputDir, file);
    const outName = `darshan-gdrive-${count}.webp`;
    const outPath = path.join(outputDir, outName);

    console.log(`Optimizing ${file} -> ${outName}...`);
    await sharp(inPath)
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);

    const statIn = fs.statSync(inPath);
    const statOut = fs.statSync(outPath);
    console.log(
      `Done! ${(statIn.size / (1024 * 1024)).toFixed(2)} MB -> ${(statOut.size / 1024).toFixed(1)} KB`
    );
  }

  console.log("\nAll photos optimized successfully!");
}

processPhotos().catch((err) => console.error("Error optimizing photos:", err));
