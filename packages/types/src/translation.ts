import type { TranslationResultType, TranslationMode } from "./enums";
import type { SignAssetDTO } from "./dictionary";

// ============================================================
// Translation DTOs
// ============================================================

export interface TranslationRequestDTO {
  text: string;
  mode: TranslationMode;
}

export interface TranslationResponseDTO {
  original_text: string;
  tokens: TranslationTokenDTO[];
}

export interface TranslationTokenDTO {
  text: string;
  result_type: TranslationResultType;
  assets?: SignAssetDTO[];
  letters?: string[]; // Only for fingerspell
}
