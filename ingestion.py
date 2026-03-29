import os
import subprocess
import cv2
from PIL import Image
import numpy as np
from config import AUDIO_DIR, FRAMES_DIR, FRAME_SAMPLE_RATE


def extract_audio(video_path: str) -> str:
    """Extract audio from video as WAV file. Returns path to audio file."""
    video_name = os.path.splitext(os.path.basename(video_path))[0]
    audio_path = os.path.join(AUDIO_DIR, f"{video_name}.wav")

    print(f"Extracting audio from {video_path}...")

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",                  # no video
        "-acodec", "pcm_s16le", # PCM 16-bit WAV
        "-ar", "16000",         # 16kHz sample rate (Whisper prefers this)
        "-ac", "1",             # mono
        audio_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg audio extraction failed:\n{result.stderr}")

    print(f"  Audio saved to {audio_path}")
    return audio_path


def extract_frames(video_path: str, fps: float = FRAME_SAMPLE_RATE) -> list:
    """
    Sample frames from video at the given rate.
    Returns list of (PIL.Image, timestamp_seconds).
    """
    print(f"Extracting frames at {fps:.4f} fps (1 frame every {1/fps:.1f}s)...")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Cannot open video file: {video_path}")

    video_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / video_fps if video_fps > 0 else 0

    print(f"  Video: {duration:.1f}s duration, {video_fps:.2f} fps, {total_frames} total frames")

    frames_with_timestamps = []
    interval_seconds = 1.0 / fps
    next_capture_time = 0.0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0

        if current_time >= next_capture_time:
            # Convert BGR (OpenCV) to RGB (PIL)
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            frames_with_timestamps.append((pil_image, current_time))
            next_capture_time += interval_seconds

    cap.release()
    print(f"  Extracted {len(frames_with_timestamps)} frames")
    return frames_with_timestamps
