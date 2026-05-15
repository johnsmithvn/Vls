"""add_entry_type_categories_review

Revision ID: 002
Revises: 001
Create Date: 2026-05-15

Adds:
- words.entry_type (word/phrase/sentence)
- words.status (draft/pending/approved/published/rejected) — Maker-Checker pipeline
- words.contributed_by, reviewed_by, reviewed_at — Review tracking
- words.updated_at — Timestamp tracking
- canonical_signs.region (north/central/south/standard)
- categories table — Semantic categorization for browse UI
- word_categories table — Many-to-many bridge
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── words: Add new columns ──────────────────────────────────
    op.add_column("words", sa.Column("entry_type", sa.String(20), nullable=False, server_default="word"))
    op.add_column("words", sa.Column("status", sa.String(20), nullable=False, server_default="published"))
    op.add_column("words", sa.Column("contributed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True))
    op.add_column("words", sa.Column("reviewed_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True))
    op.add_column("words", sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("words", sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))

    # Index on entry_type for filtered queries
    op.create_index("idx_words_entry_type", "words", ["entry_type"])
    # Index on status for published-only queries
    op.create_index("idx_words_status", "words", ["status"])

    # ── canonical_signs: Add region ────────────────────────────
    op.add_column("canonical_signs", sa.Column("region", sa.String(20), nullable=True))

    # ── categories (NEW) ───────────────────────────────────────
    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("icon", sa.String(50), nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── word_categories (NEW) ──────────────────────────────────
    op.create_table(
        "word_categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("word_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("words.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id", ondelete="CASCADE"), nullable=False),
        sa.UniqueConstraint("word_id", "category_id"),
    )
    op.create_index("idx_word_categories_word", "word_categories", ["word_id"])
    op.create_index("idx_word_categories_category", "word_categories", ["category_id"])


def downgrade() -> None:
    op.drop_table("word_categories")
    op.drop_table("categories")
    op.drop_column("canonical_signs", "region")
    op.drop_index("idx_words_status", "words")
    op.drop_index("idx_words_entry_type", "words")
    op.drop_column("words", "updated_at")
    op.drop_column("words", "reviewed_at")
    op.drop_column("words", "reviewed_by")
    op.drop_column("words", "contributed_by")
    op.drop_column("words", "status")
    op.drop_column("words", "entry_type")
