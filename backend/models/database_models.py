import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Float, Text, DateTime, Enum, Integer, ForeignKey
)
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class VideoStatus(enum.Enum):
    uploading = "uploading"
    processing = "processing"
    ready = "ready"
    failed = "failed"


class Video(Base):
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    source_url = Column(String(1000), nullable=True)
    file_path = Column(String(1000), nullable=False)
    duration_seconds = Column(Float, nullable=True)
    thumbnail_path = Column(String(1000), nullable=True)
    status = Column(Enum(VideoStatus), default=VideoStatus.uploading, nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    video_id = Column(
        UUID(as_uuid=True),
        ForeignKey("videos.id", ondelete="CASCADE"),
        nullable=False,
    )
    start_time = Column(Float, nullable=False)
    end_time = Column(Float, nullable=False)
    transcript_text = Column(Text, nullable=True)
    visual_description = Column(Text, nullable=True)
    combined_text = Column(Text, nullable=True)
    chromadb_id = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    query = Column(Text, nullable=False)
    results_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
