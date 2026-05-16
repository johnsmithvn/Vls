"""
Admin router — owner-only CRUD for words, categories, and dashboard.
All routes require 'owner' role (per RULES.md B3: Router → Service → Model).
"""

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.security import get_owner_user
from app.modules.admin.schemas import (
    AdminDashboardStats,
    CategoryCreate,
    CategoryUpdate,
    WordCreate,
    WordUpdate,
)
from app.modules.admin.service import (
    create_category,
    create_word,
    delete_category,
    delete_word,
    get_dashboard_stats,
    list_categories_admin,
    list_words_admin,
    update_category,
    update_word,
)
from app.modules.dictionary.schemas import CategoryResponse, WordDetailResponse
from app.modules.dictionary.service import get_word_detail

router = APIRouter()


# ── Dashboard ────────────────────────────────────────────────


@router.get("/dashboard", response_model=dict)
async def dashboard(
    _owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """Admin dashboard statistics."""
    stats = await get_dashboard_stats(db)
    return {
        "success": True,
        "message": "Dashboard stats retrieved",
        "data": AdminDashboardStats(**stats).model_dump(),
        "meta": None,
    }


# ── Word CRUD ────────────────────────────────────────────────


@router.get("/words", response_model=dict)
async def list_words(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, max_length=100),
    entry_type: str | None = Query(None),
    _owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """List words for admin panel."""
    items, total = await list_words_admin(db, page, limit, search, entry_type)
    return {
        "success": True,
        "message": f"Found {total} words",
        "data": items,
        "meta": {
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit if limit > 0 else 0,
            }
        },
    }


@router.get("/words/{word_id}", response_model=dict)
async def get_word(
    word_id: uuid.UUID,
    _owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """Get word detail for editing."""
    word = await get_word_detail(db, word_id)

    from app.modules.dictionary.schemas import CategoryResponse
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


@router.post("/words", response_model=dict, status_code=201)
async def create(
    data: WordCreate,
    owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new word entry."""
    word = await create_word(db, data, owner_id)
    return {
        "success": True,
        "message": f"Word '{word.text_vn}' created",
        "data": {"id": str(word.id), "text_vn": word.text_vn},
        "meta": None,
    }


@router.put("/words/{word_id}", response_model=dict)
async def update(
    word_id: uuid.UUID,
    data: WordUpdate,
    _owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing word entry."""
    word = await update_word(db, word_id, data)
    return {
        "success": True,
        "message": f"Word '{word.text_vn}' updated",
        "data": {"id": str(word.id), "text_vn": word.text_vn},
        "meta": None,
    }


@router.delete("/words/{word_id}", response_model=dict)
async def remove(
    word_id: uuid.UUID,
    _owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a word entry."""
    await delete_word(db, word_id)
    return {
        "success": True,
        "message": "Word deleted",
        "data": None,
        "meta": None,
    }


# ── Category CRUD ────────────────────────────────────────────


@router.get("/categories", response_model=dict)
async def list_cats(
    _owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """List all categories for admin."""
    cats = await list_categories_admin(db)
    return {
        "success": True,
        "message": f"Found {len(cats)} categories",
        "data": [CategoryResponse.model_validate(c).model_dump(mode="json") for c in cats],
        "meta": None,
    }


@router.post("/categories", response_model=dict, status_code=201)
async def create_cat(
    data: CategoryCreate,
    _owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new category."""
    cat = await create_category(db, **data.model_dump())
    return {
        "success": True,
        "message": f"Category '{cat.name}' created",
        "data": CategoryResponse.model_validate(cat).model_dump(mode="json"),
        "meta": None,
    }


@router.put("/categories/{cat_id}", response_model=dict)
async def update_cat(
    cat_id: uuid.UUID,
    data: CategoryUpdate,
    _owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a category."""
    cat = await update_category(db, cat_id, **data.model_dump(exclude_none=True))
    return {
        "success": True,
        "message": f"Category '{cat.name}' updated",
        "data": CategoryResponse.model_validate(cat).model_dump(mode="json"),
        "meta": None,
    }


@router.delete("/categories/{cat_id}", response_model=dict)
async def delete_cat(
    cat_id: uuid.UUID,
    _owner_id: uuid.UUID = Depends(get_owner_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a category."""
    await delete_category(db, cat_id)
    return {
        "success": True,
        "message": "Category deleted",
        "data": None,
        "meta": None,
    }
