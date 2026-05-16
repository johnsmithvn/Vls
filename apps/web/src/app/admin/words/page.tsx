"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  listWordsAdmin,
  deleteWord,
  type AdminWordListItem,
} from "@/lib/admin-api";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Video,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminWordsPage() {
  const [words, setWords] = useState<AdminWordListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchWords = useCallback(
    async (t: string) => {
      setLoading(true);
      try {
        const res = await listWordsAdmin(t, {
          page,
          limit,
          search: search || undefined,
        });
        setWords(res.data);
        setTotal(res.meta.pagination.total);
      } catch {
        /* handled by admin layout auth */
      } finally {
        setLoading(false);
      }
    },
    [page, search],
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        fetchWords(session.access_token);
      }
    });
  }, [fetchWords]);

  const handleDelete = async (id: string, text: string) => {
    if (!confirm(`Xóa "${text}"?`)) return;
    try {
      await deleteWord(token, id);
      await fetchWords(token);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa");
    }
  };

  const entryTypeLabel: Record<string, string> = {
    word: "Từ",
    phrase: "Cụm từ",
    sentence: "Câu",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Từ vựng</h1>
        <Link
          href="/admin/words/new"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Thêm từ mới
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted">
                Từ vựng
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted">
                Loại
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted">
                Từ loại
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted">
                Video
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted">
                Chủ đề
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="h-5 w-full animate-pulse rounded bg-surface" />
                  </td>
                </tr>
              ))
            ) : words.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted"
                >
                  Không tìm thấy từ vựng nào
                </td>
              </tr>
            ) : (
              words.map((word) => (
                <tr
                  key={word.id}
                  className="border-b border-border last:border-0 transition hover:bg-surface/30"
                >
                  <td className="px-4 py-3 font-medium">{word.text_vn}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface-hover px-2 py-0.5 text-xs">
                      {entryTypeLabel[word.entry_type] || word.entry_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {word.part_of_speech || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {word.has_video ? (
                      <Video className="mx-auto h-4 w-4 text-emerald-400" />
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {word.category_names.map((cat) => (
                        <span
                          key={cat}
                          className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-xs text-indigo-400"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/words/${word.id}/edit`}
                        className="rounded-md p-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(word.id, word.text_vn)}
                        className="rounded-md p-1.5 text-muted transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted">
            Trang {page}/{totalPages} · {total} từ
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md p-1.5 text-muted transition hover:bg-surface-hover disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md p-1.5 text-muted transition hover:bg-surface-hover disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
