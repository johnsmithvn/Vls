"""
Dictionary domain models: Word, CanonicalSign, SignAsset.
Maps exactly to DATABASE.md schema.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Word(Base):
    """Linguistic layer — stores word metadata for Grammar Engine, Search, AI."""

    __tablename__ = "words"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    text_vn: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_text: Mapped[str] = mapped_column(String(255), nullable=False)
    part_of_speech: Mapped[str | None] = mapped_column(String(50), nullable=True)
    difficulty_level: Mapped[int] = mapped_column(Integer, default=1)
    semantic_tags: Mapped[list[str] | None] = mapped_column(
        ARRAY(Text), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    canonical_signs: Mapped[list["CanonicalSign"]] = relationship(
        back_populates="word", cascade="all, delete-orphan"
    )


class CanonicalSign(Base):
    """Variant layer — resolves 1 word → many sign variants (North/South, Formal/Slang)."""

    __tablename__ = "canonical_signs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    word_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("words.id", ondelete="CASCADE"), nullable=False
    )
    variant_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    context_usage: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    word: Mapped["Word"] = relationship(back_populates="canonical_signs")
    assets: Mapped[list["SignAsset"]] = relationship(
        back_populates="canonical_sign", cascade="all, delete-orphan"
    )


class SignAsset(Base):
    """Polymorphic media layer with content versioning."""

    __tablename__ = "sign_assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    canonical_sign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("canonical_signs.id", ondelete="CASCADE"),
        nullable=False,
    )
    media_type: Mapped[str] = mapped_column(String(20), nullable=False)
    file_format: Mapped[str] = mapped_column(String(10), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    view_angle: Mapped[str | None] = mapped_column(String(20), nullable=True)
    step_order: Mapped[int] = mapped_column(Integer, default=1)
    content_version: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    asset_metadata: Mapped[dict | None] = mapped_column(
        "metadata", JSONB, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    canonical_sign: Mapped["CanonicalSign"] = relationship(back_populates="assets")
