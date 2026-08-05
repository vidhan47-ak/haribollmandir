import os
import gdown

file_ids = [
    ("folder1_img1", "1U6xYL6ZI-SORe4yYNotN49wrk2wLa3Fy"),
    ("folder2_img1", "1QK6HESiiG891EsnxPZxXtNs5vtJZ8ug-"),
    ("folder3_img1", "1Y1HIsn7fgd4qzeRFTKF5tvFLsDCfC_yj"),
    ("folder4_img1", "19muFIa7PPxlFf7TH536vwfJ0LaetloUU"),
    ("folder5_img1", "1gOZuHTrZMvHamPnVgl16tqidIm-gAXhr"),
    ("folder6_img1", "185_x_gY2_HVzNSRtIF-DL54eXNCyaA-J"),
    ("folder7_img1", "10rBbMv6f4knDcnUJgul_XXr56G3FrHF4"),
    ("folder8_img1", "1tOYr37MxgpOcwsEhIidcfeY1S55r-NNv"),
    ("folder9_img1", "1Z-yhwuCa00b65IbGP_sqrCJOsLY9UjGw"),
    ("folder10_img1", "19T0RbT8uZtf16LLRKynMQpSFdptJfzI8"),
]

out_dir = r"D:\haribolll\_gdrive_all_direct"
os.makedirs(out_dir, exist_ok=True)

for name, fid in file_ids:
    url = f"https://drive.google.com/uc?id={fid}"
    out_file = os.path.join(out_dir, f"{name}.jpg")
    try:
        gdown.download(url, out_file, quiet=True)
        print(f"Downloaded {name}")
    except Exception as e:
        print(f"Error {name}: {e}")

print("Done downloading all direct drive files!")
