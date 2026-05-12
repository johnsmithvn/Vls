# Thiết kế Cơ sở Dữ liệu (Database Schema)

Thiết kế Schema theo triết lý **"Structured Sign Knowledge Graph"**: Tách biệt hoàn toàn `Word` (ngôn ngữ học) và `SignAsset` (media) thông qua lớp đệm `CanonicalSign` (phương ngữ/ngữ cảnh).

---

## 1. ENTITY RELATIONSHIP DIAGRAM

```text
┌──────────┐       ┌──────────────────┐       ┌──────────────┐
│  words   │ 1───N │ canonical_signs  │ 1───N │ sign_assets  │
└──────────┘       └──────────────────┘       └──────────────┘
     │                                              
     │ N                                            
     │                                              
┌──────────────────┐                                
│ user_bookmarks   │                                
└──────────────────┘                                
     │ N                                            
     │                                              
┌──────────┐                                        
│  users   │                                        
└──────────┘                                        
```

---

## 2. CHI TIẾT BẢNG (TABLE DEFINITIONS)

### 2.1. `words` (Linguistic Layer)
Lưu trữ metadata ngôn ngữ học. Phục vụ Grammar Engine, Search và AI.
```sql
CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_vn VARCHAR(255) NOT NULL,
    normalized_text VARCHAR(255) NOT NULL,
    part_of_speech VARCHAR(50),             -- 'noun', 'verb', 'adjective'...
    difficulty_level INTEGER DEFAULT 1,     -- 1-5
    semantic_tags TEXT[],                   -- Tags phục vụ Vector search
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_words_normalized ON words USING gin (normalized_text gin_trgm_ops);
CREATE INDEX idx_words_semantic_tags ON words USING gin (semantic_tags);
```

### 2.2. `canonical_signs` (Variant Layer)
Giải quyết bài toán 1 từ → nhiều biến thể ký hiệu (Bắc/Nam, Formal/Informal).
```sql
CREATE TABLE canonical_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    variant_name VARCHAR(100),              -- 'north_variant', 'south_variant'
    context_usage VARCHAR(100),             -- 'formal', 'slang'
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3. `sign_assets` (Polymorphic Media & Versioning)
Quản lý media đa định dạng. BẮT BUỘC có Content Versioning.
```sql
CREATE TABLE sign_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_sign_id UUID NOT NULL REFERENCES canonical_signs(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL,        -- 'image', 'video', '3d_model', 'landmark'
    file_format VARCHAR(10) NOT NULL,       -- 'webp', 'mp4', 'webm', 'glb', 'json'
    url TEXT NOT NULL,
    view_angle VARCHAR(20),                 -- 'front', 'side'
    step_order INTEGER DEFAULT 1,
    content_version INTEGER DEFAULT 1,      -- Tăng khi update, không ghi đè file cũ
    is_active BOOLEAN DEFAULT TRUE,         -- Soft-delete cho version management
    metadata JSONB,                         -- { duration_ms, width, height, fps }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.4. `users` & `user_bookmarks`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,                    -- Từ Supabase Auth
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);
```

### 2.5. `query_logs` (Data-driven Growth)
Ghi nhận mỗi lần token bị fallback xuống fingerspell. Dùng để xếp hạng từ cần ưu tiên bổ sung media.
```sql
CREATE TABLE query_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text VARCHAR(500) NOT NULL,       -- Câu gốc user nhập
    token_text VARCHAR(255) NOT NULL,       -- Từ bị fallback
    result_type VARCHAR(20) NOT NULL,       -- 'word_match', 'phrase_match', 'fingerspell'
    user_id UUID REFERENCES users(id),      -- Nullable (anonymous users)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_query_logs_token ON query_logs(token_text);
CREATE INDEX idx_query_logs_type ON query_logs(result_type);
```

---

## 3. QUY TẮC DỮ LIỆU (DATA RULES)

### 3.1. Soft Delete
- Dữ liệu quan trọng (`sign_assets`) dùng `is_active = FALSE`. Không `DELETE FROM`.
- Chỉ Hard Delete cho bảng mapping (`user_bookmarks`) hoặc log rác.

### 3.2. Content Versioning
- Khi admin update video/ảnh mới cho một Sign: Tăng `content_version`, set bản cũ `is_active = FALSE`.
- App cache và AI embedding sẽ invalidate dựa trên `content_version`.

### 3.3. Metadata JSONB
Cột `metadata` trong `sign_assets` chứa thông tin mở rộng theo `media_type`:
| media_type | metadata fields |
|---|---|
| `image` | `{ width, height }` |
| `video` | `{ duration_ms, width, height, fps }` |
| `3d_model` | `{ polygon_count, rig_type }` |
| `landmark` | `{ frame_count, landmark_format }` |

### 3.4. Migration Rules
- Mọi thay đổi DB phải qua **Alembic** (`alembic revision --autogenerate`).
- **TUYỆT ĐỐI KHÔNG** dùng GUI tools để ALTER TABLE trực tiếp trên server.
