"""init_core_schema

Revision ID: 001
Revises:
Create Date: 2026-05-13

Creates all 6 core tables:
- words (Linguistic Layer)
- canonical_signs (Variant Layer)
- sign_assets (Polymorphic Media)
- users (Auth)
- user_bookmarks (Per-user data)
- query_logs (Data-driven Growth)
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable extensions
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')

    # words
    op.create_table(
        "words",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("text_vn", sa.String(255), nullable=False),
        sa.Column("normalized_text", sa.String(255), nullable=False),
        sa.Column("part_of_speech", sa.String(50), nullable=True),
        sa.Column("difficulty_level", sa.Integer(), server_default="1"),
        sa.Column("semantic_tags", postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_words_normalized", "words", ["normalized_text"], postgresql_using="gin", postgresql_ops={"normalized_text": "gin_trgm_ops"})
    op.create_index("idx_words_semantic_tags", "words", ["semantic_tags"], postgresql_using="gin")

    # canonical_signs
    op.create_table(
        "canonical_signs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("word_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("words.id", ondelete="CASCADE"), nullable=False),
        sa.Column("variant_name", sa.String(100), nullable=True),
        sa.Column("context_usage", sa.String(100), nullable=True),
        sa.Column("is_default", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # sign_assets
    op.create_table(
        "sign_assets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("canonical_sign_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("canonical_signs.id", ondelete="CASCADE"), nullable=False),
        sa.Column("media_type", sa.String(20), nullable=False),
        sa.Column("file_format", sa.String(10), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("view_angle", sa.String(20), nullable=True),
        sa.Column("step_order", sa.Integer(), server_default="1"),
        sa.Column("content_version", sa.Integer(), server_default="1"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("metadata", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # users
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("display_name", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # user_bookmarks
    op.create_table(
        "user_bookmarks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("word_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("words.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "word_id"),
    )

    # query_logs
    op.create_table(
        "query_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("query_text", sa.String(500), nullable=False),
        sa.Column("token_text", sa.String(255), nullable=False),
        sa.Column("result_type", sa.String(20), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_query_logs_token", "query_logs", ["token_text"])
    op.create_index("idx_query_logs_type", "query_logs", ["result_type"])


def downgrade() -> None:
    op.drop_table("query_logs")
    op.drop_table("user_bookmarks")
    op.drop_table("users")
    op.drop_table("sign_assets")
    op.drop_table("canonical_signs")
    op.drop_table("words")
