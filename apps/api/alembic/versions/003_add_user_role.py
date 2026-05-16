"""add_user_role

Revision ID: 003
Revises: 002
Create Date: 2026-05-16

Adds:
- users.role (owner/contributor/user) — Role-based access control for Admin CMS
"""

from alembic import op
import sqlalchemy as sa

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("role", sa.String(20), nullable=False, server_default="user"),
    )
    op.create_index("idx_users_role", "users", ["role"])


def downgrade() -> None:
    op.drop_index("idx_users_role", "users")
    op.drop_column("users", "role")
