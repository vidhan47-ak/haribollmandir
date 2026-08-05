import os
import gdown

folders = [
    ("f01", "https://drive.google.com/drive/folders/1SQM-EiiN8BLEhb55VL7oGp8-opxxLgVB"),
    ("f02", "https://drive.google.com/drive/folders/1u36LtVcqobYNB7-gRFEkqfgrdy0v4YT9"),
    ("f03", "https://drive.google.com/drive/folders/1PdVGLFL5vC4GXyM-bBNEtbabNSuE4eK4"),
    ("f04", "https://drive.google.com/drive/folders/1guhMg-UOJlvu-RwDh0uo5kawObkx2LC5"),
    ("f05", "https://drive.google.com/drive/folders/1wQAkxPW9q4dcP-_8fFnXRLi5kLkn5A_T"),
    ("f06", "https://drive.google.com/drive/folders/1635DEXXASeuqxHIrxQUOHS9hgE_wPt6H"),
    ("f07", "https://drive.google.com/drive/folders/1pWP3WTAg5RECZgAHs4Gxc0ISWk_UYo7d"),
    ("f08", "https://drive.google.com/drive/folders/1OIwY30EDAM3R1S185GK4XnrOHRV4Q9Ed"),
]

base_dir = r"D:\haribolll\_gdrive_more"
os.makedirs(base_dir, exist_ok=True)

print("Listing file IDs from folders 1 through 8...")

for name, url in folders:
    target = os.path.join(base_dir, name)
    os.makedirs(target, exist_ok=True)
    print(f"\n---> Fetching {name}: {url}")
    try:
        gdown.download_folder(url, output=target, quiet=False)
    except Exception as e:
        print(f"Info for {name}: {e}")

print("Listing completed.")
