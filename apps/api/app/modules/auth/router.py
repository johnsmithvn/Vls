"""
Auth router — user profile endpoints.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.modules.auth.schemas import UserResponse
from app.modules.auth.service import upsert_user

router = APIRouter()


@router.get("/me", response_model=dict)
async def get_me(
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user profile. Creates user on first call (upsert)."""
    user = await upsert_user(db, user_id)
    return {
        "success": True,
        "message": "User profile retrieved",
        "data": UserResponse.model_validate(user).model_dump(mode="json"),
        "meta": None,
    }
