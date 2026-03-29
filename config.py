import os

# Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
AUDIO_DIR = os.path.join(OUTPUT_DIR, "audio")
FRAMES_DIR = os.path.join(OUTPUT_DIR, "frames")
CHROMA_DIR = os.path.join(BASE_DIR, "chroma_data")

# Frame extraction
FRAME_SAMPLE_RATE = 1 / 3  # 1 frame every 3 seconds

# Chunking
CHUNK_WINDOW_SECONDS = 15

# Models
WHISPER_MODEL_SIZE = "base"  # options: tiny, base, small, medium, large
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
BLIP_MODEL = "Salesforce/blip-image-captioning-base"
CLIP_MODEL = "openai/clip-vit-base-patch32"

# ChromaDB
CHROMA_COLLECTION_NAME = "video_chunks"

# Search
DEFAULT_N_RESULTS = 5

# Device (auto-detect)
import torch
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Create output directories on import
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(FRAMES_DIR, exist_ok=True)
os.makedirs(CHROMA_DIR, exist_ok=True)
