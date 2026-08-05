import os
import requests

file_ids = [
    "19ZuEv2CD_iBHpIu6qb9b1LOUhwsihR8A",
    "1xahN8ZPEqNzUPO7vAYianyDyjcFy1H4P",
    "1zY7lAuH3AF5i6vKUfK7vT4mUKci8Xdat",
    "19rjP9uDo0Q5lk2togh_9DW2HmwIO7sym",
    "1IgKBtQqPur116CQN88bb4TQB9MgGaT_-",
    "1Q2t6dWsT8Z4c17BFT9cq7xSZqh0pa7GL",
    "1tIfu6CPpcudstoieF1hOCI7Yig2DuwFS",
    "1WV365TibYmf2stUfsufeqXAALzmMpjyq",
    "1n3ycauIqHkDpXTWm3dcrQZhqDpiJMVoq",
    "1YYcbqBNhi14374qRn1pcXdKUNoHH9g4n",
    "1m7jPigLuYca14D3SCK84cOL61US7JPZd",
    "1qDqF_YixQvY8BU_L21XKmWw-XPloYzbz",
    "1fw9rEHcBRudB7oQmbbmhgpBWk23rzG74",
    "1aywt5oIdsMNtP68QEdu0Z5Umx7wQ7hTg",
    "1txI1lh-svWTBC7FhRV5oOnf9gggwp2Vm",
    "1EZroDWV1xWjOryoar4aWlOp60eHvxKud",
    "185EyZDg5hnS6KnnWnGeJhgw5eSAdcfep",
    "1np7yO70CRUiQ3fyldzc6Y_SBOcxO6pk1",
    "11T4TpoD3dI-t2RMU5jxEqe6Cunvd6DXR",
    "1u15upxQLsUGLF191jDhGsTZbCnu8uyaC",
]

out_dir = r"D:\haribolll\_gdrive_new_folder"
os.makedirs(out_dir, exist_ok=True)

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

session = requests.Session()

print(f"Downloading {len(file_ids)} photos directly from Google Drive folder 1J_eNLVimSrmkKjO9XppCvtwBiPZfWjAI...")

success_count = 0
for idx, fid in enumerate(file_ids, 1):
    url = f"https://drive.google.com/uc?export=download&id={fid}"
    out_file = os.path.join(out_dir, f"new_gdrive_photo_{idx:02d}.jpg")
    try:
        res = session.get(url, headers=headers, stream=True)
        if res.status_code == 200 and len(res.content) > 5000:
            with open(out_file, "wb") as f:
                f.write(res.content)
            print(f"[{idx}/{len(file_ids)}] Successfully downloaded {out_file} ({len(res.content)} bytes)")
            success_count += 1
        else:
            print(f"[{idx}/{len(file_ids)}] Failed download for {fid} (status: {res.status_code}, length: {len(res.content)})")
    except Exception as e:
        print(f"[{idx}/{len(file_ids)}] Error downloading {fid}: {e}")

print(f"\nDone! Downloaded {success_count} new photos.")
