# Quy tắc Dự án (Project Rules)

"Hiến pháp" của dự án. Áp dụng cho **cả human developer và AI agent**.

---

# PHẦN A: QUY TẮC HÀNH VI AI AGENT

---

## A1. Knowledge Honesty
- KHÔNG BAO GIỜ bịa đặt thông tin về repository, API, runtime state.
- Phân biệt rõ: **Observed facts** / **Assumptions** (ghi rõ) / **Proposed changes**.
- Nếu thiếu thông tin: `TODO: missing input`. Nếu không chắc impact: `TODO: decision needed`.

## A2. Anti-Hallucination
- Trước khi sửa file: verify file tồn tại, inspect related files.
- Trước khi claim hoàn thành: confirm modified files, verify content, run checks.
- Không thể validate → `TODO: pending validation`.

## A3. Scope Control & Restrictions
- CHỈ làm trong phạm vi task hiện tại.
- **KHÔNG ĐƯỢC:** Refactor module không liên quan, đổi architecture khi chưa được yêu cầu, rename files tùy ý, introduce large refactors.
- Nếu cần thay đổi lớn → `TODO: architectural change required`. Không tự ý implement.

## A4. File Modification Rules
- Chỉ sửa file liên quan đến task.
- Giữ thay đổi **minimal và reversible**.
- Tránh xóa file trừ khi được yêu cầu rõ ràng.
- Tránh rewrite toàn bộ file khi chỉ cần patch.

## A5. Workflow Bắt buộc

### Trước khi code:
1. Đọc `docs/RULES.md` (file này).
2. Nếu thiếu context → đọc `docs/ARCHITECTURE.md`, `docs/FEATURES.md`.
3. Đọc `docs/PLAN.md` để hiểu phase hiện tại.
4. Đọc `docs/TASKS.md`, đánh dấu task hiện tại `IN PROGRESS`.
5. Implement **chỉ task hiện tại**.

### Sau khi code:
1. Update `docs/TASKS.md` (mark complete, thêm follow-up nếu cần).
2. Update `docs/PLAN.md` nếu milestone thay đổi.
3. Update `docs/ARCHITECTURE.md` nếu module/data flow/interface thay đổi.
4. Update `CHANGELOG.md`.

## A6. Configuration & Secret Safety
- **TUYỆT ĐỐI KHÔNG** hardcode API keys, tokens, passwords trong repository.
- Credentials phải đến từ: environment variables, `.env` files (gitignored), secret managers.

## A7. Retry & Loop Safety
- Không sinh infinite loops, uncontrolled retries, recursion vô hạn.
- Retry luôn cần: max count, backoff delay, failure logging.

---

# PHẦN B: QUY CHUẨN LẬP TRÌNH (CODING STANDARDS)

---

## B1. Git Workflow

### Branch Naming
- `feature/<tên>` — Tính năng mới. VD: `feature/word-dictionary`
- `bugfix/<tên>` — Sửa lỗi dev.
- `hotfix/<tên>` — Sửa lỗi Production khẩn cấp.
- `arch/<tên>` — Thay đổi kiến trúc/infrastructure.

### Conventional Commits
- `feat: <mô tả>` — Tính năng mới
- `fix: <mô tả>` — Sửa lỗi
- `refactor: <mô tả>` — Tái cấu trúc (không đổi logic)
- `chore: <mô tả>` — Dependencies, build script
- `docs: <mô tả>` — Tài liệu
- **VD:** `feat(dictionary): implement debounced auto-suggest for search bar`

---

## B2. Frontend (Next.js / React)

- **TypeScript 100%.** Không dùng `any` (trừ bất khả kháng, phải comment lý do).
- **Feature-based Component.** Nghiệp vụ → `features/`. Dùng chung → `shared/`.
- **Một file = Một default export.**
- **Server State:** Bắt buộc `TanStack React Query`. Cấm `useEffect` + `useState` để fetch.
- **Client State:** `Zustand`. Không Redux, không Context API.
- **Styling:** Tailwind CSS. Cấm inline styles `style={{ }}`.

---

## B3. Backend (Python FastAPI)

### Formatting & Linting
- Chuẩn **PEP 8**. Dùng `Ruff` linting + `Black` format.
- **Type Hints bắt buộc:**
  - ❌ `def get_word(word_id):`
  - ✅ `def get_word(word_id: UUID) -> WordResponseDTO:`

### Domain-Driven Design
- **Layer Isolation:** `Router` → `Service` → `Model`.
  - `Router` CHỈ nhận request, gọi Service, trả Response. Không viết logic IF/ELSE.
  - `Service` CHỈ chứa logic nghiệp vụ.
- **No Circular Imports:** Module A không import Model của Module B.

### Error Handling
- Cấm `try/except: pass`.
- Lỗi nghiệp vụ → `raise CustomHTTPException` (từ `core/exceptions.py`).

### Code Safety
- Prefer small single-responsibility modules.
- Validate tất cả external inputs. Fail fast on invalid config.
- Avoid hidden side effects, magic constants, hidden global state.
- Logs phải structured và actionable.

---

## B4. Database (PostgreSQL & Alembic)

### Naming
- **Table:** Danh từ số nhiều, `snake_case`. VD: `words`, `sign_assets`.
- **Column:** `snake_case`. VD: `created_at`, `is_active`.
- Không tiền tố dư thừa.

### Migrations
- **TUYỆT ĐỐI KHÔNG** dùng GUI tools ALTER TABLE trực tiếp trên server.
- Mọi thay đổi qua **Alembic**: `alembic revision --autogenerate -m "mô tả"`.

### Soft Delete
- Dữ liệu quan trọng: `is_active = FALSE`.
- Hard Delete chỉ cho bảng mapping hoặc log rác.

---

## B5. API Contract & Versioning

### Versioning
- Route bắt buộc prefix: `/api/v1/resource`.
- Đổi response contract → **bắt buộc** lên `/api/v2/`.

### Standard Response
```json
{
  "success": true,
  "message": "Mô tả trạng thái",
  "data": { },
  "meta": { "pagination": { "page": 1, "total": 50 } }
}
```

---

## B6. Background Jobs (Celery / Redis)

- **Quy tắc 500ms:** Tác vụ > 500ms → PHẢI đẩy vào Celery Queue. Trả FE `202 Accepted` + `task_id`.
- **Idempotent:** Task phải chịu retry 2-3 lần mà dữ liệu không sai (dùng `UPSERT`).

---

## B7. Static Content Data
- **KHÔNG** hardcode mảng content tĩnh trong component/hook.
- Lưu vào `src/data/<feature>.json` — 1 file per feature.
- Nếu feature có sub-group → dùng key trong cùng 1 JSON object.

---

# PHẦN C: NAMING CONVENTIONS TỔNG HỢP

| Ngữ cảnh | Quy ước | Ví dụ |
|---|---|---|
| DB Tables & Columns | `snake_case` | `word_id`, `sign_assets` |
| Python functions/vars | `snake_case` | `get_word_details()` |
| Python Classes | `PascalCase` | `WordService` |
| TS/JS functions/vars | `camelCase` | `getWordDetails()` |
| React Components | `PascalCase` | `FlipCard.tsx` |
| API Endpoints | `kebab-case` (noun) | `/api/v1/dictionary/search` |
| Git Branches | `type/kebab-case` | `feature/word-dictionary` |
| Commits | `type(scope): desc` | `feat(dictionary): add search` |

---

# PHẦN D: DOCUMENTATION SYNC (BẮT BUỘC)

Mỗi khi thêm/sửa tính năng, BẮT BUỘC cập nhật:

| File | Khi nào |
|---|---|
| `docs/FEATURES.md` | Mọi thay đổi tính năng |
| `docs/TASKS.md` | Task hoàn thành, task mới |
| `docs/ARCHITECTURE.md` | Thêm page/hook/component, đổi data flow |
| `docs/DATABASE.md` | Thêm/sửa table DB |
| `docs/PLAN.md` | Milestone thay đổi |
| `CHANGELOG.md` | Mọi thay đổi (version bump) |

**Không được phép:** Merge code mới mà không cập nhật docs tương ứng.

---

# PHẦN E: VERSIONING

Semantic Versioning: `MAJOR.MINOR.PATCH`
- **PATCH:** Bug fixes, small improvements.
- **MINOR:** New features, non-breaking changes.
- **MAJOR:** Architecture changes, breaking interface changes.

`CHANGELOG.md` entry phải có: date, version, changed files/modules, short description.
