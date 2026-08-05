import os
import subprocess
import sys

# Install gdown if needed
try:
    import gdown
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "gdown"])
    import gdown

folder_url = "https://drive.google.com/drive/folders/1J_eNLVimSrmkKjO9XppCvtwBiPZfWjAI"
out_dir = r"D:\haribolll\_gdrive_specific"
os.makedirs(out_dir, exist_ok=True)

print(f"Downloading photos from Google Drive folder: {folder_url}")

try:
    gdown.download_folder(url=folder_url, output=out_dir, quiet=False)
except Exception as e:
    print(f"Extraction note: {e}")

print("Download finished!")
