# Kiến trúc Hệ thống (System Architecture)

> **Vision = OS, Execution = Product.**
> Hệ thống này không phải một ứng dụng CRUD. Nó là một **Structured Sign Knowledge Graph** (`Word → Semantic Meaning → Context → Canonical Sign → Motion Landmarks → Grammar Relations`) được đóng gói dưới hình hài một Từ điển & Sổ tay siêu tốc cho MVP.

---

## 1. SỨ MỆNH & ĐỊNH VỊ (MISSION & POSITIONING)

### 1.1. Sứ mệnh Xã hội
- **Phá vỡ bức tường cách ly:** Cầu nối giao tiếp cho người khiếm thính trong y tế, hành chính, giáo dục.
- **Bình đẳng Giáo dục:** Biến việc học ngôn ngữ ký hiệu trở nên hấp dẫn như Duolingo.
- **Bảo tồn Di sản:** Số hóa ngôn ngữ ký hiệu như một ngôn ngữ độc lập có hệ thống ngữ pháp riêng.

### 1.2. Con hào Kinh tế (Business Moat)
- Translation AI sẽ bị commoditized. **Learning Analytics & AI Feedback Loop** mới là Moat thực sự.
- AI Coach phát hiện lỗi `Orientation`, `Hand Shape`, `Movement` của người học.
- Retention Loop (Spaced Repetition, Compare Mode) giữ chân user dài hạn.

### 1.3. Quản trị Dữ liệu (Data Governance)
- **Canonical Source of Truth:** Phân định Chuẩn quốc gia / Biến thể vùng miền / Tiếng lóng.
- **Confidence Score & Moderation:** Mọi ký hiệu phải có `reviewed_by` từ chuyên gia.
- **Data Licensing:** Mọi media phải có `Provenance` rõ ràng để miễn nhiễm pháp lý khi train AI.

---

## 2. TỔNG QUAN HỆ THỐNG (SYSTEM CONTEXT)

Mô hình **Client-Server** kết hợp **Event-Driven Background Processing**.

| Layer | Vai trò | Công nghệ |
|---|---|---|
| Presentation | PWA đa nền tảng, render UI/UX tốc độ cao | Next.js (App Router), TypeScript |
| API Gateway | Xử lý nghiệp vụ, xác thực, điều phối dữ liệu | Python FastAPI (DDD) |
| AI & NLP Engine | Xử lý ngôn ngữ tự nhiên tiếng Việt, RAG (tương lai) | Module nội bộ Backend |
| Media Pipeline | Xử lý bất đồng bộ file ảnh/video/3D nặng | Celery + Redis |
| Data Persistence | Dữ liệu cấu trúc + Vector + Object Storage | PostgreSQL + Supabase Storage |

---

## 3. NGĂN XẾP CÔNG NGHỆ (TECH STACK)

### 3.1. Frontend — Next.js (Hybrid Rendering)
- **Framework:** Next.js (App Router) — SSR/SSG + PWA.
- **Language:** TypeScript (Strict Mode).
- **Rendering Strategy (Hybrid):**
  | Loại page | Rendering | Lý do |
  |---|---|---|
  | SEO / Landing / Static | Server Components | Tối ưu SEO, load nhanh |
  | Search / Auto-suggest | Client Components | Cần tương tác real-time |
  | Media Player / Timeline | Client Components | Animation + Playback |
  | Bảng chữ cái / FlipCard | Client Components | 3D transform |
- **State:** Zustand (Client) + TanStack React Query (Server State).
- **UI:** Tailwind CSS + Radix UI / Shadcn UI.
- **Animation:** Framer Motion. *3D (Phase 5):* React Three Fiber.

### 3.2. Backend — Python FastAPI
- **Framework:** Python FastAPI (ASGI/Uvicorn).
- **Package Manager:** **Poetry** (quản lý dependencies chuẩn Enterprise).
- **Architecture:** Domain-Driven Design (DDD) — `modules/` thay vì `services/`.
- **ORM:** SQLAlchemy 2.0 (Async). **Migrations:** Alembic.

### 3.3. Storage & Database
- **Primary DB:** Supabase (PostgreSQL) + extension `pgvector` (bật sẵn cho Phase 3).
- **Media Storage:** Supabase Storage — Đồng bộ với DB & Auth, hỗ trợ RLS policies.

### 3.4. Background Processing
- **Broker:** Upstash Redis (Serverless).
- **Worker:** Celery — Convert video, resize ảnh, generate embeddings.

### 3.5. Infrastructure
- **Monorepo:** pnpm workspace.
- **Containerization:** Docker Compose (local dev).
- **Type Safety:** Shared types package (`packages/types/`) cho DTOs, Enums, API contracts dùng chung giữa FE và BE.

---

## 4. CẤU TRÚC THƯ MỤC — MONOREPO (FOLDER STRUCTURE)

### 4.1. Tổng thể (Monorepo Root)
```text
📦 sign-os/
├── apps/
│   ├── web/                     # Next.js PWA (Frontend)
│   ├── api/                     # FastAPI (Backend)
│   └── worker/                  # Celery Workers
│
├── packages/
│   ├── types/                   # Shared DTOs, Enums, API contracts (TS + Python sync)
│   ├── api-client/              # Generated API client cho Frontend
│   └── ui/                      # (Future) Shared UI components cho Web + Mobile
│
├── infra/                       # Docker configs, deploy scripts
│
├── docs/                        # Tài liệu thiết kế (file này)
├── docker-compose.yml           # Local dev: API + Worker + Redis + DB
└── pnpm-workspace.yaml          # Monorepo workspace config
```

### 4.2. `apps/api/` — Backend (FastAPI DDD)
```text
apps/api/
├── app/
│   ├── ai/                      # AI Engine Độc Lập
│   │   ├── embeddings/
│   │   ├── pipelines/
│   │   ├── rag/
│   │   └── semantic/            # Tokenizer, NLP tiếng Việt
│   │
│   ├── core/                    # Cấu hình & Bảo mật
│   │   ├── config.py            # Pydantic BaseSettings
│   │   ├── dependencies.py      # DI (get_db, get_user)
│   │   ├── exceptions.py
│   │   └── security.py
│   │
│   ├── db/
│   │   ├── base.py              # SQLAlchemy Base
│   │   └── session.py
│   │
│   ├── modules/                 # Domain Driven
│   │   ├── admin/               # Admin CMS — CRUD words, categories, dashboard (owner only)
│   │   ├── auth/                # User model (role: owner/contributor/user), JWT
│   │   ├── dictionary/          # models: Word, CanonicalSign, SignAsset, Category, WordCategory
│   │   ├── translation/         # (LOCKED — Coming Soon)
│   │   ├── notebook/
│   │   └── media/
│   │
│   └── main.py                  # v1.2.0
│
├── alembic/
│   └── versions/
│       ├── 001_init_core_schema.py
│       ├── 002_add_entry_type_categories_review.py
│       └── 003_add_user_role.py
├── pyproject.toml               # Poetry
└── alembic.ini
```

### 4.3. `apps/worker/` — Celery Background Jobs
```text
apps/worker/
├── tasks/
│   ├── media_tasks.py           # Resize ảnh, convert video
│   └── ai_tasks.py              # Generate embeddings
├── celery_app.py
└── pyproject.toml
```

### 4.4. `apps/web/` — Frontend (Next.js Hybrid)
```text
apps/web/src/
├── app/                        # Next.js App Router (pages)
│   ├── page.tsx               # Home (Hero + Feature Cards)
│   ├── admin/                 # Admin CMS (owner only)
│   │   ├── layout.tsx         # Auth guard + admin nav
│   │   ├── page.tsx           # Dashboard stats
│   │   └── words/             # Word CRUD (list, new, edit)
│   ├── alphabet/page.tsx      # Bảng chữ cái (static JSON)
│   ├── dictionary/
│   │   ├── page.tsx           # Dictionary Landing (Browse + Search)
│   │   └── [id]/page.tsx      # Word Detail (Variant tabs + Media)
│   ├── translate/page.tsx     # Coming Soon (LOCKED)
│   └── notebook/page.tsx      # Bookmark list
├── components/
│   ├── features/               # Components nghiệp vụ
│   │   ├── dictionary/         # SearchBar, EntryTypeBadge
│   │   ├── hand3d/             # Hand3DViewer (lazy-loaded)
│   │   ├── translation/        # SignTimelinePlayer (deactivated)
│   │   └── notebook/
│   ├── shared/                 # Dùng chung
│   │   ├── ui/                 # Button, Input, Skeleton, Modal, SignMediaPlayer
│   │   └── layout/             # Header (4 nav items)
│   └── entities/               # MediaRenderer
├── data/
│   └── alphabet.json           # Static alphabet data (B7 rule)
├── lib/                        # API client, admin-api, supabase client
└── stores/                     # Zustand stores
```

### 4.5. `packages/types/` — Shared Type Safety
```text
packages/types/
├── src/
│   ├── api-responses.ts        # Standard { success, message, data, meta }
│   ├── enums.ts                # EntryType, ContentStatus, Region, MediaType, TranslationMode...
│   ├── dictionary.ts           # WordDTO, CanonicalSignDTO, SignAssetDTO
│   └── translation.ts          # TranslationTokenDTO, TranslationMode
└── package.json
```

---

## 5. MEDIA PIPELINE (Supabase Storage Direct Upload)

```text
[Frontend]                   [Backend API]            [Supabase Storage]    [Celery Worker]
    │                              │                          │                     │
    ├─ POST /media/upload-url ────►│                          │                     │
    │                              ├─ Tạo Signed URL ────────►│                     │
    │◄─ { signed_url } ───────────┤                          │                     │
    │                              │                          │                     │
    ├─ PUT (Direct Upload) ───────────────────────────────────►│                     │
    │                              │                          │                     │
    │                              │◄─ Webhook/Callback ──────┤                     │
    │                              ├─ Enqueue Task ──────────────────────────────────►│
    │                              │                          │  Convert/Compress   │
    │                              │                          │◄─ Upload processed ──┤
    │                              │◄─ Update sign_assets.url──────────────────────────┤
```

---

## 6. SENTENCE MAPPING PIPELINE (3-Tier Resolution)

Hệ thống dịch câu hoạt động theo **3 tầng ưu tiên giảm dần**. Không dùng RAG, luồng chạy cực nhanh (< 50ms):

### 6.1. Ba tầng phân giải (Resolution Tiers)
| Tầng | Tên | Ý nghĩa | Ví dụ |
|---|---|---|---|
| **Tier 1** | `phrase_match` | Cụm từ cố định có video sẵn | "Xin chào", "Cảm ơn", "Tạm biệt" |
| **Tier 2** | `word_match` | Từ đơn lẻ khớp chính xác trong DB | "Mẹ", "Ăn", "Trường" |
| **Tier 3** | `fingerspell` | Đánh vần từng chữ cái (Fallback) | "John" → J-O-H-N |

### 6.2. Luồng xử lý
1. **Input:** "Mình gặp John nha"
2. **Normalize:** Xóa stop-words ("nha") → "Mình gặp John"
3. **Tokenize** (pyvi/underthesea): `["Mình", "gặp", "John"]`
4. **Grammar Rule Engine:** Sắp xếp lại theo cấu trúc ký hiệu.
5. **3-Tier Resolution:** Với mỗi token:
   - Tìm trong `canonical_signs` có `phrase_match` không → nếu có, dùng Tier 1.
   - Tìm `word_match` → nếu có, dùng Tier 2.
   - Không tìm thấy → fallback Tier 3 (`fingerspell`).
6. **Asset Retrieval:** Trả về mảng tokens kèm `result_type` cho FE render.

### 6.3. API Response mẫu
```json
{
  "success": true,
  "data": {
    "original_text": "Mình gặp John nha",
    "tokens": [
      { "text": "Mình", "result_type": "word_match", "assets": [{"url": "...", "duration_ms": 800}] },
      { "text": "gặp",  "result_type": "word_match", "assets": [{"url": "...", "duration_ms": 1200}] },
      { "text": "John", "result_type": "fingerspell", "letters": ["J","O","H","N"] }
    ]
  }
}
```

### 6.4. UX khi Fallback (Fingerspell)
Khi hệ thống rơi xuống Tier 3, Frontend BẮT BUỘC hiển thị **visual cue** để user không bối rối:
- Icon ❓ nhỏ bên cạnh từ.
- Dòng text mờ: *"Từ này chưa có ký hiệu, đang hiển thị đánh vần..."*

> **⚠️ Lưu ý:** Đây là **simplified rule-based approximation**. Ngôn ngữ ký hiệu thực tế bao gồm biểu cảm khuôn mặt, không gian, lược bỏ ngữ cảnh. Không được quảng cáo sai kỳ vọng cho user.

---

## 7. DATA-DRIVEN GROWTH (Chiến lược Thu thập Dữ liệu)

Hệ thống tự động **theo dõi log truy vấn** để biết từ nào cần ưu tiên bổ sung media:

### 7.1. Luồng hoạt động
1. Mỗi lần một token bị fallback xuống `fingerspell`, Backend ghi log vào bảng `query_logs`.
2. Dashboard Admin hiển thị bảng xếp hạng: **"Top từ bị fingerspell nhiều nhất"**.
3. Team content ưu tiên quay video cho các từ đó → Upload → Tự động lên Tier 2.

### 7.2. Chiến lược MVP Launch
- **Ra mắt ngay** chỉ với: 29 chữ cái (Tier 3) + ~100 từ vựng cốt lõi (Tier 2).
- **Mở rộng tự nhiên:** User tạo ra demand → Log ghi nhận → Team bổ sung → DB lớn dần.
- Không cần quay hết 10,000 từ trước khi launch.

---

## 8. DEPLOYMENT TOPOLOGY

```text
[ Người Dùng (Mobile / Web) ]
       │
       ├──(1) UI Render (HTTPS)───► [ Vercel Edge Network ] (Frontend Next.js)
       │
       ├──(2) API Call (REST)─────► [ Railway / Fly.io ] (Backend FastAPI Container)
       │                                 │
       │                                 ├──► [ Supabase ] (PostgreSQL DB)
       │                                 │
       │                                 └──► [ Upstash ] (Redis Message Broker)
       │                                           │
       │                                           └──► [ Celery Workers Container ]
       │
       └──(3) Tải Video/Ảnh───────► [ Supabase Storage + CDN ]
```

---

## 9. BẢO MẬT & API CONTRACT

### 8.1. Chuẩn Response Contract (Bất biến)
```json
{
  "success": true,
  "message": "Fetched dictionary successfully",
  "data": { },
  "meta": { "pagination": { "page": 1, "total": 100 } }
}
```

### 8.2. Bảo mật & Versioning
- Mọi API route: `/api/v1/resource`. Đổi response contract → bắt buộc lên `/api/v2/`.
- HTTPS/TLS 1.3. Rate Limiting ở API Gateway.
- Auth: JWT Token. *(Tương lai)* Signed CDN URLs bảo vệ media.

---

## 10. AUTHENTICATION & USER SYSTEM

### 9.1. Chiến lược Auth (MVP)
- **Provider:** Supabase Auth (Email/Password + OAuth Google).
- **Flow:** Frontend gọi Supabase Auth SDK → nhận JWT → gửi JWT trong header `Authorization: Bearer <token>` → Backend middleware verify JWT và inject `current_user`.
- **User Sync:** Khi user login lần đầu, Backend tự động `UPSERT` vào bảng `users` nội bộ.

### 9.2. Per-User Data Foundation
Mọi dữ liệu liên quan đến user đều phải gắn `user_id` ngay từ MVP:
- `user_bookmarks`: Sổ tay cá nhân.
- `user_search_history` *(Phase 2)*: Lịch sử tra cứu.
- `user_learning_progress` *(Phase 3)*: Tiến độ học, lỗi sai, streak — nền tảng cho AI Coach.

### 9.3. Authorization Rules
- **Public routes:** Dictionary search, Word detail (không cần login).
- **Protected routes:** Bookmark CRUD, User profile, Learning data (cần JWT).
- **Admin routes:** Word CRUD, Category CRUD, Dashboard stats (cần role `owner`).
- **RBAC Roles:** `owner` (full admin) → `contributor` (submit for review, future) → `user` (public features).

---

## 11. RÀO CẢN NGHIÊN CỨU (RESEARCH-LEVEL — FUTURE)

### 11.1. 3D Avatar Synthesis
Bài toán **Motion Representation** (không phải Graphics): Movement Blending qua Transition Graphs, Skeleton Rigging, Semantic Pacing.

### 11.2. AI Camera Recognition
Computer Vision + Temporal Understanding: Pose Estimation (OpenPose) + LSTM/Transformers + Facial Expressions (30% ngữ nghĩa) + Occlusion handling. → **Phase 5.**
