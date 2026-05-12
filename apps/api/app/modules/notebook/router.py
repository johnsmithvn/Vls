"""
Notebook router — bookmark CRUD endpoints (protected).
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.modules.notebook.schemas import BookmarkCreate, BookmarkResponse
from app.modules.notebook.service import add_bookmark, get_bookmarks, remove_bookmark

router = APIRouter()


@router.get("/bookmarks", response_model=dict)
async def list_bookmarks(
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all bookmarks for the current user."""
    bookmarks = await get_bookmarks(db, user_id)
    return {
        "success": True,
        "message": f"Found {len(bookmarks)} bookmarks",
        "data": [BookmarkResponse.model_validate(b).model_dump(mode="json") for b in bookmarks],
        "meta": None,
    }


@router.post("/bookmarks", response_model=dict, status_code=201)
async def create_bookmark(
    body: BookmarkCreate,
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a word to bookmarks."""
    bookmark = await add_bookmark(db, user_id, body.word_id)
    return {
        "success": True,
        "message": "Bookmark added",
        "data": BookmarkResponse.model_validate(bookmark).model_dump(mode="json"),
        "meta": None,
    }


@router.delete("/bookmarks/{bookmark_id}", response_model=dict)
async def delete_bookmark(
    bookmark_id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a bookmark."""
    await remove_bookmark(db, user_id, bookmark_id)
    return {
        "success": True,
        "message": "Bookmark removed",
        "data": None,
        "meta": None,
    }
