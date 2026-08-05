import os
import gdown

folders = [
    "https://drive.google.com/drive/folders/1SQM-EiiN8BLEhb55VL7oGp8-opxxLgVB",
    "https://drive.google.com/drive/folders/1u36LtVcqobYNB7-gRFEkqfgrdy0v4YT9",
    "https://drive.google.com/drive/folders/1PdVGLFL5vC4GXyM-bBNEtbabNSuE4eK4",
    "https://drive.google.com/drive/folders/1guhMg-UOJlvu-RwDh0uo5kawObkx2LC5",
    "https://drive.google.com/drive/folders/1wQAkxPW9q4dcP-_8fFnXRLi5kLkn5A_T",
    "https://drive.google.com/drive/folders/1635DEXXASeuqxHIrxQUOHS9hgE_wPt6H",
    "https://drive.google.com/drive/folders/1pWP3WTAg5RECZgAHs4Gxc0ISWk_UYo7d",
    "https://drive.google.com/drive/folders/1OIwY30EDAM3R1S185GK4XnrOHRV4Q9Ed",
    "https://drive.google.com/drive/folders/1J_eNLVimSrmkKjO9XppCvtwBiPZfWjAI",
    "https://drive.google.com/drive/folders/1LQZRtxD-o2PTzZQngrAeouaQKaf42t4K",
]

output_dir = r"D:\haribolll\gdrive_downloads"
os.makedirs(output_dir, exist_ok=True)

print(f"Starting download of {len(folders)} Google Drive folders to {output_dir}...")

for idx, url in enumerate(folders, 1):
    folder_out = os.path.join(output_dir, f"folder_{idx:02d}")
    os.makedirs(folder_out, exist_ok=True)
    print(f"\n--- Downloading Folder {idx}/{len(folders)}: {url} ---")
    try:
        gdown.download_folder(url, output=folder_out, quiet=False, use_cookies=False)
    except Exception as e:
        print(f"Error downloading folder {idx}: {e}")

print("\nAll downloads finished!")
