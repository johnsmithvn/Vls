"""
Dictionary schemas — Pydantic DTOs.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel


# ── Category ─────────────────────────────────────────────────

class CategoryResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None = None
    icon: str | None = None
    display_order: int = 0

    model_config = {"from_attributes": True}


class CategoryListResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    icon: str | None = None
    display_order: int = 0
    word_count: int = 0

    model_config = {"from_attributes": True}


# ── SignAsset ────────────────────────────────────────────────

class SignAssetResponse(BaseModel):
    id: uuid.UUID
    media_type: str
    file_format: str
    url: str
    view_angle: str | None
    step_order: int
    content_version: int
    asset_metadata: dict | None = None

    model_config = {"from_attributes": True}


# ── CanonicalSign ────────────────────────────────────────────

class CanonicalSignResponse(BaseModel):
    id: uuid.UUID
    variant_name: str | None
    region: str | None
    context_usage: str | None
    is_default: bool
    assets: list[SignAssetResponse]

    model_config = {"from_attributes": True}


# ── Word ─────────────────────────────────────────────────────

class WordDetailResponse(BaseModel):
    id: uuid.UUID
    text_vn: str
    normalized_text: str
    entry_type: str
    part_of_speech: str | None
    difficulty_level: int
    semantic_tags: list[str] | None
    description: str | None
    categories: list[CategoryResponse] = []
    canonical_signs: list[CanonicalSignResponse]

    model_config = {"from_attributes": True}


class WordSearchResult(BaseModel):
    id: uuid.UUID
    text_vn: str
    entry_type: str
    part_of_speech: str | None
    difficulty_level: int
    description: str | None = None

    model_config = {"from_attributes": True}


class WordBrowseItem(BaseModel):
    """Lightweight item for browse/listing views."""
    id: uuid.UUID
    text_vn: str
    entry_type: str
    part_of_speech: str | None
    difficulty_level: int
    description: str | None = None
    has_video: bool = False

    model_config = {"from_attributes": True}
