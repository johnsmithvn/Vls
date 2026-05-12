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

## 2. ĐẶC TẢ TÍNH NĂNG (MVP & NEXT)

### 2.1. Bảng Chữ Cái Liên Tưởng (Mnemonic Alphabet)
- **UI:** Grid 29 chữ cái. Component `FlipCard 3D` (Framer Motion).
- **UX:** Chạm để lật → mặt sau hiện hình ảnh bàn tay lồng ghép đồ vật mnemonic.

### 2.2. Tra Cứu Từ Vựng (Word Dictionary)
- **Hero Search Bar:** Trung tâm màn hình, debounce 300ms, auto-suggest dropdown.
- **Word Detail Page:**
  - Khu vực 1: Tên từ (H1) + nút Bookmark.
  - Khu vực 2: **Polymorphic Media Carousel** (render ảnh/video/3D tùy `media_type`).
  - Khu vực 3: View Angle Tabs + text mô tả từng bước.
- **Adaptive Video Strategy:** `WebP animated` (preview nhẹ) → `WebM` (playback) → `MP4` (fallback).

### 2.3. Dịch Câu — SignTimelinePlayer
Đây là **Mini Media Sequencing Engine**, không phải slider ảnh tĩnh.

- **Translation Mode Selector:** Cho phép user chọn chế độ dịch:
  | Mode | Mô tả |
  |---|---|
  | `Tự động` | Hệ thống tự chọn Tier tốt nhất (mặc định) |
  | `Từng từ` | Luôn dịch word-by-word, bỏ qua phrase matching |
  | `Đánh vần` | Luôn fingerspell toàn bộ (dùng khi luyện chữ cái) |

- **Timing Engine:** Đọc `duration_ms` từ `metadata` của từng `SignAsset`. Không dùng Fixed Timer.
- **Playback Controls:** Play/Pause, Speed (0.5x, 1x, 1.5x).
- **Fingerspell Visual Cue:** Khi fallback xuống Tier 3, hiển thị icon ❓ + text mờ: *"Từ này chưa có ký hiệu, đang hiển thị đánh vần..."*
- **Translation Result Types** (Backend trả về flag để FE render đúng):
  | Type | Ý nghĩa |
  |---|---|
  | `word_match` | Khớp chính xác trong DB |
  | `phrase_match` | Khớp cụm từ |
  | `fingerspell` | Đánh vần từng chữ cái (Fallback cho từ chưa có) |
  | `ai_generated` | Sinh bởi AI (Phase 3) |

### 2.4. Sổ Tay & Learning Loop
- **Recent Signs:** Hiển thị trên trang chủ các ký hiệu vừa tra.
- **Slow-motion Replay & Compare Mode:** Xem chậm thao tác khó.
- **Spaced Repetition (Tương lai):** Gợi ý ôn tập từ khó.

---

## 3. CẤU TRÚC COMPONENT FRONTEND

Feature-Based (Không dùng Atomic Design):
```text
src/components/
├── features/               # Components nghiệp vụ
│   ├── dictionary/         # WordDetail, AssetCarousel
│   ├── translation/        # SignTimelinePlayer, ChatInput
│   └── notebook/           # SpacedRepetitionCard
├── shared/                 # Dumb components
│   ├── ui/                 # Button, Input, Skeleton, Modal
│   └── layout/             # Header, NavigationBar
└── entities/               # MediaRenderer
```

### MediaRenderer Component
Tự quyết định render dựa trên `asset.media_type`:
- `image` → `<picture>` (WebP + fallback)
- `video` → `<video autoPlay loop muted playsInline>`
- `3d_model` → `<Canvas><Model /></Canvas>` (Phase 5)
