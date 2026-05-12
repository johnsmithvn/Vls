"""
Dictionary router — search and word detail endpoints.
"""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.modules.dictionary.schemas import WordDetailResponse, WordSearchResult
from app.modules.dictionary.service import get_word_detail, search_words

router = APIRouter()


@router.get("/search", response_model=dict)
async def search(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Auto-suggest search for words (public, no auth required)."""
    words = await search_words(db, q, limit)
    return {
        "success": True,
        "message": f"Found {len(words)} results",
        "data": [WordSearchResult.model_validate(w).model_dump(mode="json") for w in words],
        "meta": {"query": q, "limit": limit},
    }


@router.get("/words/{word_id}", response_model=dict)
async def word_detail(
    word_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get word detail with all canonical signs and active assets (public)."""
    word = await get_word_detail(db, word_id)
    return {
        "success": True,
        "message": "Word detail retrieved",
        "data": WordDetailResponse.model_validate(word).model_dump(mode="json"),
        "meta": None,
    }
