"""
Auth service — user upsert on first login.
"""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User


async def upsert_user(db: AsyncSession, user_id: uuid.UUID, display_name: str | None = None) -> User:
    """Create user if not exists, return existing otherwise."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        user = User(id=user_id, display_name=display_name)
        db.add(user)
        await db.flush()

    return user
