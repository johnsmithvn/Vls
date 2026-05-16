"""
Admin service — CRUD operations for words, signs, assets, categories.
Layer isolation: Router → Service → Model (per RULES.md B3).
"""

import uuid

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BadRequestException, NotFoundException
from app.modules.admin.schemas import (
    CanonicalSignCreate,
    WordCreate,
    WordUpdate,
)
from app.modules.dictionary.models import (
    CanonicalSign,
    Category,
    SignAsset,
    Word,
    WordCategory,
)


def _normalize(text: str) -> str:
    """Simple Vietnamese text normalization."""
    return text.lower().strip()


# ── Dashboard ────────────────────────────────────────────────


async def get_dashboard_stats(db: AsyncSession) -> dict:
    """Get aggregate statistics for admin dashboard."""
    # Word counts by entry_type
    word_counts = await db.execute(
        select(Word.entry_type, func.count(Word.id))
        .group_by(Word.entry_type)
    )
    type_map = {row[0]: row[1] for row in word_counts.all()}

    # Category count
    cat_count = await db.execute(select(func.count(Category.id)))

    # Asset counts by media_type
    asset_counts = await db.execute(
        select(SignAsset.media_type, func.count(SignAsset.id))
        .where(SignAsset.is_active == True)
        .group_by(SignAsset.media_type)
    )
    asset_map = {row[0]: row[1] for row in asset_counts.all()}

    return {
        "total_words": type_map.get("word", 0),
        "total_phrases": type_map.get("phrase", 0),
        "total_sentences": type_map.get("sentence", 0),
        "total_categories": cat_count.scalar() or 0,
        "total_videos": asset_map.get("video", 0),
        "total_images": asset_map.get("image", 0),
    }


# ── Word CRUD ────────────────────────────────────────────────


async def list_words_admin(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    search: str | None = None,
    entry_type: str | None = None,
) -> tuple[list[dict], int]:
    """List words for admin panel with search/filter/pagination."""
    filters = []
    if search:
        filters.append(Word.normalized_text.ilike(f"%{search.lower()}%"))
    if entry_type:
        filters.append(Word.entry_type == entry_type)

    # Count
    count_stmt = select(func.count(Word.id)).where(*filters) if filters else select(func.count(Word.id))
    total = (await db.execute(count_stmt)).scalar() or 0

    # Query with categories
    stmt = (
        select(Word)
        .where(*filters) if filters else select(Word)
    )
    stmt = (
        stmt
        .options(
            selectinload(Word.word_categories).selectinload(WordCategory.category),
            selectinload(Word.canonical_signs).selectinload(CanonicalSign.assets),
        )
        .order_by(Word.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    result = await db.execute(stmt)
    words = result.scalars().unique().all()

    items = []
    for w in words:
        has_video = any(
            a.media_type == "video" and a.is_active
            for s in w.canonical_signs
            for a in s.assets
        )
        cat_names = [wc.category.name for wc in w.word_categories]
        items.append({
            "id": w.id,
            "text_vn": w.text_vn,
            "entry_type": w.entry_type,
            "part_of_speech": w.part_of_speech,
            "difficulty_level": w.difficulty_level,
            "status": w.status,
            "has_video": has_video,
            "category_names": cat_names,
            "created_at": w.created_at.isoformat() if w.created_at else None,
        })

    return items, total


async def create_word(
    db: AsyncSession,
    data: WordCreate,
    user_id: uuid.UUID,
) -> Word:
    """Create a new word with canonical signs and assets."""
    # Check duplicate
    existing = await db.execute(
        select(Word).where(Word.normalized_text == _normalize(data.text_vn))
    )
    if existing.scalar_one_or_none():
        raise BadRequestException(f"Word '{data.text_vn}' already exists")

    word = Word(
        text_vn=data.text_vn,
        normalized_text=_normalize(data.text_vn),
        entry_type=data.entry_type,
        part_of_speech=data.part_of_speech,
        difficulty_level=data.difficulty_level,
        semantic_tags=data.semantic_tags or [],
        description=data.description,
        status="published",
        contributed_by=user_id,
    )
    db.add(word)
    await db.flush()

    # Categories
    await _sync_categories(db, word.id, data.category_ids)

    # Canonical Signs + Assets
    for sign_data in data.canonical_signs:
        await _create_sign(db, word.id, sign_data)

    # If no signs provided, create a default empty one
    if not data.canonical_signs:
        default_sign = CanonicalSign(
            word_id=word.id,
            variant_name="Chuẩn",
            is_default=True,
        )
        db.add(default_sign)

    await db.flush()
    return word


async def update_word(
    db: AsyncSession,
    word_id: uuid.UUID,
    data: WordUpdate,
) -> Word:
    """Update word and optionally replace signs/categories."""
    word = await _get_word_or_404(db, word_id)

    # Update scalar fields
    if data.text_vn is not None:
        word.text_vn = data.text_vn
        word.normalized_text = _normalize(data.text_vn)
    if data.entry_type is not None:
        word.entry_type = data.entry_type
    if data.part_of_speech is not None:
        word.part_of_speech = data.part_of_speech
    if data.difficulty_level is not None:
        word.difficulty_level = data.difficulty_level
    if data.semantic_tags is not None:
        word.semantic_tags = data.semantic_tags
    if data.description is not None:
        word.description = data.description

    # Update categories
    if data.category_ids is not None:
        await _sync_categories(db, word_id, data.category_ids)

    # Replace canonical signs (full replace strategy)
    if data.canonical_signs is not None:
        # Delete existing
        await db.execute(
            delete(CanonicalSign).where(CanonicalSign.word_id == word_id)
        )
        await db.flush()
        # Create new
        for sign_data in data.canonical_signs:
            await _create_sign(db, word_id, sign_data)

    await db.flush()
    return word


async def delete_word(db: AsyncSession, word_id: uuid.UUID) -> None:
    """Hard delete a word and all its cascade relationships."""
    word = await _get_word_or_404(db, word_id)
    await db.delete(word)
    await db.flush()


# ── Category CRUD ────────────────────────────────────────────


async def list_categories_admin(db: AsyncSession) -> list[Category]:
    """List all categories for admin."""
    result = await db.execute(
        select(Category).order_by(Category.display_order)
    )
    return list(result.scalars().all())


async def create_category(db: AsyncSession, name: str, slug: str, **kwargs) -> Category:
    """Create a new category."""
    cat = Category(name=name, slug=slug, **kwargs)
    db.add(cat)
    await db.flush()
    return cat


async def update_category(db: AsyncSession, cat_id: uuid.UUID, **kwargs) -> Category:
    """Update a category."""
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalar_one_or_none()
    if cat is None:
        raise NotFoundException(f"Category '{cat_id}' not found")

    for key, value in kwargs.items():
        if value is not None and hasattr(cat, key):
            setattr(cat, key, value)

    await db.flush()
    return cat


async def delete_category(db: AsyncSession, cat_id: uuid.UUID) -> None:
    """Delete a category."""
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalar_one_or_none()
    if cat is None:
        raise NotFoundException(f"Category '{cat_id}' not found")
    await db.delete(cat)
    await db.flush()


# ── Private Helpers ──────────────────────────────────────────


async def _get_word_or_404(db: AsyncSession, word_id: uuid.UUID) -> Word:
    """Fetch word by ID or raise 404."""
    result = await db.execute(select(Word).where(Word.id == word_id))
    word = result.scalar_one_or_none()
    if word is None:
        raise NotFoundException(f"Word '{word_id}' not found")
    return word


async def _sync_categories(
    db: AsyncSession,
    word_id: uuid.UUID,
    category_ids: list[uuid.UUID],
) -> None:
    """Replace all word-category links with the given list."""
    await db.execute(
        delete(WordCategory).where(WordCategory.word_id == word_id)
    )
    for cat_id in category_ids:
        db.add(WordCategory(word_id=word_id, category_id=cat_id))
    await db.flush()


async def _create_sign(
    db: AsyncSession,
    word_id: uuid.UUID,
    data: CanonicalSignCreate,
) -> CanonicalSign:
    """Create a canonical sign with its assets."""
    sign = CanonicalSign(
        word_id=word_id,
        variant_name=data.variant_name,
        region=data.region,
        context_usage=data.context_usage,
        is_default=data.is_default,
    )
    db.add(sign)
    await db.flush()

    for asset_data in data.assets:
        asset = SignAsset(
            canonical_sign_id=sign.id,
            media_type=asset_data.media_type,
            file_format=asset_data.file_format,
            url=asset_data.url,
            view_angle=asset_data.view_angle,
            step_order=asset_data.step_order,
            content_version=1,
            is_active=True,
            asset_metadata=asset_data.metadata,
        )
        db.add(asset)

    return sign
