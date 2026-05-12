"""
Media router — upload endpoints (admin-only).
"""

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.modules.media.schemas import UploadUrlRequest, UploadUrlResponse
from app.modules.media.service import generate_presigned_upload_url

router = APIRouter()


@router.post("/upload-url", response_model=dict, status_code=201)
async def create_upload_url(
    body: UploadUrlRequest,
    user_id: uuid.UUID = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generate a pre-signed URL for direct upload to R2.
    Admin-only in production (role check deferred to Sprint 1.3).
    """
    presigned_url, public_url = generate_presigned_upload_url(
        filename=body.filename,
        content_type=body.content_type,
    )

    asset_id = uuid.uuid4()

    return {
        "success": True,
        "message": "Upload URL generated",
        "data": UploadUrlResponse(
            asset_id=asset_id,
            presigned_url=presigned_url,
            public_url=public_url,
        ).model_dump(mode="json"),
        "meta": None,
    }
