"""
Notebook service — bookmark CRUD per user.
"""

import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.auth.models import UserBookmark


async def get_bookmarks(db: AsyncSession, user_id: uuid.UUID) -> list[UserBookmark]:
    """Get all bookmarks for a user."""
    stmt = (
        select(UserBookmark)
        .where(UserBookmark.user_id == user_id)
        .order_by(UserBookmark.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def add_bookmark(db: AsyncSession, user_id: uuid.UUID, word_id: uuid.UUID) -> UserBookmark:
    """Add a bookmark. Raises if already exists."""
    # Check duplicate
    stmt = select(UserBookmark).where(
        UserBookmark.user_id == user_id,
        UserBookmark.word_id == word_id,
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise BadRequestException("Word already bookmarked")

    bookmark = UserBookmark(user_id=user_id, word_id=word_id)
    db.add(bookmark)
    await db.flush()
    return bookmark


async def remove_bookmark(db: AsyncSession, user_id: uuid.UUID, bookmark_id: uuid.UUID) -> None:
    """Remove a bookmark. Hard delete (mapping table)."""
    stmt = delete(UserBookmark).where(
        UserBookmark.id == bookmark_id,
        UserBookmark.user_id == user_id,
    )
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise NotFoundException("Bookmark not found")
