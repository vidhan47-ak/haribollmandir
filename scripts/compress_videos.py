import os
import subprocess
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print(f"FFmpeg binary: {ffmpeg_exe}")

target_dirs = [
    r"d:\haribolll\public\video",
    r"d:\haribolll\public\videos"
]

for d in target_dirs:
    if not os.path.exists(d):
        continue
    for fname in os.listdir(d):
        if not fname.endswith(".mp4"):
            continue
        filepath = os.path.join(d, fname)
        size_mb = os.path.getsize(filepath) / (1024 * 1024)
        print(f"\nProcessing {filepath} (Current size: {size_mb:.2f} MB)")
        
        # Output compressed path
        outpath = os.path.join(d, f"compressed_{fname}")
        
        cmd = [
            ffmpeg_exe,
            "-y",
            "-i", filepath,
            "-vcodec", "libx264",
            "-crf", "25",
            "-preset", "medium",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-an",
            outpath
        ]
        
        try:
            subprocess.run(cmd, check=True)
            new_size_mb = os.path.getsize(outpath) / (1024 * 1024)
            savings = (1 - new_size_mb / size_mb) * 100
            print(f"Compressed {fname}: {size_mb:.2f} MB -> {new_size_mb:.2f} MB ({savings:.1f}% reduction)")
            
            if new_size_mb < size_mb:
                os.replace(outpath, filepath)
                print(f"Successfully replaced {fname} with compressed version.")
            else:
                os.remove(outpath)
        except Exception as err:
            print(f"Failed to compress {fname}: {err}")
            if os.path.exists(outpath):
                os.remove(outpath)

print("\nVideo compression complete!")
