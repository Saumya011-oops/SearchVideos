import os
import argparse
import time

import ingestion
import audio_processor
import frame_processor
import chunker
import embedder
import vector_store


def process_video(video_path: str, video_id: str = None) -> dict:
    """
    Run the full ingestion pipeline on a video file.

    Returns summary dict:
      {
        "video_id": str,
        "chunks_created": int,
        "duration_seconds": float,
        "elapsed_seconds": float,
      }
    """
    if not os.path.isfile(video_path):
        raise FileNotFoundError(f"Video not found: {video_path}")

    if video_id is None:
        video_id = os.path.splitext(os.path.basename(video_path))[0]

    t_start = time.time()
    print(f"\n{'='*60}")
    print(f"Processing video: {video_path}")
    print(f"Video ID        : {video_id}")
    print(f"{'='*60}\n")

    # ── Step 1: Extract audio & frames ────────────────────────────
    print("[Step 1/6] Extracting audio...")
    audio_path = ingestion.extract_audio(video_path)
    print(f"  Done.\n")

    print("[Step 1/6] Extracting frames...")
    frames = ingestion.extract_frames(video_path)
    print(f"  Done.\n")

    # ── Step 2: Transcribe audio ───────────────────────────────────
    print("[Step 2/6] Transcribing audio with Whisper...")
    transcript_segments = audio_processor.transcribe(audio_path)
    print(f"  Done.\n")

    # ── Step 3: Caption frames ─────────────────────────────────────
    print("[Step 3/6] Captioning frames with BLIP...")
    frame_captions = frame_processor.caption_frames(frames)
    print(f"  Done.\n")

    # ── Step 4: Create time-windowed chunks ────────────────────────
    print("[Step 4/6] Creating time-windowed chunks...")
    chunks = chunker.create_chunks(transcript_segments, frame_captions, video_id)
    print(f"  Done.\n")

    # ── Step 5: Embed chunks ───────────────────────────────────────
    print("[Step 5/6] Embedding chunks...")
    embedded_chunks = embedder.embed_chunks(chunks)
    print(f"  Done.\n")

    # ── Step 6: Store in ChromaDB ──────────────────────────────────
    print("[Step 6/6] Storing in ChromaDB...")
    collection = vector_store.init_store()
    n_stored = vector_store.store_chunks(collection, embedded_chunks)
    print(f"  Done.\n")

    elapsed = time.time() - t_start

    # Determine video duration
    duration = 0.0
    if transcript_segments:
        duration = max(duration, transcript_segments[-1]["end"])
    if frame_captions:
        duration = max(duration, frame_captions[-1]["timestamp"])

    print(f"{'='*60}")
    print(f"Pipeline complete in {elapsed:.1f}s")
    print(f"  Video duration : {duration:.1f}s")
    print(f"  Chunks stored  : {n_stored}")
    print(f"  Video ID       : {video_id}")
    print(f"{'='*60}\n")

    return {
        "video_id": video_id,
        "chunks_created": n_stored,
        "duration_seconds": duration,
        "elapsed_seconds": elapsed,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest a video into the search engine")
    parser.add_argument("--video", "-v", required=True, help="Path to video file")
    parser.add_argument("--id", dest="video_id", default=None,
                        help="Custom video ID (default: filename without extension)")
    args = parser.parse_args()

    process_video(args.video, video_id=args.video_id)
