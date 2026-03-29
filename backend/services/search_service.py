from __future__ import annotations

import uuid
from typing import Optional, List

from models.schemas import SearchResultItem
from models.database_models import Video, SearchHistory
from services.video_service import format_time


def search_videos(
    query: str,
    video_id: Optional[str],
    top_k: int,
    db,
) -> List[SearchResultItem]:
    """
    Search ChromaDB for chunks matching *query*.
    If *video_id* is provided, restrict results to that video.
    Saves the query to SearchHistory.
    Returns a list of SearchResultItem.
    """
    from pipeline.vector_store import init_store
    from pipeline.embedder import embed_query

    collection = init_store()

    query_embedding = embed_query(query)

    # Build optional where-filter
    where_filter = None
    if video_id:
        where_filter = {"video_id": video_id}

    count = collection.count()
    if count == 0:
        _save_search_history(db, query, 0)
        return []

    n = min(top_k, count)

    query_kwargs = {
        "query_embeddings": [query_embedding],
        "n_results": n,
        "include": ["documents", "metadatas", "distances"],
    }
    if where_filter:
        query_kwargs["where"] = where_filter

    raw = collection.query(**query_kwargs)

    documents = raw["documents"][0]
    metadatas = raw["metadatas"][0]
    distances = raw["distances"][0]

    results: List[SearchResultItem] = []
    for doc, meta, dist in zip(documents, metadatas, distances):
        vid_id = meta.get("video_id", "")
        start = float(meta.get("start", 0))
        end = float(meta.get("end", 0))

        # Look up video title
        video_title = "Unknown"
        try:
            uid = uuid.UUID(str(vid_id))
            video = db.query(Video).filter(Video.id == uid).first()
            if video:
                video_title = video.title
        except (ValueError, Exception):
            pass

        # Cosine distance -> relevance score
        relevance = round(1.0 - (dist / 2.0), 4)

        chunk_id = f"{vid_id}_{start:.2f}"

        results.append(
            SearchResultItem(
                video_id=vid_id,
                video_title=video_title,
                start_time=start,
                end_time=end,
                start_time_formatted=format_time(start),
                end_time_formatted=format_time(end),
                transcript=meta.get("transcript_only", ""),
                visual_context=meta.get("visual_only", ""),
                similarity_score=relevance,
                chunk_id=chunk_id,
            )
        )

    _save_search_history(db, query, len(results))
    return results


def _save_search_history(db, query: str, results_count: int) -> None:
    """Persist a search query to the SearchHistory table."""
    try:
        record = SearchHistory(query=query, results_count=results_count)
        db.add(record)
        db.commit()
    except Exception:
        db.rollback()
