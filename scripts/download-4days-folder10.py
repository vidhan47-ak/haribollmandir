import os
import requests

day_file_ids = [
    # DAY 1 & DAY 2
    ("day1_01", "1PZPRAK1sHmoMC4Ma6G7orjhV_j5vUaJU"),
    ("day1_02", "1Ud2cO2PdPCAZwx6l9hpsg80oC22JnD5T"),
    ("day1_03", "1J5C0Hn-9gsJ9kDjhYxAWkmatAS7F_zaX"),
    ("day1_04", "1gihrNs0iZ88snZwfcAGJxcHoL7s977k2"),
    ("day1_05", "1LVgODp0iDANONaMg9ZFjMhqG_Q3Gji8k"),
    ("day2_01", "1ccl8YRTzZuqKZLQ-9dahfsycX3WSod_u"),
    ("day2_02", "1jVBfayM3zu_o3hxYG4GxHZbeJnHbX1Hx"),
    ("day2_03", "1yjqRIVN-v7dI1JeNJ4hqw4z24TsMfiSB"),
    ("day2_04", "1vLaHuTx5-tJ6vjEEq3SK3zT4u6lKIH2J"),
    ("day2_05", "16TnV0I1Sy7y8LMe19VYv4EDVrc-AR4Yk"),

    # DAY 3
    ("day3_01", "1zNWov3_AJMzis8mnfmnfjnaaz5VQTi4m"),
    ("day3_02", "1RZLu8EFjeCzrqzcraJ3wUjzCUAcWa2IL"),
    ("day3_03", "1t2Q1BwHpumCsM-ZGqslxTVnMuLBWkoKH"),
    ("day3_04", "180nFTIxPZn4GIl4UhD_cF_j_BYiq3rGB"),
    ("day3_05", "19Ze1Bzz0QMzIhjew70wcp_0W4M0D-r2C"),
    ("day3_06", "1sJXQ9sRQO8MG89ZsiVz0uNcl27VN5gRS"),
    ("day3_07", "1OhnAjsGbYPvtuUnQhzWebecWZikhwhHo"),

    # DAY 4
    ("day4_01", "1b5qmOV999elfSkFHeeUeNqHQF9CdbcCW"),
    ("day4_02", "1y4ujEHh0nvcSXG-1hOZr0pO7LfkW6arN"),
    ("day4_03", "1lLt_Ilr9lelkAv2zxp8m1dOoPKzgxvOz"),
    ("day4_04", "1VXRwuWcB4OqEBm8pDXSsJ8kBDmlFRfFg"),
    ("day4_05", "1uXMl1fEUA4zPJSRpa7d16op0nXtnh0JC"),
    ("day4_06", "108fM3Gfs8Y92eCBZgmf-_5FI8C07Xrcm"),
    ("day4_07", "1F2maLJOESbzUWIpNYknJO334RsWeBuAy"),
    ("day4_08", "1x59XO7Arej9DBrTZIjiZkVsG2nuJfRjt"),
]

out_dir = r"D:\haribolll\_gdrive_4days"
os.makedirs(out_dir, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

session = requests.Session()

print(f"Downloading {len(day_file_ids)} photos across Day 1, Day 2, Day 3, Day 4...")

success = 0
for idx, (name, fid) in enumerate(day_file_ids, 1):
    url = f"https://drive.google.com/uc?export=download&id={fid}"
    out_file = os.path.join(out_dir, f"{name}.jpg")
    try:
        res = session.get(url, headers=headers, stream=True)
        if res.status_code == 200 and len(res.content) > 5000:
            with open(out_file, "wb") as f:
                f.write(res.content)
            print(f"[{idx}/{len(day_file_ids)}] Downloaded {name} ({len(res.content)} bytes)")
            success += 1
        else:
            print(f"[{idx}/{len(day_file_ids)}] Skipped {name} (status: {res.status_code})")
    except Exception as e:
        print(f"[{idx}/{len(day_file_ids)}] Error {name}: {e}")

print(f"\nDone downloading 4-day folder photos: {success} downloaded!")
