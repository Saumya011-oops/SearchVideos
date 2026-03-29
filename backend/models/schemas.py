from __future__ import annotations

import enum
from typing import Optional, List

from pydantic import BaseModel, Field


class VideoStatus(str, enum.Enum):
    uploading = "uploading"
    processing = "processing"
    ready = "ready"
    failed = "failed"


# ── Video schemas ──────────────────────────────────────────────────────────────

class VideoBase(BaseModel):
    title: str
    source_url: Optional[str] = None
    file_path: str
    duration_seconds: Optional[float] = None
    thumbnail_path: Optional[str] = None
    status: VideoStatus = VideoStatus.uploading
    error_message: Optional[str] = None


class VideoCreate(BaseModel):
    title: str
    source_url: Optional[str] = None
    file_path: str


class VideoResponse(BaseModel):
    id: str
    title: str
    source_url: Optional[str] = None
    file_path: str
    duration_seconds: Optional[float] = None
    thumbnail_path: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


# ── Chunk schemas ──────────────────────────────────────────────────────────────

class ChunkResponse(BaseModel):
    id: str
    video_id: str
    start_time: float
    end_time: float
    transcript_text: Optional[str] = None
    visual_description: Optional[str] = None
    combined_text: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Ingestion schemas ──────────────────────────────────────────────────────────

class IngestURLRequest(BaseModel):
    source_url: str


# ── Search schemas ─────────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str
    video_id: Optional[str] = None
    top_k: int = Field(default=10, ge=1, le=50)


class SearchResultItem(BaseModel):
    video_id: str
    video_title: str
    start_time: float
    end_time: float
    start_time_formatted: str
    end_time_formatted: str
    transcript: str
    visual_context: str
    similarity_score: float
    chunk_id: str


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
    total_results: int


# ── Utility schemas ────────────────────────────────────────────────────────────

class StatsResponse(BaseModel):
    total_videos: int
    total_chunks: int
    total_searches: int


class HealthResponse(BaseModel):
    status: str
    database: str
    vector_store: str
