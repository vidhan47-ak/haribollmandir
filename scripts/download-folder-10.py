import os
import gdown

url = "https://drive.google.com/drive/folders/1LQZRtxD-o2PTzZQngrAeouaQKaf42t4K"
out_dir = r"D:\haribolll\_gdrive_folder10"
os.makedirs(out_dir, exist_ok=True)

print(f"Downloading photos from Google Drive folder: {url}...")

try:
    gdown.download_folder(url=url, output=out_dir, quiet=False)
except Exception as e:
    print(f"Gdown extraction note: {e}")

print("Folder download finished!")
