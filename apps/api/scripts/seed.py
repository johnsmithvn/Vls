"""
Seed script — populate database with initial data.
Run: poetry run python scripts/seed.py

Creates:
- 29 Vietnamese alphabet letters (words + canonical_signs)
- ~30 core vocabulary words with canonical signs
"""

import asyncio
import uuid

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Add parent dir to path so app imports work
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import async_session_factory, engine
from app.db.base import Base
from app.modules.dictionary.models import Word, CanonicalSign, SignAsset
from app.modules.auth.models import User


# ── Alphabet Data ────────────────────────────────────────────

ALPHABET = [
    ("A", "Nắm tay, ngón cái sang ngang"),
    ("Ă", "Giống A, thêm dấu trăng"),
    ("Â", "Giống A, thêm dấu mũ"),
    ("B", "Bàn tay mở, ngón cái gập"),
    ("C", "Bàn tay cong hình chữ C"),
    ("D", "Ngón trỏ thẳng, còn lại nắm"),
    ("Đ", "Giống D, ngón trỏ gạch ngang"),
    ("E", "Các ngón gập tạo hình E"),
    ("Ê", "Giống E, thêm dấu mũ"),
    ("G", "Ngón trỏ + cái chỉ ngang"),
    ("H", "Hai ngón trỏ + giữa thẳng"),
    ("I", "Ngón út thẳng, còn lại nắm"),
    ("K", "Ngón trỏ + giữa chữ V, cái chạm giữa"),
    ("L", "Ngón cái + trỏ thẳng góc 90°"),
    ("M", "Ba ngón gập trên ngón cái"),
    ("N", "Hai ngón gập trên ngón cái"),
    ("O", "Các ngón chạm cái tạo hình O"),
    ("Ô", "Giống O, thêm dấu mũ"),
    ("Ơ", "Giống O, thêm dấu móc"),
    ("P", "Giống K, úp xuống"),
    ("Q", "Giống G, úp xuống"),
    ("R", "Ngón trỏ + giữa bắt chéo"),
    ("S", "Nắm tay, ngón cái phía trước"),
    ("T", "Ngón cái kẹp giữa trỏ + giữa"),
    ("U", "Ngón trỏ + giữa thẳng sát nhau"),
    ("Ư", "Giống U, thêm dấu móc"),
    ("V", "Ngón trỏ + giữa xòe hình V"),
    ("X", "Ngón trỏ gập hình móc câu"),
    ("Y", "Ngón cái + út xòe, còn lại nắm"),
]

# ── Core Vocabulary ──────────────────────────────────────────

VOCABULARY = [
    # Greetings (Phrase tier)
    {"text": "Xin chào", "pos": "thán từ", "level": 1, "tags": ["chào hỏi", "cơ bản"], "desc": "Lời chào phổ biến nhất"},
    {"text": "Tạm biệt", "pos": "thán từ", "level": 1, "tags": ["chào hỏi", "cơ bản"], "desc": "Lời tạm biệt"},
    {"text": "Cảm ơn", "pos": "động từ", "level": 1, "tags": ["chào hỏi", "lịch sự"], "desc": "Bày tỏ lòng biết ơn"},
    {"text": "Xin lỗi", "pos": "động từ", "level": 1, "tags": ["chào hỏi", "lịch sự"], "desc": "Bày tỏ sự xin lỗi"},
    {"text": "Không có gì", "pos": "thán từ", "level": 1, "tags": ["chào hỏi", "lịch sự"], "desc": "Đáp lại lời cảm ơn"},

    # Pronouns
    {"text": "Tôi", "pos": "đại từ", "level": 1, "tags": ["đại từ", "cơ bản"], "desc": "Ngôi thứ nhất số ít"},
    {"text": "Bạn", "pos": "đại từ", "level": 1, "tags": ["đại từ", "cơ bản"], "desc": "Ngôi thứ hai số ít"},
    {"text": "Anh", "pos": "đại từ", "level": 1, "tags": ["đại từ", "gia đình"], "desc": "Anh trai / xưng hô nam giới lớn tuổi hơn"},
    {"text": "Chị", "pos": "đại từ", "level": 1, "tags": ["đại từ", "gia đình"], "desc": "Chị gái / xưng hô nữ giới lớn tuổi hơn"},
    {"text": "Chúng tôi", "pos": "đại từ", "level": 2, "tags": ["đại từ"], "desc": "Ngôi thứ nhất số nhiều"},

    # Family
    {"text": "Bố", "pos": "danh từ", "level": 1, "tags": ["gia đình", "cơ bản"], "desc": "Cha"},
    {"text": "Mẹ", "pos": "danh từ", "level": 1, "tags": ["gia đình", "cơ bản"], "desc": "Mẹ"},
    {"text": "Con", "pos": "danh từ", "level": 1, "tags": ["gia đình", "cơ bản"], "desc": "Con cái"},
    {"text": "Gia đình", "pos": "danh từ", "level": 1, "tags": ["gia đình"], "desc": "Gia đình"},

    # Common verbs
    {"text": "Ăn", "pos": "động từ", "level": 1, "tags": ["động từ", "sinh hoạt"], "desc": "Hành động ăn uống"},
    {"text": "Uống", "pos": "động từ", "level": 1, "tags": ["động từ", "sinh hoạt"], "desc": "Hành động uống"},
    {"text": "Đi", "pos": "động từ", "level": 1, "tags": ["động từ", "di chuyển"], "desc": "Hành động đi"},
    {"text": "Ngủ", "pos": "động từ", "level": 1, "tags": ["động từ", "sinh hoạt"], "desc": "Hành động ngủ"},
    {"text": "Học", "pos": "động từ", "level": 1, "tags": ["động từ", "giáo dục"], "desc": "Hành động học tập"},
    {"text": "Làm việc", "pos": "động từ", "level": 2, "tags": ["động từ", "công việc"], "desc": "Hành động làm việc"},
    {"text": "Yêu", "pos": "động từ", "level": 1, "tags": ["động từ", "cảm xúc"], "desc": "Tình yêu"},
    {"text": "Thích", "pos": "động từ", "level": 1, "tags": ["động từ", "cảm xúc"], "desc": "Sự yêu thích"},

    # Common nouns
    {"text": "Nhà", "pos": "danh từ", "level": 1, "tags": ["danh từ", "nơi chốn"], "desc": "Ngôi nhà"},
    {"text": "Trường học", "pos": "danh từ", "level": 1, "tags": ["danh từ", "giáo dục"], "desc": "Trường học"},
    {"text": "Bệnh viện", "pos": "danh từ", "level": 2, "tags": ["danh từ", "y tế"], "desc": "Bệnh viện"},
    {"text": "Nước", "pos": "danh từ", "level": 1, "tags": ["danh từ", "đồ uống"], "desc": "Nước uống"},
    {"text": "Cơm", "pos": "danh từ", "level": 1, "tags": ["danh từ", "thức ăn"], "desc": "Cơm / bữa ăn"},

    # Questions
    {"text": "Cái gì", "pos": "đại từ", "level": 1, "tags": ["câu hỏi", "cơ bản"], "desc": "Hỏi về vật"},
    {"text": "Ở đâu", "pos": "phó từ", "level": 1, "tags": ["câu hỏi", "cơ bản"], "desc": "Hỏi về nơi chốn"},
    {"text": "Tại sao", "pos": "phó từ", "level": 2, "tags": ["câu hỏi"], "desc": "Hỏi lý do"},

    # Adjectives
    {"text": "Đẹp", "pos": "tính từ", "level": 1, "tags": ["tính từ", "mô tả"], "desc": "Xinh đẹp"},
    {"text": "Tốt", "pos": "tính từ", "level": 1, "tags": ["tính từ", "mô tả"], "desc": "Tốt lành"},
    {"text": "Vui", "pos": "tính từ", "level": 1, "tags": ["tính từ", "cảm xúc"], "desc": "Vui vẻ"},
    {"text": "Buồn", "pos": "tính từ", "level": 1, "tags": ["tính từ", "cảm xúc"], "desc": "Buồn bã"},
]


def normalize(text: str) -> str:
    """Simple Vietnamese text normalization."""
    return text.lower().strip()


async def seed():
    async with async_session_factory() as db:
        # Check if already seeded
        result = await db.execute(text("SELECT COUNT(*) FROM words"))
        count = result.scalar()
        if count and count > 0:
            print(f"⚠️  Database already has {count} words. Skipping seed.")
            print("   To re-seed, run: poetry run python scripts/truncate.py")
            return

        print("🌱 Seeding database...")

        # ── Alphabet ─────────────────────────────────────────
        print(f"   📝 Adding {len(ALPHABET)} alphabet letters...")
        for letter, mnemonic in ALPHABET:
            word = Word(
                text_vn=letter,
                normalized_text=normalize(letter),
                part_of_speech="chữ cái",
                difficulty_level=1,
                semantic_tags=["bảng chữ cái"],
                description=mnemonic,
            )
            db.add(word)
            await db.flush()

            sign = CanonicalSign(
                word_id=word.id,
                variant_name="Chuẩn",
                is_default=True,
            )
            db.add(sign)

        # ── Vocabulary ───────────────────────────────────────
        print(f"   📚 Adding {len(VOCABULARY)} vocabulary words...")
        for v in VOCABULARY:
            word = Word(
                text_vn=v["text"],
                normalized_text=normalize(v["text"]),
                part_of_speech=v["pos"],
                difficulty_level=v["level"],
                semantic_tags=v["tags"],
                description=v["desc"],
            )
            db.add(word)
            await db.flush()

            sign = CanonicalSign(
                word_id=word.id,
                variant_name="Chuẩn",
                is_default=True,
            )
            db.add(sign)

        await db.commit()
        total = len(ALPHABET) + len(VOCABULARY)
        print(f"   ✅ Done! Seeded {total} words ({len(ALPHABET)} letters + {len(VOCABULARY)} vocabulary)")


if __name__ == "__main__":
    asyncio.run(seed())
