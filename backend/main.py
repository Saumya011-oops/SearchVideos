from __future__ import annotations

import sys
import os

# Ensure backend/ directory is on sys.path so all local imports resolve
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(_BACKEND_DIR)

# Backend dir must come first so its config.py takes priority over project root's
if _PROJECT_ROOT not in sys.path:
    sys.path.append(_PROJECT_ROOT)
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from pathlib import Path

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from config import settings
from database import get_db, create_tables
from models.database_models import Video, Chunk, SearchHistory
from models.schemas import HealthResponse, StatsResponse
from routers import videos as videos_router
from routers import search as search_router
from routers import auth as auth_router

# ── Application factory ────────────────────────────────────────────────────────

app = FastAPI(
    title="Video-Context Search Engine",
    description="Upload videos, transcribe & caption them, then search by context.",
    version="1.0.0",
    redirect_slashes=False,
)

# ── CORS ───────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────

app.include_router(auth_router.router)
app.include_router(videos_router.router)
app.include_router(search_router.router)


# ── Startup ────────────────────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    """Create DB tables and storage directory on startup."""
    create_tables()
    storage_dir = Path(settings.VIDEO_STORAGE_DIR)
    storage_dir.mkdir(parents=True, exist_ok=True)
    print(f"[startup] Video storage directory ready: {storage_dir.resolve()}")


# ── Health check ───────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse)
def health_check(db: Session = Depends(get_db)):
    """Return service health including database and vector store status."""
    # Check database
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"error: {exc}"

    # Check ChromaDB
    vector_status = "ok"
    try:
        from pipeline.vector_store import init_store
        collection = init_store()
        _ = collection.count()
    except Exception as exc:
        vector_status = f"error: {exc}"

    overall = "healthy" if db_status == "ok" and vector_status == "ok" else "degraded"

    return HealthResponse(
        status=overall,
        database=db_status,
        vector_store=vector_status,
    )


# ── Stats ──────────────────────────────────────────────────────────────────────

@app.get("/api/stats", response_model=StatsResponse)
def stats(db: Session = Depends(get_db)):
    """Return aggregate counts for videos, chunks, and searches."""
    total_videos = db.query(Video).count()
    total_chunks = db.query(Chunk).count()
    total_searches = db.query(SearchHistory).count()

    return StatsResponse(
        total_videos=total_videos,
        total_chunks=total_chunks,
        total_searches=total_searches,
    )
