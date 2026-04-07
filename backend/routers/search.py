from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.schemas import SearchRequest, SearchResponse
from services import search_service

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("", response_model=SearchResponse)
def search(body: SearchRequest, db: Session = Depends(get_db)):
    """Search for video chunks matching the given query."""
    results = search_service.search_videos(
        query=body.query,
        video_id=body.video_id,
        top_k=body.top_k,
        db=db,
    )
    return SearchResponse(
        query=body.query,
        results=results,
        total_results=len(results),
    )
