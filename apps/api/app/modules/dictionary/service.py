"""
Dictionary service — search and retrieval logic.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException
from app.modules.dictionary.models import CanonicalSign, SignAsset, Word


async def search_words(db: AsyncSession, query: str, limit: int = 10) -> list[Word]:
    """Search words using ILIKE (trigram index will optimize this)."""
    stmt = (
        select(Word)
        .where(Word.normalized_text.ilike(f"%{query}%"))
        .order_by(Word.difficulty_level)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_word_detail(db: AsyncSession, word_id: uuid.UUID) -> Word:
    """Get word with all canonical signs and active assets."""
    stmt = (
        select(Word)
        .where(Word.id == word_id)
        .options(
            selectinload(Word.canonical_signs).selectinload(
                CanonicalSign.assets.and_(SignAsset.is_active == True)
            )
        )
    )
    result = await db.execute(stmt)
    word = result.scalar_one_or_none()

    if word is None:
        raise NotFoundException(f"Word with id '{word_id}' not found")

    return word
