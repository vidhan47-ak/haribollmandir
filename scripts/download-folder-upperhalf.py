import os
import gdown

url = "https://drive.google.com/drive/folders/1yCcsHWAKThDAapsBLZBo--BPsClC1I2K"
out_dir = r"D:\haribolll\_gdrive_upperhalf"
os.makedirs(out_dir, exist_ok=True)

print(f"Downloading photos from Google Drive link (preferring upper half): {url}...")

try:
    gdown.download_folder(url=url, output=out_dir, quiet=False)
except Exception as e:
    print(f"Gdown note: {e}")

print("Download finished!")
