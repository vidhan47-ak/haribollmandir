import os
import gdown

url = "https://drive.google.com/drive/folders/1ib_eDGWnI4SMTv2eszL6gTOzrtXWPEaJ"
out_dir = r"D:\haribolll\_gdrive_new_link"
os.makedirs(out_dir, exist_ok=True)

print(f"Downloading photos from Google Drive link: {url}...")

try:
    gdown.download_folder(url=url, output=out_dir, quiet=False)
except Exception as e:
    print(f"Gdown info: {e}")

print("Finished downloading new folder link!")
