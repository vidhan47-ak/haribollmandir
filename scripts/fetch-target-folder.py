import os
import gdown

url = "https://drive.google.com/drive/folders/1J_eNLVimSrmkKjO9XppCvtwBiPZfWjAI"
out_dir = r"D:\haribolll\_gdrive_target"
os.makedirs(out_dir, exist_ok=True)

print(f"Fetching photos from target Google Drive folder: {url}...")

try:
    gdown.download_folder(url, output=out_dir, quiet=False, use_cookies=False)
except Exception as e:
    print(f"Gdown download info: {e}")

print("Folder download complete!")
