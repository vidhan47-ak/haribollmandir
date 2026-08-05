import os
import requests

file_ids = [
    "1miTR8G3s0L03_Mah0VXY97WpO3f2KEwM",
    "1D9owFm6jR7eKuHh6d-LrJoX4NsagkyXJ",
    "1X0M7YqOjvAXqGQ_mY_QBvlCYdr-FPzz0",
    "13DZj7zH979mlCWjihqMz8S1gC3rjnf9s",
    "1W28vlLaLYGI2EULN5RTpsxyMqghvOSN2",
    "13hihBZTRyqV6jOZBkDU3xK-X0FeeZ6CG",
    "1Q5hvtVThmHjOEqPZo_uQ6np-hq3nLA4o",
    "1jOJbr3FtdxJMzJ45HfdgVwP75OHm7fBg",
    "1IE464vBDU7L1cHMi6uOVPkfmCYUJJ84L",
    "1OV7JrggyT_sNOrlY5ARw8LIK9bKezQzX",
    "1u8wfkrnTndTOiu5mDp2CNo2THbSLYDSE",
    "1U3v4RRqONEcnktFlz8DUUusSVcI5GXTq",
    "1DlFog0pUC7YucCp32r5DEyv4YSm92LkL",
    "1I7_inpL3tSg1YZ0CSOnLpZogdavLERCc",
    "1aFWc3osjhCaa6sXkICiRimIoonNZMVKT",
    "1dcYTDIuOoVp2wwGlhYDnign97HJMT1dU",
    "1qDEGxyP4IlnCcXB4LjQj2jCrd-AXZe_O",
    "1YR-noH9nU4_hGQS7w_uFUFdkKKWbofQo",
    "1nDdvQpIlLwypIOvPibmIwW1-k5q0uHKE",
    "10IfPVlfqbyNzEBwadqfnT83H26JzpRGm",
]

out_dir = r"D:\haribolll\_gdrive_folder10_files"
os.makedirs(out_dir, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

session = requests.Session()

print(f"Downloading {len(file_ids)} photos directly from Google Drive folder 1LQZRtxD-o2PTzZQngrAeouaQKaf42t4K...")

success_count = 0
for idx, fid in enumerate(file_ids, 1):
    url = f"https://drive.google.com/uc?export=download&id={fid}"
    out_file = os.path.join(out_dir, f"f10_photo_{idx:02d}.jpg")
    try:
        res = session.get(url, headers=headers, stream=True)
        if res.status_code == 200 and len(res.content) > 5000:
            with open(out_file, "wb") as f:
                f.write(res.content)
            print(f"[{idx}/{len(file_ids)}] Successfully downloaded {out_file} ({len(res.content)} bytes)")
            success_count += 1
        else:
            print(f"[{idx}/{len(file_ids)}] Failed download for {fid} (status: {res.status_code})")
    except Exception as e:
        print(f"[{idx}/{len(file_ids)}] Error downloading {fid}: {e}")

print(f"\nFinished! Successfully downloaded {success_count} photos from folder 10.")
