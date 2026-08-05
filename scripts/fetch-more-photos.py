import os
import gdown

folders = [
    ("folder_01", "https://drive.google.com/drive/folders/1SQM-EiiN8BLEhb55VL7oGp8-opxxLgVB"),
    ("folder_02", "https://drive.google.com/drive/folders/1u36LtVcqobYNB7-gRFEkqfgrdy0v4YT9"),
    ("folder_03", "https://drive.google.com/drive/folders/1PdVGLFL5vC4GXyM-bBNEtbabNSuE4eK4"),
    ("folder_04", "https://drive.google.com/drive/folders/1guhMg-UOJlvu-RwDh0uo5kawObkx2LC5"),
    ("folder_05", "https://drive.google.com/drive/folders/1wQAkxPW9q4dcP-_8fFnXRLi5kLkn5A_T"),
    ("folder_06", "https://drive.google.com/drive/folders/1OIwY30EDAM3R1S185GK4XnrOHRV4Q9Ed"),
    ("folder_07", "https://drive.google.com/drive/folders/1pWP3WTAg5RECZgAHs4Gxc0ISWk_UYo7d"),
    ("folder_08", "https://drive.google.com/drive/folders/1J_eNLVimSrmkKjO9XppCvtwBiPZfWjAI"),
    ("folder_09", "https://drive.google.com/drive/folders/1LQZRtxD-o2PTzZQngrAeouaQKaf42t4K"),
]

base_dir = r"D:\haribolll\_gdrive_batch"
os.makedirs(base_dir, exist_ok=True)

print(f"Fetching photos from {len(folders)} Google Drive folders into {base_dir}...")

for name, url in folders:
    target_path = os.path.join(base_dir, name)
    os.makedirs(target_path, exist_ok=True)
    print(f"\n---> Downloading: {name} ({url})")
    try:
        # Download folder contents
        gdown.download_folder(url, output=target_path, quiet=False, use_cookies=False)
    except Exception as e:
        print(f"Notice for {name}: {e}")

print("\nBatch download finished!")
