"use client";

import { BookOpen, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function NotebookPage() {
  // TODO: Connect to API in Sprint 1.4 completion
  const bookmarks: { id: string; word_id: string; text_vn: string }[] = [];
  const isLoading = false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Sổ tay của tôi</h1>
          <p className="text-sm text-muted">Các từ bạn đã lưu để học</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted/40" />
          <h3 className="mb-1 font-semibold text-muted">Chưa có từ nào</h3>
          <p className="mb-4 text-sm text-muted">
            Nhấn biểu tượng 🔖 trên trang chi tiết từ để lưu vào sổ tay.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Bắt đầu tra cứu
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {bookmarks.map((b) => (
            <li
              key={b.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 shadow-sm"
            >
              <Link
                href={`/dictionary/${b.word_id}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {b.text_vn}
              </Link>
              <button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
