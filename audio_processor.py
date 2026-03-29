import whisper
from config import WHISPER_MODEL_SIZE, DEVICE


def transcribe(audio_path: str) -> list:
    """
    Transcribe audio using Whisper with word-level timestamps.
    Returns list of segments: [{"text": str, "start": float, "end": float}, ...]
    """
    print(f"Loading Whisper model ({WHISPER_MODEL_SIZE})...")
    try:
        model = whisper.load_model(WHISPER_MODEL_SIZE, device=DEVICE)
    except Exception as e:
        print(f"  Warning: could not load on {DEVICE}, falling back to CPU. Error: {e}")
        model = whisper.load_model(WHISPER_MODEL_SIZE, device="cpu")

    print(f"  Transcribing {audio_path}...")
    try:
        result = model.transcribe(audio_path, word_timestamps=True, verbose=False)
    except Exception as e:
        print(f"  Error during transcription: {e}")
        return []

    segments = []
    for seg in result.get("segments", []):
        segments.append({
            "text": seg["text"].strip(),
            "start": seg["start"],
            "end": seg["end"],
        })

    print(f"  Found {len(segments)} transcript segments")
    return segments
