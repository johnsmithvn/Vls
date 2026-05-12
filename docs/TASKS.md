# Lộ trình & Công việc (Roadmap & Tasks)

---

## 1. ROADMAP (5 PHASES)

### Phase 1: Focused MVP — Dictionary + Notebook + Auth ← **HIỆN TẠI**
- Monorepo scaffold (pnpm workspace + Docker Compose).
- Auth system (Supabase Auth + JWT).
- CSDL 3 lớp: `Word` → `CanonicalSign` → `SignAsset` + `QueryLog`.
- Media Pipeline: Pre-signed URL (R2) + Celery Worker.
- Tính năng: Bảng chữ cái, Tra từ, Sổ tay cá nhân.

### Phase 2: Sentence Mapping (Rule-based)
- Tokenizer tiếng Việt + Grammar Engine + 3-Tier Resolution.
- SignTimelinePlayer + Fingerspelling Fallback.

### Phase 3: Learning Analytics & AI Coach (The Real Moat)
- Spaced Repetition, Practice Mode, Compare Mode.
- RAG (`pgvector`) cho Semantic Translation.

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
