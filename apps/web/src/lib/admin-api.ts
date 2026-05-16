/**
 * Admin API client — CRUD operations for admin panel.
 * Requires JWT token from Supabase Auth with owner role.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: Record<string, unknown> | null;
}

async function adminFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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


// ── Dashboard ───────────────────────────────────────────────

export interface DashboardStats {
  total_words: number;
  total_phrases: number;
  total_sentences: number;
  total_categories: number;
  total_videos: number;
  total_images: number;
}

export async function getDashboardStats(token: string): Promise<DashboardStats> {
  const res = await adminFetch<DashboardStats>("/api/v1/admin/dashboard", token);
  return res.data;
}


// ── Word CRUD ───────────────────────────────────────────────

export interface AdminWordListItem {
  id: string;
  text_vn: string;
  entry_type: string;
  part_of_speech: string | null;
  difficulty_level: number;
  status: string;
  has_video: boolean;
  category_names: string[];
  created_at: string | null;
}

export interface AdminWordListMeta {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function listWordsAdmin(
  token: string,
  options: { page?: number; limit?: number; search?: string; entry_type?: string } = {},
): Promise<{ data: AdminWordListItem[]; meta: AdminWordListMeta }> {
  const params = new URLSearchParams();
  if (options.page) params.set("page", String(options.page));
  if (options.limit) params.set("limit", String(options.limit));
  if (options.search) params.set("search", options.search);
  if (options.entry_type) params.set("entry_type", options.entry_type);

  const res = await adminFetch<AdminWordListItem[]>(
    `/api/v1/admin/words?${params.toString()}`,
    token,
  );
  return { data: res.data, meta: res.meta as unknown as AdminWordListMeta };
}


export interface SignAssetInput {
  media_type: string;
  file_format: string;
  url: string;
  view_angle?: string | null;
  step_order?: number;
  metadata?: Record<string, unknown> | null;
}

export interface CanonicalSignInput {
  variant_name?: string | null;
  region?: string | null;
  context_usage?: string | null;
  is_default?: boolean;
  assets: SignAssetInput[];
}

export interface WordCreateInput {
  text_vn: string;
  entry_type?: string;
  part_of_speech?: string | null;
  difficulty_level?: number;
  semantic_tags?: string[];
  description?: string | null;
  category_ids?: string[];
  canonical_signs?: CanonicalSignInput[];
}

export interface WordUpdateInput {
  text_vn?: string;
  entry_type?: string;
  part_of_speech?: string | null;
  difficulty_level?: number;
  semantic_tags?: string[];
  description?: string | null;
  category_ids?: string[];
  canonical_signs?: CanonicalSignInput[];
}

export async function createWord(
  token: string,
  data: WordCreateInput,
): Promise<{ id: string; text_vn: string }> {
  const res = await adminFetch<{ id: string; text_vn: string }>(
    "/api/v1/admin/words",
    token,
    { method: "POST", body: JSON.stringify(data) },
  );
  return res.data;
}

export async function updateWord(
  token: string,
  wordId: string,
  data: WordUpdateInput,
): Promise<{ id: string; text_vn: string }> {
  const res = await adminFetch<{ id: string; text_vn: string }>(
    `/api/v1/admin/words/${wordId}`,
    token,
    { method: "PUT", body: JSON.stringify(data) },
  );
  return res.data;
}

export async function deleteWord(token: string, wordId: string): Promise<void> {
  await adminFetch<null>(`/api/v1/admin/words/${wordId}`, token, {
    method: "DELETE",
  });
}

export interface AdminWordDetail {
  id: string;
  text_vn: string;
  normalized_text: string;
  entry_type: string;
  part_of_speech: string | null;
  difficulty_level: number;
  semantic_tags: string[] | null;
  description: string | null;
  categories: CategoryInfo[];
  canonical_signs: {
    id: string;
    variant_name: string | null;
    region: string | null;
    context_usage: string | null;
    is_default: boolean;
    assets: {
      id: string;
      media_type: string;
      file_format: string;
      url: string;
      view_angle: string | null;
      step_order: number;
      content_version: number;
      asset_metadata: Record<string, unknown> | null;
    }[];
  }[];
}

export async function getWordDetailAdmin(
  token: string,
  wordId: string,
): Promise<AdminWordDetail> {
  const res = await adminFetch<AdminWordDetail>(
    `/api/v1/admin/words/${wordId}`,
    token,
  );
  return res.data;
}


// ── Categories ──────────────────────────────────────────────

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
}

export async function listCategoriesAdmin(token: string): Promise<CategoryInfo[]> {
  const res = await adminFetch<CategoryInfo[]>("/api/v1/admin/categories", token);
  return res.data;
}

export async function createCategory(
  token: string,
  data: { name: string; slug: string; description?: string; icon?: string; display_order?: number },
): Promise<CategoryInfo> {
  const res = await adminFetch<CategoryInfo>("/api/v1/admin/categories", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteCategory(token: string, catId: string): Promise<void> {
  await adminFetch<null>(`/api/v1/admin/categories/${catId}`, token, {
    method: "DELETE",
  });
}
