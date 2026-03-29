import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import pipeline
import vector_store
from models import (
    IngestRequest, IngestResponse,
    SearchRequest, SearchResponse, SearchResult,
    VideosResponse, HealthResponse,
)

app = FastAPI(
    title="Video-Context Search Engine",
    description="Multi-Modal RAG system for searching video content by natural language",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _fmt_time(seconds: float) -> str:
    m = int(seconds // 60)
    s = int(seconds % 60)
    return f"{m:02d}:{s:02d}"


@app.get("/health", response_model=HealthResponse)
def health():
    collection = vector_store.init_store()
    return HealthResponse(status="ok", chunks_in_store=collection.count())


@app.post("/ingest", response_model=IngestResponse)
def ingest(request: IngestRequest):
    if not os.path.isfile(request.video_path):
        raise HTTPException(status_code=400, detail=f"File not found: {request.video_path}")

    try:
        result = pipeline.process_video(request.video_path, video_id=request.video_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return IngestResponse(
        status="success",
        video_id=result["video_id"],
        chunks_created=result["chunks_created"],
        duration_seconds=result["duration_seconds"],
        elapsed_seconds=result["elapsed_seconds"],
    )


@app.post("/search", response_model=SearchResponse)
def search(request: SearchRequest):
    collection = vector_store.init_store()

    if collection.count() == 0:
        raise HTTPException(status_code=404, detail="No videos ingested yet.")

    raw_results = vector_store.query(collection, request.query, n_results=request.n_results)

    results = [
        SearchResult(
            rank=i + 1,
            video_id=r["video_id"],
            start_time=r["start"],
            end_time=r["end"],
            start_time_formatted=_fmt_time(r["start"]),
            end_time_formatted=_fmt_time(r["end"]),
            transcript=r["transcript_only"],
            visual_context=r["visual_only"],
            relevance_score=r["relevance_score"],
        )
        for i, r in enumerate(raw_results)
    ]

    return SearchResponse(query=request.query, results=results)


@app.get("/videos", response_model=VideosResponse)
def list_videos():
    collection = vector_store.init_store()
    videos = vector_store.list_videos(collection)
    return VideosResponse(videos=videos, total=len(videos))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
