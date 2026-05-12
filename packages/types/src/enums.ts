// ============================================================
// Media Types
// ============================================================
export type MediaType = "image" | "video" | "3d_model" | "landmark";
export type FileFormat = "webp" | "mp4" | "webm" | "glb" | "json";
export type ViewAngle = "front" | "side";

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
  | "educational_variant";

export type ContextUsage = "formal" | "informal" | "slang";

// ============================================================
// User Roles
// ============================================================
export type UserRole = "user" | "admin" | "moderator";
