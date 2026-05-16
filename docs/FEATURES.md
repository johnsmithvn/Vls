# Thiết kế Tính năng & UX (Features Design)

---

## 1. TRIẾT LÝ THIẾT KẾ

### 1.1. Animation for Comprehension
- Không lạm dụng "wow effect" (parallax, floating vô nghĩa).
- Mọi micro-interaction phải phục vụ việc hiểu ký hiệu: **Playback transition**, **Gesture emphasis**, **Step progression**.

### 1.2. Accessibility (A11y) Toàn Diện
- **Keyboard navigation:** Tab + phím tắt playback (Space: play/pause, Arrow: tua).
- **Reduced motion:** Tôn trọng `@media (prefers-reduced-motion)`. Tắt Flip 3D nếu cần.
- **Screen Reader:** ARIA labels đầy đủ.

### 1.3. Error UX
- Không bao giờ "sập" toàn màn hình. Dùng Skeleton loading.
- **Partial Rendering:** Dịch 5 từ, rớt mạng ở từ thứ 4 → play được 3 từ đầu, từ thứ 4 hiện "Retry".

---

## 2. ĐẶC TẢ TÍNH NĂNG

### 2.1. Bảng Chữ Cái Liên Tưởng (Mnemonic Alphabet) ✅
- **UI:** Grid 29 chữ cái. Modal detail với tabs (Hình ảnh / Video / 3D).
- **Data:** Static JSON (`src/data/alphabet.json`). Không gọi API.
- **3D tab:** Chỉ hiện khi `model_3d` có giá trị (conditional rendering).
- **UX:** Click chữ cái → Modal hiển thị hình ảnh bàn tay + video hướng dẫn.
- **Hướng dẫn học:** Section "Bảng chữ cái ngón tay là gì?" ở cuối trang, giải thích luật đánh vần và khoảng cách từ.

### 2.2. Từ Điển — "Siêu Từ Điển" ✅ v1.0.0
Hỗ trợ 3 loại entry: **Từ đơn** (`word`), **Cụm từ** (`phrase`), **Câu thông dụng** (`sentence`).

#### 2.2.1. Dictionary Landing Page (`/dictionary`)
- **Search Bar:** Debounce 300ms, auto-suggest dropdown.
  - Kết quả hiện **EntryTypeBadge** phân biệt loại:
    - 🔵 Từ — `entry_type = 'word'`
    - 🟢 Cụm từ — `entry_type = 'phrase'`
    - 🟣 Câu — `entry_type = 'sentence'`
- **Category Browse Grid:** Danh sách chủ đề (Y tế 🏥, Gia đình 👨‍👩‍👦, Trường học 🏫...).
  - Click vào category → hiển thị danh sách từ thuộc category đó.
  - Mỗi category card hiện icon + tên + số lượng từ.
- **Entry Type Filter Tabs:** Lọc theo Tất cả / Từ đơn / Cụm từ / Câu.
- **Pagination:** Phân trang cho danh sách browse.

#### 2.2.2. Word Detail Page (`/dictionary/[id]`)
- **Header section:**
  - Tên từ (H1) + EntryTypeBadge + part_of_speech tag
  - Difficulty level (⭐ rating)
  - Category tags (clickable, link về browse)
  - Bookmark button
- **Regional Variant Tabs:**
  - Tabs cho Chuẩn / Miền Bắc / Miền Trung / Miền Nam (dùng `region` field)
  - Default variant highlighted
- **Media Section:**
  - **Polymorphic Media Carousel** (render ảnh/video/3D tùy `media_type`)
  - **Step Timeline:** Nếu ký hiệu gồm nhiều bước (`step_order`), hiện chỉ số bước
  - **View Angle labels:** Chính diện / Góc nghiêng
- **Semantic Tags:** Hiển thị tags dạng `#tag`
- **Random Suggestions:** "Gợi ý cho bạn" — Hiển thị 4 từ/cụm từ/câu ngẫu nhiên ở cuối trang. Seeded shuffle theo wordId để gợi ý khác nhau mỗi từ.

#### 2.2.3. API Endpoints
| Endpoint | Mô tả |
|---|---|
| `GET /dictionary/search?q=&entry_type=&category=` | Auto-suggest (status=published) |
| `GET /dictionary/words/{id}` | Chi tiết + variants + assets + categories |
| `GET /dictionary/categories` | Danh sách chủ đề + word count |
| `GET /dictionary/browse?category=&entry_type=&page=&limit=` | Browse với pagination |

### 2.3. Dịch Câu — 🚧 COMING SOON (LOCKED)
Trang `/translate` hiện tại hiển thị **Coming Soon UI** với navigation cards.

**Thiết kế đã có sẵn (deactivated, chờ data):**
- **Translation Mode Selector:** Cho phép user chọn chế độ dịch (Tự động / Từng từ / Đánh vần).
- **SignTimelinePlayer:** Mini Media Sequencing Engine.
- **3-Tier Resolution:** phrase_match → word_match → fingerspell.
- **Components bảo lưu:** `TranslationUI`, `TranslationModeSelector`, `SignTimelinePlayer` — sẽ kích hoạt khi có đủ data từ điển.

### 2.4. Sổ Tay & Learning Loop (Phase 2)
- **Bookmark:** User lưu từ vào sổ tay cá nhân (backend sẵn sàng).
- **Recent Signs:** Hiển thị trên trang chủ các ký hiệu vừa tra.
- **Slow-motion Replay & Compare Mode:** Xem chậm thao tác khó.
- **Spaced Repetition (Phase 3):** Gợi ý ôn tập từ khó.

---

## 3. MAKER-CHECKER PIPELINE (Schema Ready, UI Phase 2)

Trường `status` trên bảng `words` quản lý luồng kiểm duyệt:
```
draft → pending → approved → published
                           ↘ rejected
```
- **MVP:** Seed data mặc định `status = 'published'`. Admin tự quản lý qua DB.
- **Phase 2:** Admin Dashboard để duyệt nội dung (approve/reject).

---

## 4. CẤU TRÚC COMPONENT FRONTEND

Feature-Based (Không dùng Atomic Design):
```text
src/components/
├── features/               # Components nghiệp vụ
│   ├── dictionary/         # SearchBar, EntryTypeBadge
│   ├── hand3d/             # Hand3DViewer (lazy-loaded)
│   ├── translation/        # SignTimelinePlayer (deactivated)
│   └── notebook/           # SpacedRepetitionCard
├── shared/                 # Dumb components
│   ├── ui/                 # Button, Input, Skeleton, Modal
│   └── layout/             # Header (4 nav items: Tra cứu, Từ điển, Chữ cái, Dịch câu)
└── entities/               # MediaRenderer
```

### MediaRenderer Component
Tự quyết định render dựa trên `asset.media_type`:
- `image` → `<picture>` (WebP + fallback)
- `video` → `<video autoPlay loop muted playsInline>`
- `3d_model` → `<Canvas><Model /></Canvas>` (Phase 5)

---

## 5. NAVIGATION STRUCTURE (v1.2.0)

| Nav Item | Path | Status |
|---|---|---|
| Tra cứu | `/` | ✅ Active |
| Từ điển | `/dictionary` | ✅ Active |
| Chữ cái | `/alphabet` | ✅ Active |
| Dịch câu | `/translate` | 🚧 Coming Soon (badge) |
| Admin | `/admin` | ✅ Active (owner only) |

---

## 6. ADMIN CMS (v1.2.0) ✅

### 6.1. Phân quyền (RBAC)
- **Role `owner`:** Truy cập đầy đủ Admin (CRUD words, categories, dashboard).
- **Role `contributor`:** (Tương lai) Tạo từ mới, gửi duyệt (Maker-Checker).
- **Role `user`:** Người dùng thường, không truy cập Admin.
- **Auth:** Supabase Auth (Email/Password). Login form tại `/admin`.

### 6.2. Dashboard (`/admin`)
- Card thống kê: Tổng từ đơn, cụm từ, câu, chủ đề, video, hình ảnh.

### 6.3. Quản lý Từ vựng (`/admin/words`)
- Bảng danh sách: tên, loại, từ loại, video status, chủ đề.
- Search + Pagination.
- Thao tác: Sửa, Xóa (confirm dialog).

### 6.4. Form Tạo/Sửa Từ (`/admin/words/new`, `/admin/words/[id]/edit`)
- **Thông tin cơ bản:** Tên từ, loại (word/phrase/sentence), từ loại, độ khó, mô tả, tags.
- **Chủ đề:** Multi-select toggle buttons.
- **Biến thể vùng miền:** Thêm nhiều canonical_signs, mỗi sign có:
  - Tên biến thể, Vùng miền (Chuẩn/Bắc/Trung/Nam), checkbox Mặc định.
  - **Link Video:** Dán link Google Drive hoặc YouTube. Preview trực tiếp bằng `SignMediaPlayer`.

### 6.5. SignMediaPlayer (Shared Component)
- Auto-detect URL type: Google Drive → iframe `/preview`, YouTube → iframe `/embed`, Direct → `<video>`.
- Fallback UI khi URL rỗng hoặc không hợp lệ.
- Dùng chung ở cả Admin form (preview) và Dictionary detail (hiển thị).
