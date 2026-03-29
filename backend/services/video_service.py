import os
from pathlib import Path

from fastapi import HTTPException

from config import settings
from models.database_models import Video


def get_video_or_404(video_id: str, db) -> Video:
    """Fetch a Video by id or raise HTTP 404."""
    from sqlalchemy.dialects.postgresql import UUID as pg_UUID
    import uuid

    try:
        uid = uuid.UUID(str(video_id))
    except ValueError:
        raise HTTPException(status_code=404, detail="Video not found")

    video = db.query(Video).filter(Video.id == uid).first()
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


def format_time(seconds: float) -> str:
    """Convert seconds to MM:SS string."""
    seconds = int(seconds)
    minutes = seconds // 60
    secs = seconds % 60
    return f"{minutes:02d}:{secs:02d}"


def get_video_storage_dir() -> Path:
    """Return the video storage directory, creating it if necessary."""
    storage_dir = Path(settings.VIDEO_STORAGE_DIR)
    storage_dir.mkdir(parents=True, exist_ok=True)
    return storage_dir


def delete_video_files(video: Video) -> None:
    """Delete the video file and thumbnail from disk if they exist."""
    if video.file_path and os.path.isfile(video.file_path):
        try:
            os.remove(video.file_path)
        except OSError:
            pass

    if video.thumbnail_path and os.path.isfile(video.thumbnail_path):
        try:
            os.remove(video.thumbnail_path)
        except OSError:
            pass
