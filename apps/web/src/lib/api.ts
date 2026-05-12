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
  part_of_speech: string | null;
  difficulty_level: number;
}

export async function searchWords(query: string): Promise<WordSearchResult[]> {
  const res = await apiFetch<WordSearchResult[]>(
    `/api/v1/dictionary/search?q=${encodeURIComponent(query)}&limit=10`
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
  context_usage: string | null;
  is_default: boolean;
  assets: SignAsset[];
}

export interface WordDetail {
  id: string;
  text_vn: string;
  normalized_text: string;
  part_of_speech: string | null;
  difficulty_level: number;
  semantic_tags: string[] | null;
  description: string | null;
  canonical_signs: CanonicalSign[];
}

export async function getWordDetail(wordId: string): Promise<WordDetail> {
  const res = await apiFetch<WordDetail>(`/api/v1/dictionary/words/${wordId}`);
  return res.data;
}
