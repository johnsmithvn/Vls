"""
Dictionary domain models: Word, CanonicalSign, SignAsset, Category, WordCategory.
Maps to the Structured Sign Knowledge Graph architecture.

Layers:
  Word (Linguistic) → CanonicalSign (Variant/Dialect) → SignAsset (Media)
  Word ←→ Category (many-to-many via WordCategory)
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
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Word(Base):
    """Linguistic layer — stores word/phrase/sentence metadata.

    entry_type: 'word' | 'phrase' | 'sentence'
    status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected'
    """

    __tablename__ = "words"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    text_vn: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_text: Mapped[str] = mapped_column(String(255), nullable=False)
    entry_type: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="word"
    )
    part_of_speech: Mapped[str | None] = mapped_column(String(50), nullable=True)
    difficulty_level: Mapped[int] = mapped_column(Integer, default=1)
    semantic_tags: Mapped[list[str] | None] = mapped_column(
        ARRAY(Text), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Maker-Checker review pipeline (UI deferred, schema ready)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, server_default="published"
    )
    contributed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    canonical_signs: Mapped[list["CanonicalSign"]] = relationship(
        back_populates="word", cascade="all, delete-orphan"
    )
    word_categories: Mapped[list["WordCategory"]] = relationship(
        back_populates="word", cascade="all, delete-orphan"
    )


class CanonicalSign(Base):
    """Variant layer — resolves 1 word → many sign variants (North/South, Formal/Slang).

    region: 'north' | 'central' | 'south' | 'standard' | NULL
    """

    __tablename__ = "canonical_signs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    word_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("words.id", ondelete="CASCADE"), nullable=False
    )
    variant_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    region: Mapped[str | None] = mapped_column(String(20), nullable=True)
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


class Category(Base):
    """Semantic categorization — groups words by topic (Y tế, Gia đình, Trường học...).

    Used for Browse UI on the Dictionary landing page.
    """

    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    word_categories: Mapped[list["WordCategory"]] = relationship(
        back_populates="category"
    )


class WordCategory(Base):
    """Many-to-many bridge between Word and Category."""

    __tablename__ = "word_categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    word_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("words.id", ondelete="CASCADE"),
        nullable=False,
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
    )

    __table_args__ = (UniqueConstraint("word_id", "category_id"),)

    # Relationships
    word: Mapped["Word"] = relationship(back_populates="word_categories")
    category: Mapped["Category"] = relationship(back_populates="word_categories")
