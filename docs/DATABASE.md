# Thiết kế Cơ sở Dữ liệu (Database Schema)

Thiết kế Schema theo triết lý **"Structured Sign Knowledge Graph"**: Tách biệt hoàn toàn `Word` (ngôn ngữ học) và `SignAsset` (media) thông qua lớp đệm `CanonicalSign` (phương ngữ/ngữ cảnh). Hỗ trợ "Siêu từ điển" (từ đơn + cụm từ + câu thông dụng).

---

## 1. ENTITY RELATIONSHIP DIAGRAM

```text
┌──────────┐       ┌──────────────────┐       ┌──────────────┐
│  words   │ 1───N │ canonical_signs  │ 1───N │ sign_assets  │
└──────────┘       └──────────────────┘       └──────────────┘
     │ N                                            
     │                                              
┌──────────────────┐                                
│ word_categories  │                                
└──────────────────┘                                
     │ N                                            
┌──────────────┐                                    
│  categories  │                                    
└──────────────┘                                    

┌──────────────────┐                                
│ user_bookmarks   │ N──1 users                     
└──────────────────┘ N──1 words                     

┌──────────────┐                                    
│ query_logs   │ N──1 users (nullable)              
└──────────────┘                                    
```

---

## 2. CHI TIẾT BẢNG (TABLE DEFINITIONS)

### 2.1. `words` (Linguistic Layer — "Siêu Từ Điển")
Lưu trữ metadata ngôn ngữ học cho từ đơn, cụm từ, và câu thông dụng.
```sql
CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_vn VARCHAR(255) NOT NULL,
    normalized_text VARCHAR(255) NOT NULL,
    entry_type VARCHAR(20) NOT NULL DEFAULT 'word',  -- 'word' | 'phrase' | 'sentence'
    part_of_speech VARCHAR(50),             -- 'noun', 'verb', 'adjective'...
    difficulty_level INTEGER DEFAULT 1,     -- 1-5
    semantic_tags TEXT[],                   -- Tags phục vụ Vector search
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'published', -- 'draft'|'pending'|'approved'|'published'|'rejected'
    contributed_by UUID REFERENCES users(id),         -- Maker-Checker: ai đóng góp
    reviewed_by UUID REFERENCES users(id),            -- Maker-Checker: ai duyệt
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_words_normalized ON words USING gin (normalized_text gin_trgm_ops);
CREATE INDEX idx_words_semantic_tags ON words USING gin (semantic_tags);
CREATE INDEX idx_words_entry_type ON words (entry_type);
CREATE INDEX idx_words_status ON words (status);
```

### 2.2. `categories` (Semantic Categorization)
Phân loại từ vựng theo chủ đề để hỗ trợ Browse UI.
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),                       -- Emoji hoặc icon name
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3. `word_categories` (Many-to-Many Bridge)
```sql
CREATE TABLE word_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(word_id, category_id)
);
CREATE INDEX idx_word_categories_word ON word_categories (word_id);
CREATE INDEX idx_word_categories_category ON word_categories (category_id);
```

### 2.4. `canonical_signs` (Variant Layer)
Giải quyết bài toán 1 từ → nhiều biến thể ký hiệu (Bắc/Trung/Nam, Formal/Informal).
```sql
CREATE TABLE canonical_signs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    variant_name VARCHAR(100),              -- 'north_variant', 'south_variant'
    region VARCHAR(20),                     -- 'north' | 'central' | 'south' | 'standard'
    context_usage VARCHAR(100),             -- 'formal', 'slang'
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.5. `sign_assets` (Polymorphic Media & Versioning)
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

### 2.6. `users` & `user_bookmarks`
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

### 2.7. `query_logs` (Data-driven Growth)
Ghi nhận mỗi lần token bị fallback xuống fingerspell.
```sql
CREATE TABLE query_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text VARCHAR(500) NOT NULL,
    token_text VARCHAR(255) NOT NULL,
    result_type VARCHAR(20) NOT NULL,
    user_id UUID REFERENCES users(id),
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

### 3.3. Maker-Checker Pipeline
- Trường `status` quản lý luồng kiểm duyệt: `draft → pending → approved → published`.
- Seed data mặc định `status = 'published'`.
- Admin UI review (Phase sau): Xem từ pending, approve/reject.

### 3.4. Metadata JSONB
Cột `metadata` trong `sign_assets` chứa thông tin mở rộng theo `media_type`:
| media_type | metadata fields |
|---|---|
| `image` | `{ width, height }` |
| `video` | `{ duration_ms, width, height, fps }` |
| `3d_model` | `{ polygon_count, rig_type }` |
| `landmark` | `{ frame_count, landmark_format }` |

### 3.5. Migration Rules
- Mọi thay đổi DB phải qua **Alembic** (`alembic revision --autogenerate`).
- **TUYỆT ĐỐI KHÔNG** dùng GUI tools để ALTER TABLE trực tiếp trên server.

### 3.6. Media Storage
- **Supabase Storage** — Đồng bộ với DB và Auth, hỗ trợ RLS policies.
- Không dùng `public/` folder cho video/ảnh (phình code, chậm build).
