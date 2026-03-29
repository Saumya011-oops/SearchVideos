import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import settings
import torch

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
AUDIO_DIR = os.path.join(OUTPUT_DIR, "audio")
FRAMES_DIR = os.path.join(OUTPUT_DIR, "frames")

_chroma_raw = str(settings.CHROMA_PERSIST_DIR)
if os.path.isabs(_chroma_raw):
    CHROMA_DIR = _chroma_raw
else:
    # Resolve relative path from the backend directory
    CHROMA_DIR = os.path.normpath(os.path.join(BASE_DIR, _chroma_raw))

FRAME_SAMPLE_RATE = 1 / settings.FRAME_INTERVAL_SECONDS
CHUNK_WINDOW_SECONDS = settings.CHUNK_WINDOW_SECONDS
WHISPER_MODEL_SIZE = settings.WHISPER_MODEL
EMBEDDING_MODEL = settings.EMBEDDING_MODEL
BLIP_MODEL = "Salesforce/blip-image-captioning-base"
CLIP_MODEL = "openai/clip-vit-base-patch32"
CHROMA_COLLECTION_NAME = "video_chunks"
DEFAULT_N_RESULTS = 5
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(CHROMA_DIR, exist_ok=True)
