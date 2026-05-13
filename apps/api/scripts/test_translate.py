"""Quick test for translation pipeline."""
import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.modules.translation.service import translate_text
from app.db.session import async_session_factory
# Import all models so SQLAlchemy resolves FK references
import app.modules.auth.models  # noqa: F401
import app.modules.dictionary.models  # noqa: F401
import app.modules.translation.models  # noqa: F401


async def test():
    async with async_session_factory() as db:
        # Test 1: Known Vietnamese words (with diacritics)
        r = await translate_text(db, "Tôi đi học")
        print("=== Test 1: 'Toi di hoc' ===")
        print(f"Tokens: {r['tokens']}")
        print(f"Stats: {r['stats']}")
        for t in r["results"]:
            print(f"  {t['token']} -> {t['result_type']}")

        print()

        # Test 2: Phrase match
        r2 = await translate_text(db, "Xin chao ban")
        print("=== Test 2: 'Xin chao ban' ===")
        print(f"Tokens: {r2['tokens']}")
        print(f"Stats: {r2['stats']}")
        for t in r2["results"]:
            print(f"  {t['token']} -> {t['result_type']}")

        print()

        # Test 3: Unknown word (triggers fingerspell)
        r3 = await translate_text(db, "blockchain")
        print("=== Test 3: 'blockchain' (unknown) ===")
        print(f"Tokens: {r3['tokens']}")
        print(f"Stats: {r3['stats']}")
        for t in r3["results"]:
            if t["letters"]:
                letters_str = " ".join([l["token"] for l in t["letters"]])
                print(f"  {t['token']} -> {t['result_type']} -> [{letters_str}]")
            else:
                print(f"  {t['token']} -> {t['result_type']}")

        print()

        # Test 4: Mixed known + unknown
        r4 = await translate_text(db, "Mẹ yêu con")
        print("=== Test 4: 'Me yeu con' ===")
        print(f"Tokens: {r4['tokens']}")
        print(f"Stats: {r4['stats']}")
        for t in r4["results"]:
            print(f"  {t['token']} -> {t['result_type']}")

        await db.commit()


if __name__ == "__main__":
    asyncio.run(test())
