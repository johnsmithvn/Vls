# Changelog

Tất cả thay đổi đáng chú ý sẽ được ghi tại đây.

Format: [Semantic Versioning](https://semver.org/)

---

## v0.3.1 — 2026-05-13

### Added
- **Alphabet Placeholder SVGs**: 29 SVG images cho bảng chữ cái ký hiệu (`public/signs/alphabet/`).
- **Seed Media**: `seed.py` giờ tạo `SignAsset` records cho mỗi chữ cái, trỏ tới placeholder SVG.
- **PWA Config**: `manifest.json`, app icons, `viewport` export → cài được lên điện thoại.
- Script `generate_alphabet_svgs.py` để regenerate placeholder images.

### Changed
- `alphabet.json` thêm field `image` cho mỗi chữ cái.
- Alphabet page hiển thị ảnh SVG thật thay vì emoji 🤟 placeholder.
- Detail modal hiển thị ảnh placeholder thay vì text "sẽ thêm sau".
- `layout.tsx` sử dụng `Viewport` export theo đúng Next.js 16 API (fix themeColor warning).

### Fixed
- Duplicate Phase 3 header trong `TASKS.md`.
- Windows console encoding issue trong print statements.

---

## v0.3.0 — 2026-05-13

### Added
- **SignTimelinePlayer** (`SignTimelinePlayer.tsx`): Mini Media Sequencing Engine with auto-advance, Play/Pause, Speed selector (0.5x/1x/1.5x), progress bar, active token highlighting.
- **Translation Mode Selector** (`TranslationModeSelector.tsx`): 3 modes — Tự động (auto), Từng từ (word_by_word), Đánh vần (fingerspell).
- Backend 3-mode resolution: `auto` (full 3-tier), `word_by_word` (skip phrases), `fingerspell` (force all).
- Asset response includes `metadata` field for Timing Engine (`duration_ms`).

### Changed
- `/translate` page integrated with Mode Selector + SignTimelinePlayer (replaces static timeline).
- `TranslationInput` now accepts `mode` parameter.
- `resolver.py` refactored: extracted `_extract_sign_data()` + `_word_query_options()` helpers (DRY).
- `TranslateRequest.mode` aligned with `packages/types/enums.ts` (`auto`/`word_by_word`/`fingerspell`).

### Fixed
- `main.py` version mismatch: `0.1.0` → `0.2.1`.
- Translation router `response_model=dict` removed (redundant, standard contract via return).

### Files Modified
- `apps/api/app/main.py` — version bump
- `apps/api/app/ai/semantic/resolver.py` — mode support + refactor
- `apps/api/app/modules/translation/service.py` — mode passthrough
- `apps/api/app/modules/translation/router.py` — mode passthrough, response_model fix
- `apps/api/app/modules/translation/schemas.py` — mode field alignment
- `apps/web/src/components/features/translation/SignTimelinePlayer.tsx` — [NEW]
- `apps/web/src/components/features/translation/TranslationModeSelector.tsx` — [NEW]
- `apps/web/src/components/features/translation/TranslationUI.tsx` — mode support
- `apps/web/src/lib/api.ts` — TranslationMode type, metadata field
- `apps/web/src/app/translate/page.tsx` — integrated new components

---

## v0.2.1 — 2026-05-13

### Added
- **Translation Page** (`/translate`): Full translation UI with chat-style input, example buttons, color-coded token timeline.
- **TranslationUI components**: `TranslationInput` (useMutation), `SignTimeline` (stats bar), `TokenCard` (color-coded tiers).
- **Nav**: "Dịch câu" added to header navigation (4 items total).

### Changed
- Home page "Dịch câu" card links to `/translate` (removed "Sắp ra mắt" badge).
- **B7 fix**: Alphabet data extracted from component to `src/data/alphabet.json`.
- Header component imports `Languages` icon from lucide-react.

### Files Modified
- `apps/web/src/app/translate/page.tsx` — [NEW]
- `apps/web/src/components/features/translation/TranslationUI.tsx` — [NEW]
- `apps/web/src/data/alphabet.json` — [NEW]
- `apps/web/src/lib/api.ts` — added translation types + `translateText()`.
- `apps/web/src/app/alphabet/page.tsx` — imports from JSON.
- `apps/web/src/app/page.tsx` — updated card link.
- `apps/web/src/components/shared/layout/Header.tsx` — added nav item.

---

## v0.2.0 — 2026-05-13

### Added
- **Vietnamese Tokenizer** (`ai/semantic/tokenizer.py`): underthesea word segmentation + stop-word removal.
- **3-Tier Resolution Engine** (`ai/semantic/resolver.py`): phrase_match → word_match → fingerspell pipeline.
- **Translation API** (`POST /api/v1/translation/translate`): Accepts Vietnamese text, returns resolved sign sequence with coverage stats.
- **QueryLog** auto-logging: Fingerspell fallback tokens logged to `query_logs` for data-driven vocabulary growth.
- **Alphabet Page** (`/alphabet`): Dedicated full-width page with progress bar, flip-all/reset controls, detail modal.

### Changed
- Home page simplified — Alphabet Grid moved to `/alphabet`, Feature Cards now link to respective pages.
- Header updated with active state nav highlighting (3 nav items: Tra cứu, Chữ cái, Sổ tay).
- API routes expanded to 10 total (added `/translation/translate` + `/media/upload-url`).

### Files Modified
- `apps/api/app/main.py` — registered translation + media routers.
- `apps/api/app/ai/semantic/tokenizer.py` — [NEW]
- `apps/api/app/ai/semantic/resolver.py` — [NEW]
- `apps/api/app/modules/translation/` — [NEW] schemas, service, router, models.
- `apps/api/app/modules/media/` — [NEW] schemas, service, router.
- `apps/web/src/app/alphabet/page.tsx` — [NEW]
- `apps/web/src/app/page.tsx` — simplified home page.
- `apps/web/src/components/shared/layout/Header.tsx` — active state nav.

---

## v0.1.0 — 2026-05-12

### Added
- **Monorepo scaffold**: `apps/web` (Next.js 16), `apps/api` (FastAPI), `apps/worker` (Celery), `packages/types`.
- **Docker Compose**: PostgreSQL 16 + Redis 7.
- **Database**: 6 core tables via Alembic migration (`001_init_core_schema`).
- **Auth**: Supabase JWT verification + user upsert on first login.
- **Dictionary API**: Search (ILIKE + trigram) + Word Detail with eager-loaded signs/assets.
- **Notebook API**: CRUD bookmarks per authenticated user.
- **Frontend**: Design system (premium dark mode palette), SearchBar (debounce 300ms), FlipCard (Framer Motion 3D), MediaRenderer, Word Detail page, Notebook page.
- **Seed data**: 29 Vietnamese alphabet letters + 34 core vocabulary words.
- **E2E verified**: Frontend search ↔ API ↔ PostgreSQL working.

### Infrastructure
- Pydantic `BaseSettings` for env config.
- Standard API response contract: `{ success, message, data, meta }`.
- `AppException` + global exception handlers.
