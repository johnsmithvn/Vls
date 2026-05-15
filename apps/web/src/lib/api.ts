const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: Record<string, unknown> | null;
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Network error" }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }

  return res.json();
}

// ── Dictionary ────────────────────────────────────────────

export interface WordSearchResult {
  id: string;
  text_vn: string;
  entry_type: "word" | "phrase" | "sentence";
  part_of_speech: string | null;
  difficulty_level: number;
  description: string | null;
}

export interface SearchOptions {
  limit?: number;
  entry_type?: string;
  category?: string;
}

export async function searchWords(
  query: string,
  options: SearchOptions = {},
): Promise<WordSearchResult[]> {
  const params = new URLSearchParams({ q: query });
  if (options.limit) params.set("limit", String(options.limit));
  if (options.entry_type) params.set("entry_type", options.entry_type);
  if (options.category) params.set("category", options.category);

  const res = await apiFetch<WordSearchResult[]>(
    `/api/v1/dictionary/search?${params.toString()}`
  );
  return res.data;
}

export interface SignAsset {
  id: string;
  media_type: string;
  file_format: string;
  url: string;
  view_angle: string | null;
  step_order: number;
  content_version: number;
  asset_metadata: Record<string, unknown> | null;
}

export interface CanonicalSign {
  id: string;
  variant_name: string | null;
  region: string | null;
  context_usage: string | null;
  is_default: boolean;
  assets: SignAsset[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

export interface WordDetail {
  id: string;
  text_vn: string;
  normalized_text: string;
  entry_type: "word" | "phrase" | "sentence";
  part_of_speech: string | null;
  difficulty_level: number;
  semantic_tags: string[] | null;
  description: string | null;
  categories: CategoryInfo[];
  canonical_signs: CanonicalSign[];
}

export async function getWordDetail(wordId: string): Promise<WordDetail> {
  const res = await apiFetch<WordDetail>(`/api/v1/dictionary/words/${wordId}`);
  return res.data;
}

// ── Categories ───────────────────────────────────────────

export interface CategoryWithCount extends CategoryInfo {
  word_count: number;
}

export async function getCategories(): Promise<CategoryWithCount[]> {
  const res = await apiFetch<CategoryWithCount[]>("/api/v1/dictionary/categories");
  return res.data;
}

// ── Browse ───────────────────────────────────────────────

export interface WordBrowseItem {
  id: string;
  text_vn: string;
  entry_type: "word" | "phrase" | "sentence";
  part_of_speech: string | null;
  difficulty_level: number;
  description: string | null;
  has_video: boolean;
}

export interface BrowseMeta {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    category: string | null;
    entry_type: string | null;
  };
}

export interface BrowseOptions {
  category?: string;
  entry_type?: string;
  page?: number;
  limit?: number;
}

export async function browseWords(
  options: BrowseOptions = {},
): Promise<{ data: WordBrowseItem[]; meta: BrowseMeta }> {
  const params = new URLSearchParams();
  if (options.category) params.set("category", options.category);
  if (options.entry_type) params.set("entry_type", options.entry_type);
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));

  const res = await apiFetch<WordBrowseItem[]>(
    `/api/v1/dictionary/browse?${params.toString()}`
  );
  return { data: res.data, meta: res.meta as unknown as BrowseMeta };
}

// ── Translation ──────────────────────────────────────────

export type TranslationMode = "auto" | "word_by_word" | "fingerspell";

export interface TranslationSignAsset {
  id: string;
  media_type: string;
  url: string;
  file_format: string;
  view_angle: string | null;
  step_order: number;
  metadata: Record<string, unknown> | null;
}

export interface TranslationSign {
  sign_id: string | null;
  assets: TranslationSignAsset[];
  variant_name: string | null;
}

export interface ResolvedToken {
  token: string;
  result_type: "phrase_match" | "word_match" | "fingerspell";
  word_id: string | null;
  sign: TranslationSign | null;
  letters: ResolvedToken[] | null;
}

export interface TranslationResult {
  original_text: string;
  tokens: string[];
  results: ResolvedToken[];
  stats: {
    total_tokens: number;
    phrase_match: number;
    word_match: number;
    fingerspell: number;
    coverage: number;
  };
}

export async function translateText(
  text: string,
  mode: TranslationMode = "auto",
): Promise<TranslationResult> {
  const res = await apiFetch<TranslationResult>("/api/v1/translation/translate", {
    method: "POST",
    body: JSON.stringify({ text, mode }),
  });
  return res.data;
}
