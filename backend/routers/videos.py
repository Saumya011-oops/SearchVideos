from __future__ import annotations

import os
import uuid
import threading
import mimetypes
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db, SessionLocal
from config import settings
from models.database_models import Video, Chunk, VideoStatus, User
from models.schemas import VideoResponse, ChunkResponse, IngestURLRequest
from services.video_service import (
    get_video_or_404,
    get_video_storage_dir,
    delete_video_files,
)
from services.ingestion_service import run_ingestion_pipeline
from auth import get_current_user

router = APIRouter(prefix="/api/videos", tags=["videos"])


def _video_to_response(video: Video) -> VideoResponse:
    return VideoResponse(
        id=str(video.id),
        title=video.title,
        source_url=video.source_url,
        file_path=video.file_path,
        duration_seconds=video.duration_seconds,
        thumbnail_path=video.thumbnail_path,
        status=video.status.value if hasattr(video.status, "value") else str(video.status),
        error_message=video.error_message,
        user_id=str(video.user_id) if video.user_id else None,
        created_at=video.created_at.isoformat(),
        updated_at=video.updated_at.isoformat(),
    )


# ── Upload a local video file ─────────────────────────────────────────────────

@router.post("/upload", response_model=VideoResponse, status_code=201)
async def upload_video(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    storage_dir = get_video_storage_dir()
    safe_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = storage_dir / safe_name

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds max upload size of {settings.MAX_UPLOAD_SIZE_MB} MB",
        )

    with open(file_path, "wb") as f:
        f.write(contents)

    video_id = uuid.uuid4()
    video = Video(
        id=video_id,
        title=file.filename or safe_name,
        file_path=str(file_path),
        status=VideoStatus.uploading,
        user_id=current_user.id,
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    thread = threading.Thread(
        target=run_ingestion_pipeline,
        args=(str(video_id), str(file_path), SessionLocal),
        daemon=True,
    )
    thread.start()

    return _video_to_response(video)


# ── Ingest from YouTube URL ───────────────────────────────────────────────────

@router.post("/youtube", response_model=VideoResponse, status_code=201)
def ingest_youtube(
    body: IngestURLRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    import yt_dlp

    storage_dir = get_video_storage_dir()
    video_id = uuid.uuid4()
    output_path = storage_dir / f"{video_id}.mp4"

    ydl_opts = {
        "outtmpl": str(output_path),
        "format": "mp4",
        "quiet": True,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(body.source_url, download=True)
            title = info.get("title", str(video_id)) if info else str(video_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"yt-dlp error: {exc}")

    actual_path = output_path
    if not actual_path.exists():
        for ext in ("mp4", "mkv", "webm"):
            candidate = storage_dir / f"{video_id}.{ext}"
            if candidate.exists():
                actual_path = candidate
                break

    video = Video(
        id=video_id,
        title=title,
        source_url=body.source_url,
        file_path=str(actual_path),
        status=VideoStatus.uploading,
        user_id=current_user.id,
    )
    db.add(video)
    db.commit()
    db.refresh(video)

    thread = threading.Thread(
        target=run_ingestion_pipeline,
        args=(str(video_id), str(actual_path), SessionLocal),
        daemon=True,
    )
    thread.start()

    return _video_to_response(video)


# ── List videos for current user ──────────────────────────────────────────────

@router.get("", response_model=List[VideoResponse])
def list_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    videos = (
        db.query(Video)
        .filter(Video.user_id == current_user.id)
        .order_by(Video.created_at.desc())
        .all()
    )
    return [_video_to_response(v) for v in videos]


# ── Get single video ──────────────────────────────────────────────────────────

@router.get("/{video_id}", response_model=VideoResponse)
def get_video(video_id: str, db: Session = Depends(get_db)):
    video = get_video_or_404(video_id, db)
    return _video_to_response(video)


# ── Delete video ──────────────────────────────────────────────────────────────

@router.delete("/{video_id}")
def delete_video(
    video_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    video = get_video_or_404(video_id, db)

    # Only the owner can delete
    if video.user_id and str(video.user_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this video")

    try:
        from pipeline.vector_store import init_store
        collection = init_store()
        collection.delete(where={"video_id": video_id})
    except Exception as exc:
        print(f"[delete] ChromaDB cleanup error (non-fatal): {exc}")

    db.query(Chunk).filter(Chunk.video_id == video.id).delete()
    delete_video_files(video)
    db.delete(video)
    db.commit()

    return {"status": "deleted"}


# ── Stream video ──────────────────────────────────────────────────────────────

@router.get("/{video_id}/stream")
def stream_video(video_id: str, request: Request, db: Session = Depends(get_db)):
    video = get_video_or_404(video_id, db)
    file_path = Path(video.file_path)

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found on disk")

    file_size = file_path.stat().st_size
    chunk_size = 1 * 1024 * 1024

    mime_type, _ = mimetypes.guess_type(str(file_path))
    if not mime_type:
        mime_type = "video/mp4"

    range_header = request.headers.get("Range")

    if range_header:
        try:
            range_val = range_header.replace("bytes=", "").strip()
            start_str, _, end_str = range_val.partition("-")
            start = int(start_str) if start_str else 0
            end = int(end_str) if end_str else file_size - 1
        except ValueError:
            raise HTTPException(status_code=416, detail="Invalid Range header")

        if start > end or start >= file_size:
            raise HTTPException(status_code=416, detail="Range not satisfiable")

        end = min(end, file_size - 1)
        content_length = end - start + 1

        def generate():
            with open(file_path, "rb") as f:
                f.seek(start)
                remaining = content_length
                while remaining > 0:
                    read_size = min(chunk_size, remaining)
                    data = f.read(read_size)
                    if not data:
                        break
                    remaining -= len(data)
                    yield data

        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(content_length),
        }
        return StreamingResponse(generate(), status_code=206, headers=headers, media_type=mime_type)
    else:
        def generate_full():
            with open(file_path, "rb") as f:
                while True:
                    data = f.read(chunk_size)
                    if not data:
                        break
                    yield data

        headers = {"Accept-Ranges": "bytes", "Content-Length": str(file_size)}
        return StreamingResponse(generate_full(), status_code=200, headers=headers, media_type=mime_type)


# ── Get chunks for a video ────────────────────────────────────────────────────

@router.get("/{video_id}/chunks", response_model=List[ChunkResponse])
def get_video_chunks(video_id: str, db: Session = Depends(get_db)):
    video = get_video_or_404(video_id, db)
    chunks = (
        db.query(Chunk)
        .filter(Chunk.video_id == video.id)
        .order_by(Chunk.start_time)
        .all()
    )
    return [
        ChunkResponse(
            id=str(c.id),
            video_id=str(c.video_id),
            start_time=c.start_time,
            end_time=c.end_time,
            transcript_text=c.transcript_text,
            visual_description=c.visual_description,
            combined_text=c.combined_text,
        )
        for c in chunks
    ]
