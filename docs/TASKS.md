# Lộ trình & Công việc (Roadmap & Tasks)

---

## 1. ROADMAP (5 PHASES)

### Phase 1: Focused MVP — Dictionary + Notebook + Auth ← **DONE ✅**
- Monorepo scaffold (pnpm workspace + Docker Compose).
- Auth system (Supabase Auth + JWT).
- CSDL 3 lớp: `Word` → `CanonicalSign` → `SignAsset` + `QueryLog`.
- Media Pipeline: Pre-signed URL (R2) + Celery Worker.
- Tính năng: Bảng chữ cái, Tra từ, Sổ tay cá nhân.

### Phase 2: Sentence Mapping (Rule-based) ← **DONE ✅**
- Tokenizer tiếng Việt + Grammar Engine + 3-Tier Resolution.
- SignTimelinePlayer + Fingerspelling Fallback.
- Translation Mode Selector (auto / word_by_word / fingerspell).

### Phase 3: Learning Analytics & AI Coach
- Spaced Repetition, Practice Mode, Compare Mode.
- RAG (`pgvector`) cho Semantic Translation.
- **DEFERRED** — chờ có user thật.

### Phase 4 & 5: Sign Language OS (Research-Level)
- 3D Avatar Synthesis + AI Camera Recognition.
- Expo / React Native mobile app.

---

## 2. ✅ SPRINT 1.1 — Monorepo Scaffold & Infrastructure — DONE

### Infrastructure
- [x] Tạo monorepo root: `pnpm-workspace.yaml`, `.gitignore`, `.env.example`
- [x] `apps/web`: Init Next.js (TS, Tailwind, App Router)
- [x] `apps/api`: Poetry init + FastAPI + Uvicorn + folder DDD
- [x] `apps/worker`: Poetry init + Celery stub
- [x] `packages/types`: Init package + `enums.ts` + `api-responses.ts`
- [x] `docker-compose.yml`: PostgreSQL 16 + Redis
- [x] `apps/api`: `core/config.py` (Pydantic BaseSettings)
- [x] `apps/api`: Alembic init + migration `001_init_core_schema` (6 bảng) — cần `docker compose up` để chạy

---

## 3. ✅ SPRINT 1.2 — Backend API Core — DONE

- [x] `core/exceptions.py` + exception handler middleware
- [x] `core/dependencies.py`: `get_db` DI
- [x] `core/security.py`: Supabase JWT middleware
- [x] `modules/auth/`: `GET /api/v1/auth/me` + user upsert
- [x] `modules/dictionary/`: Models + Service + Router (search + detail)
- [x] `modules/notebook/`: CRUD bookmarks

## 4. ⏳ SPRINT 1.3 — Media Pipeline — CODE DONE, R2 SETUP PENDING

- [x] `modules/media/`: Pre-signed URL service + router (boto3)
- [x] `apps/worker/tasks/media_tasks.py`: Celery task stub
- [ ] Cloudflare R2 bucket setup (bạn cần tạo thủ công)
- [ ] Integration test: Upload → Worker → DB update (cần R2 + Docker)

## 5. ✅ SPRINT 1.4 — Frontend UI — DONE

- [x] React Query + Providers setup
- [x] `shared/layout/Header` (sticky, glassmorphism, nav)
- [x] `entities/MediaRenderer` (auto-detect image/video/3d)
- [x] `features/dictionary/SearchBar` (debounce 300ms + auto-suggest)
- [x] `features/dictionary/FlipCard` (Framer Motion 3D flip)
- [x] `features/dictionary/AlphabetGrid` (29 chữ cái)
- [x] `app/dictionary/[id]/page.tsx` (Word Detail + Variant tabs + Bookmark)
- [x] `app/notebook/page.tsx` (Bookmark list + empty state)
- [x] Home Page (Hero + Feature Cards + Alphabet Grid)
- [x] Design system (globals.css — premium palette, dark mode)
- [x] Build passed ✓ (4 routes OK)
- [ ] PWA config (next-pwa) — deferred

## 6. ⏳ SPRINT 1.5 — Data & Launch

- [x] Seed script: `scripts/seed.py` (29 chữ cái + 34 từ vựng = 63 words)
- [x] E2E verified: Search "xin" → returns "Xin chào" + "Xin lỗi" ✅
- [x] API server: `uvicorn` + DB connection confirmed
- [x] Frontend ↔ API: Live search auto-suggest working ✅
- [ ] Seed media: upload sign images/videos to R2 (cần R2 bucket)
- [ ] Deploy: Supabase + Railway/Render + Vercel + R2

---

## 7. ✅ SPRINT 2.1 — Vietnamese Tokenizer — DONE

- [x] `ai/semantic/tokenizer.py`: underthesea word_tokenize + stop-word removal
- [x] Normalize: lowercase + collapse whitespace
- [x] Compound word detection ("xin chào" stays as one token)

## 8. ✅ SPRINT 2.2 — 3-Tier Resolution Engine — DONE

- [x] `ai/semantic/resolver.py`: Tier 1 phrase_match, Tier 2 word_match, Tier 3 fingerspell
- [x] `modules/translation/service.py`: Orchestrator (tokenize → resolve → log)
- [x] `modules/translation/models.py`: QueryLog model (data-driven growth)
- [x] `modules/translation/schemas.py`: TranslateRequest/Response DTOs
- [x] Fingerspell fallback logs to `query_logs` table automatically

## 9. ✅ SPRINT 2.3 — Translation API — DONE

- [x] `modules/translation/router.py`: `POST /api/v1/translation/translate`
- [x] Registered in `main.py` (10 total routes)
- [x] Supports both authenticated + anonymous users
- [x] E2E verified:
  - "Mẹ yêu con" → 3 word_match, 100% coverage ✅
  - "blockchain" → fingerspell fallback ✅
  - QueryLog records fingerspell tokens ✅

## 10. ✅ SPRINT 2.4 — Frontend Translation UI — DONE

- [x] `features/translation/TranslationUI.tsx` (TranslationInput + SignTimeline + TokenCard)
- [x] `/translate` page — full translation flow with example buttons
- [x] Header nav updated (4 items: Tra cứu, Chữ cái, Dịch câu, Sổ tay)
- [x] Home page "Dịch câu" card links to `/translate` (removed "Sắp ra mắt" badge)
- [x] Color-coded token cards: green=phrase, blue=word, amber=fingerspell
- [x] Fingerspell visual cue (❓ + warning text)
- [x] B7 fix: Alphabet data extracted to `src/data/alphabet.json`
- [x] Build passed ✓ (6 routes)
- [x] E2E verified: "Mẹ yêu con" → 3 word_match, 100% coverage ✅

## 11. ✅ SPRINT 2.5 — SignTimelinePlayer & Translation Modes — DONE

### Violations Fixed
- [x] Fix `main.py` version `0.1.0` → `0.2.1`
- [x] Fix translation router `response_model=dict` → untyped (standard contract via return)
- [x] Align `TranslateRequest.mode` with `packages/types` enums (`auto`/`word_by_word`/`fingerspell`)

### Backend: Translation Mode Support
- [x] `schemas.py`: mode field → `auto | word_by_word | fingerspell`
- [x] `resolver.py`: mode parameter added to `resolve_token()` + `translate()`
  - `auto` = full 3-tier (phrase → word → fingerspell)
  - `word_by_word` = skip phrase matching
  - `fingerspell` = force fingerspell all tokens
- [x] `service.py`: mode passthrough from request to resolver
- [x] `router.py`: pass `body.mode` to `translate_text()`
- [x] Refactored: `_extract_sign_data()` + `_word_query_options()` helper (DRY)
- [x] Asset response now includes `metadata` field (for `duration_ms`)

### Frontend: SignTimelinePlayer
- [x] `TranslationModeSelector.tsx` — 3 mode buttons (Tự động / Từng từ / Đánh vần)
- [x] `SignTimelinePlayer.tsx` — Mini Media Sequencing Engine:
  - State machine: idle → playing → paused → complete
  - Auto-advance based on `duration_ms` from asset metadata (default 1200ms)
  - Play/Pause toggle + Reset button
  - Speed selector (0.5x / 1x / 1.5x)
  - Progress bar with time display
  - Active token highlighting with auto-scroll
  - Tier-colored token cards (green=phrase, blue=word, amber=fingerspell)
- [x] `TranslationUI.tsx` — TranslationInput accepts `mode` parameter
- [x] `api.ts` — `translateText()` accepts mode, `TranslationSignAsset` includes `metadata`
- [x] `/translate` page — integrated Mode Selector + Player
- [x] Build passed ✓ (7 routes)

## 12. ✅ SPRINT 3D.1 — 3D Hand Viewer Infrastructure — DONE

- [x] Installed: `three` + `@react-three/fiber` + `@react-three/drei` + `@types/three`
- [x] `components/features/hand3d/Hand3DViewer.tsx` — Canvas + OrbitControls + auto-rotate + studio lighting
- [x] Alphabet modal: 3-tab system (Hình ảnh / Video / 3D)
- [x] `alphabet.json`: `model_3d` field added to all 22 letters (null until .glb files provided)
- [x] `public/models/alphabet/` directory created
- [x] Lazy-loaded with `React.lazy()` — zero bundle cost when not used
- [x] Forward-compatible: same component supports animated .glb (useAnimations) for future translation avatar
- [x] Build passed ✓ (6 routes)
- [ ] **BLOCKER:** Cần file `.glb` model bàn tay — tải từ Sketchfab/HANDZ hoặc tạo trong Blender

## 13. ✅ SPRINT R — V1.0 REFOCUS (DB Redesign + Dictionary + Lock Translation) — DONE

### Sprint R1: DB Schema Redesign
- [x] `words` table: Thêm `entry_type` (word/phrase/sentence), `status` (draft/pending/approved/published/rejected)
- [x] `words` table: Thêm `contributed_by`, `reviewed_by`, `reviewed_at`, `updated_at` (Maker-Checker pipeline)
- [x] `canonical_signs` table: Thêm `region` (north/central/south/standard)
- [x] Bảng mới `categories` + `word_categories` (many-to-many) cho Browse by topic
- [x] Alembic migration `002_add_entry_type_categories_review`
- [x] `packages/types/enums.ts`: Thêm EntryType, ContentStatus, Region

### Sprint R2: Backend API Upgrade
- [x] `schemas.py`: entry_type, categories, region trong DTOs
- [x] `service.py`: Search filter by entry_type + category + status=published
- [x] `service.py`: `browse_words()` với pagination, `get_categories()` với word counts
- [x] `router.py`: `GET /categories`, `GET /browse` endpoints

### Sprint R3: Frontend — Dictionary Module
- [x] `api.ts`: Thêm types + endpoints (categories, browse, entry_type)
- [x] `/dictionary/page.tsx` [NEW]: Landing page với category grid + search + filter tabs + pagination
- [x] `/dictionary/[id]/page.tsx`: Redesign với variant tabs (region), category tags, step timeline
- [x] EntryTypeBadge component: Color-coded badges (🔵 Từ / 🟢 Cụm từ / 🟣 Câu)

### Sprint R4: Alphabet Polish
- [x] Ẩn 3D tab khi `model_3d` = null (conditional rendering)

### Sprint R5: Lock Translation + Nav Cleanup
- [x] `/translate/page.tsx`: Coming Soon UI với navigation cards
- [x] `Header.tsx`: Thêm "Từ điển", badge "Soon" trên "Dịch câu", bỏ "Sổ tay"
- [x] Home `page.tsx`: Dictionary → /dictionary, "Coming Soon" badge trên Dịch câu

### Documentation Sync
- [x] `DATABASE.md` — Cập nhật toàn bộ schema mới
- [x] `CHANGELOG.md` — v1.0.0 entry
- [x] `TASKS.md` — Sprint R tracking
- [x] `ARCHITECTURE.md` — Cập nhật folder structure, Supabase Storage, migration listing
- [x] `FEATURES.md` — Cập nhật Super Dictionary, Coming Soon, Maker-Checker
- [x] `PLAN.md` — Cập nhật roadmap, Supabase Storage, Phase 2 scope
- [x] Build passed ✓ (7 routes)

## 14. ✅ Dictionary Detail: Random Suggestions — DONE

- [x] `apps/web/src/app/dictionary/[id]/page.tsx`: Thêm section "Gợi ý cho bạn" ở cuối trang detail
- [x] Fetch random words từ `browseWords` API (cache 5 phút)
- [x] Seeded Fisher-Yates shuffle (seed = wordId) → hiển thị 4 gợi ý khác nhau mỗi từ
- [x] Card UI: icon theo entry_type, badge, difficulty stars, description (truncated)
- [x] Tự động loại bỏ từ hiện tại khỏi danh sách gợi ý
- [x] Build passed ✓ (7 routes)
