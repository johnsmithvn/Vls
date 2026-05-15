// ============================================================
// Media Types
// ============================================================
export type MediaType = "image" | "video" | "3d_model" | "landmark";
export type FileFormat = "webp" | "mp4" | "webm" | "glb" | "json";
export type ViewAngle = "front" | "side";

// ============================================================
// Entry Types (words table — Super Dictionary)
// ============================================================
export type EntryType = "word" | "phrase" | "sentence";

// ============================================================
// Content Status (Maker-Checker pipeline)
// ============================================================
export type ContentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "published"
  | "rejected";

// ============================================================
// Translation Types
// ============================================================
export type TranslationResultType =
  | "word_match"
  | "phrase_match"
  | "fingerspell"
  | "ai_generated";

export type TranslationMode = "auto" | "word_by_word" | "fingerspell";

// ============================================================
// Sign Variant Types
// ============================================================
export type VariantName =
  | "north_variant"
  | "south_variant"
  | "central_variant"
  | "educational_variant";

export type ContextUsage = "formal" | "informal" | "slang";

// ============================================================
// Region (Dialect management)
// ============================================================
export type Region = "north" | "central" | "south" | "standard";

// ============================================================
// User Roles
// ============================================================
export type UserRole = "user" | "admin" | "moderator";
