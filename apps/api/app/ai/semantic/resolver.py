"""
3-Tier Resolution Engine — Core translation logic.

Pipeline:
  Input: "Mình đi học nha"
  Tokenize → ["mình", "đi", "học"]
  For each token → resolve:
    Tier 1: phrase_match  → "xin chào" matches as a phrase
    Tier 2: word_match    → "học" matches a word entry
    Tier 3: fingerspell   → unknown word → spell letter by letter

Modes:
  auto         → Full 3-tier pipeline (default)
  word_by_word → Skip phrase matching, only word → fingerspell
  fingerspell  → Force fingerspell for all tokens

Output: list of ResolvedToken with result_type + media references.
"""

from dataclasses import dataclass, field
from enum import Enum

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.dictionary.models import Word, CanonicalSign, SignAsset


class ResultType(str, Enum):
    PHRASE_MATCH = "phrase_match"
    WORD_MATCH = "word_match"
    FINGERSPELL = "fingerspell"


@dataclass
class ResolvedSign:
    """A single sign to display."""
    sign_id: str | None
    assets: list[dict] = field(default_factory=list)
    variant_name: str | None = None


@dataclass
class ResolvedToken:
    """Result of resolving a single token through the 3-tier pipeline."""
    token: str
    result_type: ResultType
    word_id: str | None = None
    sign: ResolvedSign | None = None
    letters: list["ResolvedToken"] | None = None  # For fingerspell


def _extract_sign_data(word: Word) -> ResolvedSign | None:
    """Extract default sign data from a Word with loaded relationships."""
    default_sign = next(
        (s for s in word.canonical_signs if s.is_default),
        word.canonical_signs[0] if word.canonical_signs else None,
    )
    if not default_sign:
        return None

    return ResolvedSign(
        sign_id=str(default_sign.id),
        variant_name=default_sign.variant_name,
        assets=[
            {
                "id": str(a.id),
                "media_type": a.media_type,
                "url": a.url,
                "file_format": a.file_format,
                "view_angle": a.view_angle,
                "step_order": a.step_order,
                "metadata": a.metadata,
            }
            for a in sorted(default_sign.assets, key=lambda x: x.step_order)
        ],
    )


def _word_query_options():
    """Reusable eager-load options for Word → CanonicalSign → SignAsset."""
    return selectinload(Word.canonical_signs).selectinload(
        CanonicalSign.assets.and_(SignAsset.is_active == True)
    )


async def _resolve_fingerspell(db: AsyncSession, token: str) -> ResolvedToken:
    """Tier 3: Break token into letters, resolve each letter individually."""
    letters = list(token.upper())
    resolved_letters: list[ResolvedToken] = []

    for letter in letters:
        letter_stmt = (
            select(Word)
            .where(
                Word.normalized_text == letter.lower(),
                Word.part_of_speech == "chữ cái",
            )
            .options(_word_query_options())
        )
        letter_result = await db.execute(letter_stmt)
        letter_word = letter_result.scalar_one_or_none()

        if letter_word:
            resolved_letters.append(
                ResolvedToken(
                    token=letter,
                    result_type=ResultType.WORD_MATCH,
                    word_id=str(letter_word.id),
                    sign=_extract_sign_data(letter_word),
                )
            )
        else:
            # Letter not in DB — still include for display
            resolved_letters.append(
                ResolvedToken(
                    token=letter,
                    result_type=ResultType.FINGERSPELL,
                )
            )

    return ResolvedToken(
        token=token,
        result_type=ResultType.FINGERSPELL,
        letters=resolved_letters,
    )


async def resolve_token(
    db: AsyncSession,
    token: str,
    mode: str = "auto",
) -> ResolvedToken:
    """
    Resolve a single token through the 3-tier pipeline.

    Modes:
      auto         → Tier 1 (phrase_match) → Tier 2 (word_match) → Tier 3 (fingerspell)
      word_by_word → Tier 2 (word_match) → Tier 3 (fingerspell) — skips phrase matching
      fingerspell  → Tier 3 directly — forces fingerspell for every token
    """
    # ── Mode: fingerspell → skip DB lookup entirely ──────────
    if mode == "fingerspell":
        return await _resolve_fingerspell(db, token)

    # ── Tier 1 & 2: DB lookup ────────────────────────────────
    stmt = (
        select(Word)
        .where(Word.normalized_text == token.lower())
        .options(_word_query_options())
    )
    result = await db.execute(stmt)
    word = result.scalar_one_or_none()

    if word:
        is_phrase = " " in token
        result_type = ResultType.PHRASE_MATCH if is_phrase else ResultType.WORD_MATCH

        # Mode: word_by_word → demote phrase_match to individual word lookups
        if mode == "word_by_word" and is_phrase:
            return await _resolve_fingerspell(db, token)

        return ResolvedToken(
            token=token,
            result_type=result_type,
            word_id=str(word.id),
            sign=_extract_sign_data(word),
        )

    # ── Tier 3: Fingerspell fallback ─────────────────────────
    return await _resolve_fingerspell(db, token)


async def translate(
    db: AsyncSession,
    tokens: list[str],
    mode: str = "auto",
) -> list[ResolvedToken]:
    """Resolve a list of tokens through the 3-tier pipeline with mode support."""
    results: list[ResolvedToken] = []
    for token in tokens:
        resolved = await resolve_token(db, token, mode=mode)
        results.append(resolved)
    return results
