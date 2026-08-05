import os
import requests

file_ids = [
    "1lIOj6zNdVQLforuSWFm-GjAsrcOr1h12",
    "1zd0CbywvA75L9lSB2v5YJHvrYFcR7pW7",
    "104a6lkX2lNnxBL1Bs5WUeoptVhgbWIlc",
    "1jsFREz0Ickcbyepx1czjrWNLDcO46a7D",
    "1I-m_XJnMFBHWK27O_PfqiZiCKYGF9988",
    "1RDMlnlYoXdeuoO8RdtzEXlKg8k48ZqY7",
    "1rXceysnwmgFYd3UgsAQ0k4X0GQoZrK-i",
    "1UlTCY53BrIjgttUhZrjKZOqdLTFSnT3w",
    "1vXjbV3PZrc4e94PmV3O_d8a4lGSv2Ing",
    "1a52XcAjH-o9nCLSC5pflGq197JeIQ4Dj",
    "1lG2R2_DnNpRDl-yFn3nHK3_RvEKC_K0c",
    "11KIoGWX5GI5G3XDlDffCTOWL-zTW27we",
    "1iM6OtSRafYiJJAlRhscvfV34zzIy6mU9",
    "14azHPYHQnQbM45uQ3_C0btR9OpOWiRZJ",
    "1N6zKPtmJ1IcAM2nxyQhrG_G_iwWkd9eA",
    "1qL1Q3XuMUtRSSLt55t-dtpLqYUDhh8_s",
    "1gEH4SWQZz879xzLcSjSV3tQX2A_A2U1R",
    "1fPXftGlHSO7mEBtX6d9Mpezf7AYpYBvn",
    "10I9AE9pgf0qnw1r5xbz-8v-clTIGPQ_P",
    "1EDiR44G1xrRId-G6nl0cjTXH_gaRZ3e2",
]

out_dir = r"D:\haribolll\_gdrive_upper_files"
os.makedirs(out_dir, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

session = requests.Session()

print(f"Downloading {len(file_ids)} photos directly from upper half of Google Drive folder 1yCcsHWAKThDAapsBLZBo--BPsClC1I2K...")

success_count = 0
for idx, fid in enumerate(file_ids, 1):
    url = f"https://drive.google.com/uc?export=download&id={fid}"
    out_file = os.path.join(out_dir, f"upper_photo_{idx:02d}.jpg")
    try:
        res = session.get(url, headers=headers, stream=True)
        if res.status_code == 200 and len(res.content) > 5000:
            with open(out_file, "wb") as f:
                f.write(res.content)
            print(f"[{idx}/{len(file_ids)}] Downloaded {out_file} ({len(res.content)} bytes)")
            success_count += 1
        else:
            print(f"[{idx}/{len(file_ids)}] Failed {fid} (status: {res.status_code})")
    except Exception as e:
        print(f"[{idx}/{len(file_ids)}] Error {fid}: {e}")

print(f"\nFinished! Downloaded {success_count} upper-half photos.")
