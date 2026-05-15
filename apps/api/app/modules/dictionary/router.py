"""
Dictionary router — search, word detail, categories, and browse endpoints.
"""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.modules.dictionary.schemas import (
    CategoryResponse,
    WordBrowseItem,
    WordDetailResponse,
    WordSearchResult,
)
from app.modules.dictionary.service import (
    browse_words,
    get_categories,
    get_word_detail,
    search_words,
)

router = APIRouter()


@router.get("/search", response_model=dict)
async def search(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    entry_type: str | None = Query(None, description="Filter: word | phrase | sentence"),
    category: str | None = Query(None, description="Filter by category slug"),
    db: AsyncSession = Depends(get_db),
):
    """Auto-suggest search for words (public, no auth required).

    Supports filtering by entry_type and category slug.
    Only returns published entries.
    """
    words = await search_words(db, q, limit, entry_type, category)
    return {
        "success": True,
        "message": f"Found {len(words)} results",
        "data": [WordSearchResult.model_validate(w).model_dump(mode="json") for w in words],
        "meta": {"query": q, "limit": limit, "entry_type": entry_type, "category": category},
    }


@router.get("/words/{word_id}", response_model=dict)
async def word_detail(
    word_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get word detail with all canonical signs, active assets, and categories (public)."""
    word = await get_word_detail(db, word_id)

    # Build categories from word_categories relationship
    categories = [
        CategoryResponse.model_validate(wc.category).model_dump(mode="json")
        for wc in word.word_categories
    ]

    detail = WordDetailResponse.model_validate(word).model_dump(mode="json")
    detail["categories"] = categories

    return {
        "success": True,
        "message": "Word detail retrieved",
        "data": detail,
        "meta": None,
    }


@router.get("/categories", response_model=dict)
async def list_categories(
    db: AsyncSession = Depends(get_db),
):
    """Get all categories with word counts for browse UI (public)."""
    categories = await get_categories(db)
    return {
        "success": True,
        "message": f"Found {len(categories)} categories",
        "data": categories,
        "meta": None,
    }


@router.get("/browse", response_model=dict)
async def browse(
    category: str | None = Query(None, description="Category slug"),
    entry_type: str | None = Query(None, description="Filter: word | phrase | sentence"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Browse words by category and/or entry_type with pagination (public)."""
    words, total = await browse_words(db, category, entry_type, page, limit)
    return {
        "success": True,
        "message": f"Found {total} entries",
        "data": [WordBrowseItem.model_validate(w).model_dump(mode="json") for w in words],
        "meta": {
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit if limit > 0 else 0,
            },
            "filters": {"category": category, "entry_type": entry_type},
        },
    }
