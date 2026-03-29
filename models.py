from pydantic import BaseModel, Field
from typing import Optional, List


# ── Ingest ────────────────────────────────────────────────────────

class IngestRequest(BaseModel):
    video_path: str = Field(..., description="Absolute path to the video file on disk")
    video_id: Optional[str] = Field(None, description="Custom ID; defaults to filename stem")


class IngestResponse(BaseModel):
    status: str
    video_id: str
    chunks_created: int
    duration_seconds: float
    elapsed_seconds: float


# ── Search ────────────────────────────────────────────────────────

class SearchRequest(BaseModel):
    query: str = Field(..., description="Natural language search query")
    n_results: int = Field(5, ge=1, le=20, description="Number of results to return")


class SearchResult(BaseModel):
    rank: int
    video_id: str
    start_time: float
    end_time: float
    start_time_formatted: str   # MM:SS
    end_time_formatted: str     # MM:SS
    transcript: str
    visual_context: str
    relevance_score: float


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]


# ── Videos ───────────────────────────────────────────────────────

class VideosResponse(BaseModel):
    videos: List[str]
    total: int


# ── Health ────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    chunks_in_store: int
