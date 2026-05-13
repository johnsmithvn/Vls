"""
Translation service — orchestrates tokenization + resolution + logging.
"""

import uuid
from collections import Counter

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.semantic.tokenizer import tokenize
from app.ai.semantic.resolver import translate, ResultType, ResolvedToken
from app.modules.translation.models import QueryLog


def _to_dict(resolved: ResolvedToken) -> dict:
    """Convert ResolvedToken dataclass to serializable dict."""
    result = {
        "token": resolved.token,
        "result_type": resolved.result_type.value,
        "word_id": resolved.word_id,
        "sign": None,
        "letters": None,
    }

    if resolved.sign:
        result["sign"] = {
            "sign_id": resolved.sign.sign_id,
            "variant_name": resolved.sign.variant_name,
            "assets": resolved.sign.assets,
        }

    if resolved.letters:
        result["letters"] = [_to_dict(letter) for letter in resolved.letters]

    return result


async def translate_text(
    db: AsyncSession,
    text: str,
    mode: str = "auto",
    user_id: uuid.UUID | None = None,
) -> dict:
    """
    Full translation pipeline:
    1. Tokenize Vietnamese text
    2. Resolve each token through 3-tier pipeline (respecting mode)
    3. Log fingerspell tokens for data-driven growth
    4. Return structured response
    """
    # Step 1: Tokenize
    tokens = tokenize(text)

    # Step 2: Resolve with mode
    resolved = await translate(db, tokens, mode=mode)

    # Step 3: Log fingerspell tokens
    for r in resolved:
        if r.result_type == ResultType.FINGERSPELL:
            log = QueryLog(
                query_text=text,
                token_text=r.token,
                result_type=r.result_type.value,
                user_id=user_id,
            )
            db.add(log)

    # Step 4: Build stats
    type_counts = Counter(r.result_type.value for r in resolved)

    return {
        "original_text": text,
        "tokens": tokens,
        "results": [_to_dict(r) for r in resolved],
        "stats": {
            "total_tokens": len(tokens),
            "phrase_match": type_counts.get("phrase_match", 0),
            "word_match": type_counts.get("word_match", 0),
            "fingerspell": type_counts.get("fingerspell", 0),
            "coverage": round(
                (type_counts.get("phrase_match", 0) + type_counts.get("word_match", 0))
                / max(len(tokens), 1)
                * 100,
                1,
            ),
        },
    }
