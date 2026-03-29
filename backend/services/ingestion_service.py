from __future__ import annotations

import sys
import os
import uuid

# __file__ = backend/services/ingestion_service.py
# parent    = backend/services/
# parent²   = backend/
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)


def run_ingestion_pipeline(
    video_id: str,
    video_path: str,
    db_session_factory,
) -> None:
    """
    Run the full ingestion pipeline in a background thread.

    Creates its own database session, updates video status as work
    progresses, and commits chunk records to PostgreSQL alongside
    storing embeddings in ChromaDB.
    """
    db = db_session_factory()

    try:
        from models.database_models import Video, Chunk, VideoStatus

        # ── Mark video as processing ───────────────────────────────
        video_uuid = uuid.UUID(str(video_id))
        video = db.query(Video).filter(Video.id == video_uuid).first()
        if video is None:
            print(f"[ingestion] Video {video_id} not found in DB, aborting.")
            return

        video.status = VideoStatus.processing
        db.commit()

        # ── Step 1: Extract audio & frames ─────────────────────────
        print(f"[ingestion] Step 1 – extracting audio & frames for {video_id}")
        from pipeline.ingestion import extract_audio, extract_frames

        audio_path = extract_audio(video_path)
        frames = extract_frames(video_path)

        # ── Step 2: Transcribe ─────────────────────────────────────
        print(f"[ingestion] Step 2 – transcribing audio for {video_id}")
        from pipeline.audio_processor import transcribe

        transcript_segments = transcribe(audio_path)

        # Update duration after transcription
        duration = 0.0
        if transcript_segments:
            duration = max(duration, transcript_segments[-1]["end"])

        # ── Step 3: Caption frames ─────────────────────────────────
        print(f"[ingestion] Step 3 – captioning frames for {video_id}")
        from pipeline.frame_processor import caption_frames

        frame_captions = caption_frames(frames)
        if frame_captions:
            duration = max(duration, frame_captions[-1]["timestamp"])

        # ── Step 4: Create chunks ──────────────────────────────────
        print(f"[ingestion] Step 4 – creating chunks for {video_id}")
        from pipeline.chunker import create_chunks

        chunks = create_chunks(transcript_segments, frame_captions, video_id)

        # ── Step 5: Embed chunks ───────────────────────────────────
        print(f"[ingestion] Step 5 – embedding chunks for {video_id}")
        from pipeline.embedder import embed_chunks

        embedded_chunks = embed_chunks(chunks)

        # ── Step 6: Store in ChromaDB ──────────────────────────────
        print(f"[ingestion] Step 6 – storing in ChromaDB for {video_id}")
        from pipeline.vector_store import init_store, store_chunks

        collection = init_store()
        store_chunks(collection, embedded_chunks)

        # ── Save chunk records to PostgreSQL ───────────────────────
        for item in embedded_chunks:
            chunk_data = item["chunk"]
            start = chunk_data["start"]
            chroma_id = f"{video_id}_{start:.2f}"

            db_chunk = Chunk(
                video_id=video_uuid,
                start_time=start,
                end_time=chunk_data["end"],
                transcript_text=chunk_data.get("transcript_only", ""),
                visual_description=chunk_data.get("visual_only", ""),
                combined_text=chunk_data.get("text", ""),
                chromadb_id=chroma_id,
            )
            db.add(db_chunk)

        # ── Finalise video record ──────────────────────────────────
        video.duration_seconds = duration
        video.status = VideoStatus.ready
        db.commit()

        print(f"[ingestion] Pipeline complete for {video_id}. "
              f"Duration={duration:.1f}s, chunks={len(embedded_chunks)}")

    except Exception as exc:
        print(f"[ingestion] ERROR for {video_id}: {exc}")
        try:
            from models.database_models import Video, VideoStatus
            video_uuid = uuid.UUID(str(video_id))
            video = db.query(Video).filter(Video.id == video_uuid).first()
            if video:
                video.status = VideoStatus.failed
                video.error_message = str(exc)
                db.commit()
        except Exception as inner_exc:
            print(f"[ingestion] Failed to update error status: {inner_exc}")
            db.rollback()
    finally:
        db.close()
