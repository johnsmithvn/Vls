"""
Vietnamese text tokenizer using underthesea.
Handles: word segmentation, normalization, stop-word removal.
"""

import re
from underthesea import word_tokenize

# Common Vietnamese stop words (particles, conjunctions)
STOP_WORDS = {
    "à", "ạ", "á", "ấy", "bị", "bởi", "các", "cả", "cho", "của",
    "cùng", "cũng", "đã", "đang", "để", "đều", "đi", "được", "hay",
    "hoặc", "là", "lại", "lên", "mà", "mỗi", "một", "này", "và",
    "với", "vẫn", "vào", "vì", "về", "từ", "theo", "thì", "sẽ",
    "nha", "nhé", "nhỉ", "ơi", "rồi", "nè", "nào", "hả", "hở",
    "thôi", "đó", "đây", "kia", "ấy",
}


def normalize_text(text: str) -> str:
    """Lowercase + collapse whitespace + strip punctuation edges."""
    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    return text


def tokenize(text: str, remove_stopwords: bool = True) -> list[str]:
    """
    Tokenize Vietnamese text into meaningful tokens.

    Pipeline:
    1. Normalize input
    2. underthesea word segmentation
    3. Optional stop-word removal
    4. Return clean token list

    Examples:
        tokenize("Mình đi học nha") → ["mình", "đi", "học"]
        tokenize("Xin chào bạn") → ["xin chào", "bạn"]
    """
    normalized = normalize_text(text)
    if not normalized:
        return []

    # underthesea auto-detects compound words (e.g. "xin chào" stays together)
    tokens = word_tokenize(normalized, format="list")

    # Replace underscores from underthesea compound words (e.g. "xin_chào" → "xin chào")
    tokens = [t.replace("_", " ") for t in tokens]

    if remove_stopwords:
        tokens = [t for t in tokens if t not in STOP_WORDS]

    # Remove empty/whitespace-only tokens
    tokens = [t.strip() for t in tokens if t.strip()]

    return tokens
