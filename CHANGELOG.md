# Changelog

Tất cả thay đổi đáng chú ý sẽ được ghi tại đây.

Format: [Semantic Versioning](https://semver.org/)

---

## v1.0.0 — 2026-05-15

### ⚠️ BREAKING CHANGES
- **DB Migration 002**: `words` table gains `entry_type`, `status`, `contributed_by`, `reviewed_by`, `reviewed_at`, `updated_at` columns. `canonical_signs` gains `region` column. New tables: `categories`, `word_categories`.
- **Translation page LOCKED**: `/translate` is now a Coming Soon page. All translation components preserved but deactivated.
- **Nav restructured**: Removed "Sổ tay" from nav. Added "Từ điển" nav item. "Dịch câu" shows "Soon" badge.

### Added
- **Dictionary Landing Page** (`/dictionary`): Browse UI with category grid, entry_type filter tabs (Từ/Cụm từ/Câu), pagination, and search with type badges.
- **Categories system**: `categories` + `word_categories` tables for semantic categorization (Y tế, Gia đình, Trường học...).
- **`entry_type` field**: Words table now distinguishes `word`, `phrase`, `sentence` — "Super Dictionary" concept.
- **Maker-Checker schema**: `status`, `contributed_by`, `reviewed_by`, `reviewed_at` fields on `words` (DB-only, UI deferred).
- **Regional dialect support**: `region` field on `canonical_signs` (`north`/`central`/`south`/`standard`).
- **API endpoints**: `GET /dictionary/categories`, `GET /dictionary/browse` with pagination.
- **Search filters**: `/dictionary/search` now accepts `entry_type` and `category` query params.
- **EntryTypeBadge component**: Color-coded badges (🔵 Từ, 🟢 Cụm từ, 🟣 Câu) in search results.

### Changed
- **Word Detail page** redesigned: entry_type badge, category tags, regional variant tabs (Miền Bắc/Nam/Trung), step timeline indicator.
- **Home page**: Dictionary card links to `/dictionary`, Dịch câu card shows "Coming Soon" badge.
- **Header**: Added "Từ điển" nav item, "Dịch câu" shows "Soon" badge, removed "Sổ tay".
- **Alphabet page**: 3D tab hidden when no model exists (conditional rendering).
- **API search**: Only returns `status='published'` entries.
- **Media Storage decision**: Supabase Storage (not public/ folder, not R2).

### Files Modified
- `apps/api/app/modules/dictionary/models.py` — Word, CanonicalSign, Category, WordCategory models
- `apps/api/app/modules/dictionary/schemas.py` — Added entry_type, categories, region to DTOs
- `apps/api/app/modules/dictionary/service.py` — search/browse/categories logic
- `apps/api/app/modules/dictionary/router.py` — New /categories, /browse endpoints
- `apps/api/alembic/versions/002_add_entry_type_categories_review.py` — [NEW]
- `packages/types/src/enums.ts` — Added EntryType, ContentStatus, Region
- `apps/web/src/lib/api.ts` — New types + API functions
- `apps/web/src/app/dictionary/page.tsx` — [NEW] Dictionary landing
- `apps/web/src/app/dictionary/[id]/page.tsx` — Redesigned Word Detail
- `apps/web/src/app/translate/page.tsx` — Coming Soon UI
- `apps/web/src/app/page.tsx` — Updated cards + links
- `apps/web/src/components/shared/layout/Header.tsx` — Nav restructure
- `apps/web/src/app/alphabet/page.tsx` — Conditional 3D tab

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

## v0.3.0 — 2026-05-14

### Added
- **3D Hand Viewer** (`Hand3DViewer.tsx`): Three.js-based interactive 3D viewer with OrbitControls, auto-rotate, studio lighting, contact shadows.
- **Alphabet modal 3D tab**: Users can switch between Hình ảnh / Video / 3D views.
- **`model_3d` field** in `alphabet.json`: Ready for `.glb` model files.
- **`public/models/alphabet/`** directory for 3D assets.
- Dependencies: `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`.

### Architecture
- `Hand3DViewer` uses `useGLTF` — forward-compatible with animated models (`useAnimations`) for future translation avatar.
- Lazy-loaded via `React.lazy()` — zero bundle impact when 3D tab not viewed.

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
