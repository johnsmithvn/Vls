# Kế hoạch Triển khai Chi tiết (Detailed Implementation Plan)

> Tài liệu này là **bản đồ thực thi** duy nhất. Mọi action đều phải quay lại đây để kiểm tra scope.

---

## 1. QUYẾT ĐỊNH ĐÃ CHỐT

| Hạng mục | Lựa chọn |
|---|---|
| Frontend | **Next.js App Router (PWA)** — Hybrid Rendering |
| Backend | **Python FastAPI** — DDD Architecture |
| Backend Package Manager | **Poetry** |
| Project Structure | **Monorepo** (pnpm workspace) |
| Database | **Supabase** (PostgreSQL) |
| Media Storage | **Cloudflare R2** (Zero Egress Fees) |
| Background Jobs | **Celery** + **Upstash Redis** |
| Containerization | **Docker Compose** (local dev) |
| Mobile (6-12 tháng sau) | Expo / React Native + shared packages |

---

## 2. PHẠM VI (SCOPE BOUNDARY)

### ✅ IN-SCOPE (Phase 1 MVP)
- Monorepo scaffold (apps/web, apps/api, apps/worker, packages/types).
- Auth system (Supabase Auth + JWT) — per-user data từ ngày 1.
- DB Schema 3 lớp: `words` → `canonical_signs` → `sign_assets` + `query_logs`.
- Bảng chữ cái liên tưởng (29 chữ cái).
- Tra cứu từ vựng + Auto-suggest.
- Sổ tay cá nhân (Bookmarks per user).
- Media Upload (Pre-signed URL → R2 → Celery Worker convert).

### ❌ OUT-OF-SCOPE (Nghiêm cấm trong Phase 1)
- Sentence Translation (Phase 2).
- AI Camera / 3D Avatar (Phase 4-5).
- RAG / pgvector (Phase 3).
- Spaced Repetition (Phase 3).

---

## 3. PHASE 1: FOCUSED MVP — Chi tiết từng Sprint

### Sprint 1.1: Monorepo Scaffold & Infrastructure (Tuần 1)

**Mục tiêu:** Mọi thứ chạy được trên local machine với 1 lệnh `docker compose up`.

| # | Task | Deliverable |
|---|---|---|
| 1 | Tạo monorepo root: `pnpm-workspace.yaml`, `.gitignore`, `.env.example` | Repo có cấu trúc `apps/`, `packages/`, `infra/`, `docs/` |
| 2 | `apps/web`: `pnpm create next-app` (TS, Tailwind, App Router) | Next.js chạy được trên `localhost:3000` |
| 3 | `apps/api`: Poetry init + FastAPI + Uvicorn. Tạo folder DDD (`core/`, `db/`, `modules/`) | API chạy được trên `localhost:8000`, Swagger UI hoạt động |
| 4 | `apps/worker`: Poetry init + Celery. Tạo `celery_app.py` stub | Worker connect được Redis |
| 5 | `packages/types`: Init package, tạo `enums.ts`, `api-responses.ts` | Import được từ `apps/web` |
| 6 | `docker-compose.yml`: PostgreSQL 16 + Redis | `docker compose up` chạy full stack local |
| 7 | `apps/api`: Cấu hình `core/config.py` (Pydantic BaseSettings đọc `.env`) | Kết nối DB thành công |
| 8 | `apps/api`: Alembic init + migration `init_core_schema` (6 bảng theo DATABASE.md) | `alembic upgrade head` tạo đầy đủ tables |

### Sprint 1.2: Backend API Core (Tuần 2)

**Mục tiêu:** CRUD API hoạt động, có Auth middleware, Standard Response Contract.

| # | Task | Deliverable |
|---|---|---|
| 1 | `core/exceptions.py`: Tạo `CustomHTTPException` + exception handler middleware | Mọi lỗi trả về `{ success, message, data, meta }` |
| 2 | `core/dependencies.py`: `get_db` session dependency | DI hoạt động |
| 3 | `core/security.py`: Middleware verify Supabase JWT → inject `current_user` | Protected routes chặn request thiếu token |
| 4 | `modules/auth/`: `GET /api/v1/auth/me` trả thông tin user. Upsert user on first login | User tự động sync vào bảng `users` |
| 5 | `modules/dictionary/models.py`: SQLAlchemy models cho `Word`, `CanonicalSign`, `SignAsset` | Models map đúng schema trong DATABASE.md |
| 6 | `modules/dictionary/service.py`: Logic search (ILIKE + trigram) | Search trả kết quả chính xác |
| 7 | `modules/dictionary/router.py`: `GET /api/v1/dictionary/search?q=...` | Auto-suggest hoạt động |
| 8 | `modules/dictionary/router.py`: `GET /api/v1/dictionary/words/{id}` | Trả Word + CanonicalSigns + Assets (`is_active=True`) |
| 9 | `modules/notebook/`: CRUD `GET/POST/DELETE /api/v1/notebook/bookmarks` | User bookmark/unbookmark word |

### Sprint 1.3: Media Pipeline (Tuần 3)

**Mục tiêu:** Upload ảnh/video lên R2 qua Pre-signed URL, Worker tự convert.

| # | Task | Deliverable |
|---|---|---|
| 1 | Tạo Cloudflare R2 bucket + API token. Lưu credentials vào `.env` | R2 accessible |
| 2 | `modules/media/service.py`: Sinh Pre-signed URL từ R2 (boto3 S3-compatible) | URL hợp lệ, upload thành công |
| 3 | `modules/media/router.py`: `POST /api/v1/media/upload-url` (Admin-only) | Trả về `{ presigned_url, asset_id }` |
| 4 | `apps/worker/tasks/media_tasks.py`: Task nhận `asset_id` → download từ R2 → resize/convert → re-upload → update DB | Video `.mp4` tự convert sang `.webm` |
| 5 | Tích hợp trigger: Sau khi upload thành công → Backend enqueue Celery task | Luồng End-to-end hoạt động |

### Sprint 1.4: Frontend UI (Tuần 4-5)

**Mục tiêu:** Giao diện hoàn chỉnh, kết nối API thật, responsive.

| # | Task | Deliverable |
|---|---|---|
| 1 | Setup: Zustand + React Query + cấu hình API base URL | Kết nối API thành công |
| 2 | `shared/ui/`: Button, Input, Skeleton, Modal (Shadcn/Radix) | Design system cơ bản |
| 3 | `shared/layout/`: Header, NavigationBar, BottomNav (mobile) | Layout responsive |
| 4 | `entities/MediaRenderer`: Tự nhận dạng `media_type` → render `<picture>` hoặc `<video>` | Hiển thị đúng mọi loại media |
| 5 | `features/dictionary/SearchBar`: Debounce 300ms → gọi `/dictionary/search` → dropdown | Auto-suggest hoạt động |
| 6 | `features/dictionary/FlipCard`: Grid 29 chữ cái, Framer Motion 3D flip | Animation mượt 60fps |
| 7 | `features/dictionary/WordDetail`: Carousel media + View Angle Tabs + Bookmark button | Trang chi tiết đầy đủ |
| 8 | `features/notebook/BookmarkList`: Danh sách từ đã bookmark | CRUD bookmark hoạt động |
| 9 | Trang Home: Hero SearchBar + Alphabet Grid + Recent Signs | Trang chủ hoàn chỉnh |
| 10 | PWA config: `next-pwa`, manifest, service worker | Cài được trên điện thoại |

### Sprint 1.5: Data Seeding & Launch (Tuần 6)

**Mục tiêu:** Seed data thật, test E2E, deploy production.

| # | Task | Deliverable |
|---|---|---|
| 1 | Script seed 29 chữ cái + hình Mnemonic | DB có 29 words + assets |
| 2 | Script seed ~100 từ vựng cơ bản + media (ảnh/video) | DB có ~100 words đa góc nhìn |
| 3 | E2E: Upload Video → R2 → Worker convert → Browser playback | Media Pipeline ổn định |
| 4 | E2E: Signup → Login → Search → Bookmark → Logout → Login → Bookmark still there | Auth + Notebook ổn định |
| 5 | Deploy: Supabase (DB) + Railway (API + Worker) + Vercel (Web) + R2 (Media) | Production live |
| 6 | Config domain + HTTPS + Rate Limiting | Security cơ bản |

---

## 4. PHASE 2: SENTENCE MAPPING (Rule-based) — ~4 tuần

**Prerequisite:** Phase 1 hoàn thành, DB có ≥ 100 từ.

| Sprint | Nội dung | Deliverable |
|---|---|---|
| 2.1 | `apps/api/app/ai/semantic/`: Vietnamese Tokenizer (underthesea) + Stop-word removal + Normalizer | Tokenize "Mình đi học nha" → `["Mình", "đi", "học"]` |
| 2.2 | `modules/translation/`: Grammar Rule Engine (S-V-O → O-S-V reorder) + 3-Tier Resolution logic | API trả đúng `result_type` cho mỗi token |
| 2.3 | `modules/translation/router.py`: `POST /api/v1/translation/translate` | API endpoint hoạt động < 50ms |
| 2.4 | `features/translation/SignTimelinePlayer`: Timing Engine (`duration_ms`), Playback controls, Speed selector, Translation Mode Selector | Player phát mượt chuỗi ký hiệu |
| 2.5 | Fingerspell Fallback UI: Visual cue (icon ❓, text mờ) + `query_logs` ghi nhận | User biết đang xem đánh vần, Admin biết từ nào cần bổ sung |

---

## 5. PHASE 3: LEARNING ANALYTICS & AI COACH — ~8 tuần

**Prerequisite:** Phase 2 hoàn thành, có user thật sử dụng.

| Sprint | Nội dung | Deliverable |
|---|---|---|
| 3.1 | DB: Tạo bảng `user_search_history`, `user_learning_progress` (Alembic migration) | Schema sẵn sàng |
| 3.2 | Backend: Ghi search history per user. API `GET /api/v1/user/history` | Recent Signs hiển thị trên Home |
| 3.3 | Frontend: Slow-motion Replay (video playbackRate 0.25x-0.5x) + Compare Mode UI | User xem chậm thao tác khó |
| 3.4 | Backend: Spaced Repetition engine (SM-2 algorithm). API `GET /api/v1/user/review-queue` | Hệ thống gợi ý ôn tập |
| 3.5 | Frontend: Practice Mode UI (Flashcard ôn tập + Streak counter) | Vòng lặp học tập hoàn chỉnh |
| 3.6 | R&D: Enable `pgvector` extension. Tạo embeddings cho `words.semantic_tags` | Vector search hoạt động |
| 3.7 | `ai/rag/`: RAG fallback cho Translation — Nếu Rule-based fail → gọi Semantic Search | Dịch câu phức tạp chính xác hơn |
| 3.8 | Admin Dashboard: Top fingerspell words + User analytics overview | Data-driven content production |

---

## 6. PHASE 4 & 5: SIGN LANGUAGE OS — Research-Level

> **Không lập kế hoạch chi tiết.** Chỉ bắt đầu R&D khi Phase 3 ổn định và có user base thực.

| Phase | Hướng nghiên cứu | Rào cản |
|---|---|---|
| **4** | 3D Avatar Synthesis: Skeleton Rigging + Transition Graphs + Motion Blending | Motion Representation (không phải Graphics) |
| **5** | AI Camera Recognition: MediaPipe + OpenPose + LSTM/Transformer temporal models | Computer Vision + Temporal Understanding (research-level) |
| **4-5** | Expo / React Native mobile app (chia sẻ `packages/types` và `packages/ui`) | Đợi Web ổn định, user thật xuất hiện |

---

## 7. VERIFICATION PLAN (Áp dụng cho mọi Phase)

### Automated
- Pytest cho Backend: API endpoint responses match Standard Contract.
- Luồng Grammar Engine: Input → Output mapping chính xác.

### Manual (User thực hiện)
- E2E Upload Video → R2 → Worker → Playback trên browser.
- Auth flow: Signup → Login → Bookmark → Logout → Login → Data persisted.
- PWA: Cài lên điện thoại, offline cache hoạt động cho static content.
