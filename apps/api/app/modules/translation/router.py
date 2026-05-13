"""
Translation router — sentence translation endpoint.
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.security import get_optional_user
from app.modules.translation.schemas import TranslateRequest
from app.modules.translation.service import translate_text

router = APIRouter()


@router.post("/translate")
async def translate(
    body: TranslateRequest,
    user_id: uuid.UUID | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Translate Vietnamese text to sign language sequence.
    Works both authenticated and anonymous.
    Fingerspell fallbacks are logged for data-driven vocabulary growth.
    """
    result = await translate_text(db, body.text, mode=body.mode, user_id=user_id)
    return {
        "success": True,
        "message": "Translation completed",
        "data": result,
        "meta": None,
    }
