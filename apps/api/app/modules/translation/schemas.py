"""
Translation schemas — request/response DTOs.
"""

from pydantic import BaseModel, Field


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500, description="Vietnamese text to translate")
    mode: str = Field("auto", description="Translation mode: 'auto' | 'word_by_word' | 'fingerspell'")


class SignAssetDTO(BaseModel):
    id: str
    media_type: str
    url: str
    file_format: str
    view_angle: str | None
    step_order: int


class ResolvedSignDTO(BaseModel):
    sign_id: str | None
    assets: list[SignAssetDTO]
    variant_name: str | None


class ResolvedTokenDTO(BaseModel):
    token: str
    result_type: str  # "phrase_match" | "word_match" | "fingerspell"
    word_id: str | None = None
    sign: ResolvedSignDTO | None = None
    letters: list["ResolvedTokenDTO"] | None = None


class TranslateResponse(BaseModel):
    original_text: str
    tokens: list[str]
    results: list[ResolvedTokenDTO]
    stats: dict
