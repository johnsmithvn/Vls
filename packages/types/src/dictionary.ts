import type {
  MediaType,
  FileFormat,
  ViewAngle,
  VariantName,
  ContextUsage,
} from "./enums";

// ============================================================
// Dictionary DTOs
// ============================================================

export interface WordDTO {
  id: string;
  text_vn: string;
  normalized_text: string;
  part_of_speech: string | null;
  difficulty_level: number;
  semantic_tags: string[];
  description: string | null;
  canonical_signs: CanonicalSignDTO[];
}

export interface CanonicalSignDTO {
  id: string;
  variant_name: VariantName | null;
  context_usage: ContextUsage | null;
  is_default: boolean;
  assets: SignAssetDTO[];
}

export interface SignAssetDTO {
  id: string;
  media_type: MediaType;
  file_format: FileFormat;
  url: string;
  view_angle: ViewAngle | null;
  step_order: number;
  content_version: number;
  metadata: SignAssetMetadata | null;
}

export interface SignAssetMetadata {
  duration_ms?: number;
  width?: number;
  height?: number;
  fps?: number;
  polygon_count?: number;
  rig_type?: string;
  frame_count?: number;
  landmark_format?: string;
}

// ============================================================
// Search Result
// ============================================================

export interface WordSearchResultDTO {
  id: string;
  text_vn: string;
  part_of_speech: string | null;
  difficulty_level: number;
}
