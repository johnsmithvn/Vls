"""
Media schemas — upload DTOs.
"""

import uuid

from pydantic import BaseModel


class UploadUrlRequest(BaseModel):
    filename: str
    media_type: str  # 'image' | 'video'
    content_type: str  # MIME type


class UploadUrlResponse(BaseModel):
    asset_id: uuid.UUID
    presigned_url: str
    public_url: str
