import os
import gdown

file_ids = [
    ("gdrive_01", "1e0B03kz2TrjQXP2IZ2zPeDXST9MjnFEQ"),
    ("gdrive_02", "1QK6HESiiG891EsnxPZxXtNs5vtJZ8ug-"),
    ("gdrive_03", "1Y1HIsn7fgd4qzeRFTKF5tvFLsDCfC_yj"),
    ("gdrive_04", "19muFIa7PPxlFf7TH536vwfJ0LaetloUU"),
    ("gdrive_05", "1gOZuHTrZMvHamPnVgl16tqidIm-gAXhr"),
    ("gdrive_06", "185_x_gY2_HVzNSRtIF-DL54eXNCyaA-J"),
    ("gdrive_07", "10rBbMv6f4knDcnUJgul_XXr56G3FrHF4"),
    ("gdrive_08", "1tOYr37MxgpOcwsEhIidcfeY1S55r-NNv"),
    ("gdrive_09", "1Z-yhwuCa00b65IbGP_sqrCJOsLY9UjGw"),
    ("gdrive_10", "19T0RbT8uZtf16LLRKynMQpSFdptJfzI8"),
]

out_dir = r"D:\haribolll\_gdrive_direct"
os.makedirs(out_dir, exist_ok=True)

print("Downloading direct images from all 10 Google Drive folders...")

for name, fid in file_ids:
    url = f"https://drive.google.com/uc?id={fid}"
    out_file = os.path.join(out_dir, f"{name}.jpg")
    print(f"Downloading {name} from {url}...")
    try:
        gdown.download(url, out_file, quiet=False)
    except Exception as e:
        print(f"Error downloading {name}: {e}")

print("All direct downloads completed!")
