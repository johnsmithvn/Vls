"""
Dictionary schemas — Pydantic DTOs.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel


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


class CanonicalSignResponse(BaseModel):
    id: uuid.UUID
    variant_name: str | None
    context_usage: str | None
    is_default: bool
    assets: list[SignAssetResponse]

    model_config = {"from_attributes": True}


class WordDetailResponse(BaseModel):
    id: uuid.UUID
    text_vn: str
    normalized_text: str
    part_of_speech: str | None
    difficulty_level: int
    semantic_tags: list[str] | None
    description: str | None
    canonical_signs: list[CanonicalSignResponse]

    model_config = {"from_attributes": True}


class WordSearchResult(BaseModel):
    id: uuid.UUID
    text_vn: str
    part_of_speech: str | None
    difficulty_level: int

    model_config = {"from_attributes": True}
