"""
Notebook schemas — Bookmark DTOs.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel


class BookmarkCreate(BaseModel):
    word_id: uuid.UUID


class BookmarkResponse(BaseModel):
    id: uuid.UUID
    word_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
