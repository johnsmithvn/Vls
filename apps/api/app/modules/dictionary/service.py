"""
Dictionary service — search, retrieval, and browse logic.
"""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException
from app.modules.dictionary.models import (
    CanonicalSign,
    Category,
    SignAsset,
    Word,
    WordCategory,
)


async def search_words(
    db: AsyncSession,
    query: str,
    limit: int = 10,
    entry_type: str | None = None,
    category_slug: str | None = None,
) -> list[Word]:
    """Search published words using ILIKE (trigram index will optimize this).

    Supports filtering by entry_type and category_slug.
    Only returns published entries (status='published').
    """
    stmt = select(Word).where(
        Word.normalized_text.ilike(f"%{query}%"),
        Word.status == "published",
        func.char_length(Word.text_vn) > 1,  # Exclude alphabet letters
    )

    if entry_type:
        stmt = stmt.where(Word.entry_type == entry_type)

    if category_slug:
        stmt = (
            stmt.join(WordCategory, WordCategory.word_id == Word.id)
            .join(Category, Category.id == WordCategory.category_id)
            .where(Category.slug == category_slug)
        )

    stmt = stmt.order_by(Word.difficulty_level).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_word_detail(db: AsyncSession, word_id: uuid.UUID) -> Word:
    """Get word with all canonical signs, active assets, and categories."""
    stmt = (
        select(Word)
        .where(Word.id == word_id, Word.status == "published")
        .options(
            selectinload(Word.canonical_signs).selectinload(
                CanonicalSign.assets.and_(SignAsset.is_active == True)
            ),
            selectinload(Word.word_categories).selectinload(
                WordCategory.category
            ),
        )
    )
    result = await db.execute(stmt)
    word = result.scalar_one_or_none()

    if word is None:
        raise NotFoundException(f"Word with id '{word_id}' not found")

    return word


async def browse_words(
    db: AsyncSession,
    category_slug: str | None = None,
    entry_type: str | None = None,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Word], int]:
    """Browse published words with optional category/entry_type filter.

    Returns (words, total_count) for pagination.
    """
    base_filter = [
        Word.status == "published",
        func.char_length(Word.text_vn) > 1,  # Exclude alphabet letters
    ]

    if entry_type:
        base_filter.append(Word.entry_type == entry_type)

    # Build base query
    stmt = select(Word).where(*base_filter)
    count_stmt = select(func.count(Word.id)).where(*base_filter)

    if category_slug:
        join_clause = (
            select(WordCategory.word_id)
            .join(Category, Category.id == WordCategory.category_id)
            .where(Category.slug == category_slug)
            .scalar_subquery()
        )
        stmt = stmt.where(Word.id.in_(join_clause))
        count_stmt = count_stmt.where(Word.id.in_(join_clause))

    # Count
    total_result = await db.execute(count_stmt)
    total = total_result.scalar() or 0

    # Paginate
    offset = (page - 1) * limit
    stmt = stmt.order_by(Word.difficulty_level, Word.text_vn).offset(offset).limit(limit)

    result = await db.execute(stmt)
    words = list(result.scalars().all())

    return words, total


async def get_categories(db: AsyncSession) -> list[dict]:
    """Get all categories with word counts for browse UI."""
    stmt = (
        select(
            Category,
            func.count(WordCategory.word_id).label("word_count"),
        )
        .outerjoin(WordCategory, WordCategory.category_id == Category.id)
        .outerjoin(
            Word,
            (Word.id == WordCategory.word_id) & (Word.status == "published"),
        )
        .group_by(Category.id)
        .order_by(Category.display_order)
    )
    result = await db.execute(stmt)
    rows = result.all()

    categories = []
    for category, word_count in rows:
        categories.append({
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "icon": category.icon,
            "display_order": category.display_order,
            "word_count": word_count,
        })

    return categories
