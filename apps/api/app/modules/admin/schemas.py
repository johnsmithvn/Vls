"""
Admin schemas — Pydantic DTOs for word/sign/asset CRUD operations.
"""

import uuid

from pydantic import BaseModel, Field


# ── Word CRUD ────────────────────────────────────────────────

class SignAssetCreate(BaseModel):
    """Create/update a sign asset (video link, image, etc.)."""
    media_type: str = Field(..., description="image | video | 3d_model")
    file_format: str = Field(..., description="mp4 | webm | png | glb | gdrive | youtube")
    url: str = Field(..., description="Direct URL, Google Drive link, or YouTube link")
    view_angle: str | None = Field(None, description="front | side")
    step_order: int = Field(1, ge=1)
    metadata: dict | None = None


class CanonicalSignCreate(BaseModel):
    """Create/update a canonical sign variant."""
    variant_name: str | None = Field(None, description="Chuẩn, Miền Bắc, etc.")
    region: str | None = Field(None, description="north | central | south | standard")
    context_usage: str | None = None
    is_default: bool = False
    assets: list[SignAssetCreate] = []


class WordCreate(BaseModel):
    """Create a new word entry."""
    text_vn: str = Field(..., min_length=1, max_length=255)
    entry_type: str = Field("word", description="word | phrase | sentence")
    part_of_speech: str | None = None
    difficulty_level: int = Field(1, ge=1, le=5)
    semantic_tags: list[str] = []
    description: str | None = None
    category_ids: list[uuid.UUID] = []
    canonical_signs: list[CanonicalSignCreate] = []


class WordUpdate(BaseModel):
    """Update an existing word entry. All fields optional."""
    text_vn: str | None = Field(None, min_length=1, max_length=255)
    entry_type: str | None = None
    part_of_speech: str | None = None
    difficulty_level: int | None = Field(None, ge=1, le=5)
    semantic_tags: list[str] | None = None
    description: str | None = None
    category_ids: list[uuid.UUID] | None = None
    canonical_signs: list[CanonicalSignCreate] | None = None


# ── Admin List Item ──────────────────────────────────────────

class AdminWordListItem(BaseModel):
    """Lightweight word item for admin listing."""
    id: uuid.UUID
    text_vn: str
    entry_type: str
    part_of_speech: str | None
    difficulty_level: int
    status: str
    has_video: bool = False
    category_names: list[str] = []
    created_at: str | None = None

    model_config = {"from_attributes": True}


# ── Category CRUD ────────────────────────────────────────────

class CategoryCreate(BaseModel):
    """Create a new category."""
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    icon: str | None = None
    display_order: int = 0


class CategoryUpdate(BaseModel):
    """Update a category."""
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    icon: str | None = None
    display_order: int | None = None


# ── Dashboard Stats ──────────────────────────────────────────

class AdminDashboardStats(BaseModel):
    """Dashboard statistics."""
    total_words: int = 0
    total_phrases: int = 0
    total_sentences: int = 0
    total_categories: int = 0
    total_videos: int = 0
    total_images: int = 0
