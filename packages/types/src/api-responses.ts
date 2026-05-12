// ============================================================
// Standard API Response Contract
// ALL endpoints MUST return this shape.
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiMeta {
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  [key: string]: unknown;
}

// ============================================================
// Error Response
// ============================================================

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  meta?: ApiMeta;
}
