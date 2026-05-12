"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bookmark, Loader2 } from "lucide-react";
import Link from "next/link";
import { getWordDetail } from "@/lib/api";
import { MediaRenderer } from "@/components/entities/MediaRenderer";

export default function WordDetailPage() {
  const params = useParams();
  const wordId = params.id as string;

  const { data: word, isLoading, error } = useQuery({
    queryKey: ["word", wordId],
    queryFn: () => getWordDetail(wordId),
    enabled: !!wordId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-lg text-muted">Không tìm thấy từ này.</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const defaultSign = word.canonical_signs.find((s) => s.is_default) || word.canonical_signs[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>

      {/* Word Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{word.text_vn}</h1>
          <div className="mt-2 flex items-center gap-2">
            {word.part_of_speech && (
              <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-medium text-primary">
                {word.part_of_speech}
              </span>
            )}
            <span className="rounded-full bg-surface-hover px-3 py-1 text-xs text-muted">
              Độ khó: {"⭐".repeat(word.difficulty_level)}
            </span>
          </div>
          {word.description && (
            <p className="mt-3 text-muted">{word.description}</p>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface
                     text-muted transition-all hover:border-primary hover:text-primary hover:shadow-md"
          title="Thêm vào sổ tay"
        >
          <Bookmark className="h-5 w-5" />
        </button>
      </div>

      {/* Media */}
      {defaultSign && defaultSign.assets.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Video / Hình ảnh</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {defaultSign.assets
              .sort((a, b) => a.step_order - b.step_order)
              .map((asset) => (
                <div key={asset.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                  <MediaRenderer asset={asset} className="w-full h-auto" />
                  {asset.view_angle && (
                    <div className="px-3 py-2 text-xs text-muted border-t border-border">
                      Góc nhìn: <span className="font-medium capitalize">{asset.view_angle}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Variants */}
      {word.canonical_signs.length > 1 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Biến thể</h2>
          <div className="flex flex-wrap gap-2">
            {word.canonical_signs.map((sign) => (
              <button
                key={sign.id}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  sign.is_default
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface hover:border-primary hover:text-primary"
                }`}
              >
                {sign.variant_name || sign.context_usage || "Mặc định"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
