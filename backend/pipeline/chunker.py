import math
from pipeline.config import CHUNK_WINDOW_SECONDS


def create_chunks(
    transcript_segments: list,
    frame_captions: list,
    video_id: str,
    window_seconds: float = CHUNK_WINDOW_SECONDS,
) -> list:
    """
    Merge transcript segments and frame captions into fixed time-window chunks.

    Each chunk:
      {
        "text": "[Speech]: ... [Visual]: ...",
        "start": float,
        "end": float,
        "video_id": str,
        "transcript_only": str,
        "visual_only": str,
      }
    """
    # Determine video duration from the latest timestamp we have
    max_time = 0.0
    if transcript_segments:
        max_time = max(max_time, transcript_segments[-1]["end"])
    if frame_captions:
        max_time = max(max_time, frame_captions[-1]["timestamp"])

    if max_time == 0.0:
        print("  Warning: no transcript or frame data found, cannot create chunks.")
        return []

    num_windows = math.ceil(max_time / window_seconds)
    print(f"  Creating {num_windows} chunks over {max_time:.1f}s "
          f"(window={window_seconds}s)...")

    chunks = []
    for i in range(num_windows):
        start = i * window_seconds
        end = start + window_seconds

        # Gather transcript text for this window
        speech_parts = [
            seg["text"]
            for seg in transcript_segments
            if seg["start"] < end and seg["end"] > start
        ]
        transcript_text = " ".join(speech_parts).strip()

        # Gather frame captions for this window
        visual_parts = [
            cap["caption"]
            for cap in frame_captions
            if start <= cap["timestamp"] < end
        ]
        visual_text = "; ".join(visual_parts).strip()

        # Skip completely empty chunks
        if not transcript_text and not visual_text:
            continue

        combined_text = ""
        if transcript_text:
            combined_text += f"[Speech]: {transcript_text} "
        if visual_text:
            combined_text += f"[Visual]: {visual_text}"
        combined_text = combined_text.strip()

        chunks.append({
            "text": combined_text,
            "start": start,
            "end": min(end, max_time),
            "video_id": video_id,
            "transcript_only": transcript_text,
            "visual_only": visual_text,
        })

    print(f"  Created {len(chunks)} non-empty chunks")
    return chunks
