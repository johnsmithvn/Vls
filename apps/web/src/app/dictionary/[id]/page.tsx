"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bookmark,
  Loader2,
  FileText,
  MessageSquare,
  Quote,
  MapPin,
  Play,
} from "lucide-react";
import Link from "next/link";
import { getWordDetail } from "@/lib/api";
import type { CanonicalSign, SignAsset } from "@/lib/api";
import { MediaRenderer } from "@/components/entities/MediaRenderer";

const ENTRY_TYPE_CONFIG = {
  word: { label: "Từ đơn", icon: FileText, color: "bg-blue-100 text-blue-700" },
  phrase: { label: "Cụm từ", icon: MessageSquare, color: "bg-emerald-100 text-emerald-700" },
  sentence: { label: "Câu thông dụng", icon: Quote, color: "bg-violet-100 text-violet-700" },
} as const;

const REGION_LABELS: Record<string, string> = {
  standard: "Chuẩn",
  north: "Miền Bắc",
  central: "Miền Trung",
  south: "Miền Nam",
};

export default function WordDetailPage() {
  const params = useParams();
  const wordId = params.id as string;
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);

  const {
    data: word,
    isLoading,
    error,
  } = useQuery({
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
          href="/dictionary"
          className="mt-4 inline-flex items-center gap-1 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại từ điển
        </Link>
      </div>
    );
  }

  // Sort variants: default first, then by region
  const sortedSigns = [...word.canonical_signs].sort((a, b) => {
    if (a.is_default) return -1;
    if (b.is_default) return 1;
    return 0;
  });

  const activeSign = sortedSigns[activeVariantIdx] || sortedSigns[0];
  const activeAssets = activeSign
    ? [...activeSign.assets].sort((a, b) => a.step_order - b.step_order)
    : [];

  const entryConfig =
    ENTRY_TYPE_CONFIG[word.entry_type as keyof typeof ENTRY_TYPE_CONFIG] ||
    ENTRY_TYPE_CONFIG.word;
  const EntryIcon = entryConfig.icon;

  const getVariantLabel = (sign: CanonicalSign): string => {
    if (sign.region && REGION_LABELS[sign.region]) {
      return REGION_LABELS[sign.region];
    }
    if (sign.variant_name) return sign.variant_name;
    if (sign.context_usage) return sign.context_usage;
    return "Mặc định";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <Link
        href="/dictionary"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại từ điển
      </Link>

      {/* ═══════ Word Header ═══════ */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {word.text_vn}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Entry type badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${entryConfig.color}`}
            >
              <EntryIcon className="h-3 w-3" />
              {entryConfig.label}
            </span>
            {/* Part of speech */}
            {word.part_of_speech && (
              <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-medium text-primary">
                {word.part_of_speech}
              </span>
            )}
            {/* Difficulty */}
            <span className="rounded-full bg-surface-hover px-3 py-1 text-xs text-muted">
              Độ khó: {"⭐".repeat(word.difficulty_level)}
            </span>
          </div>

          {/* Category tags */}
          {word.categories && word.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {word.categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/dictionary?category=${cat.slug}`}
                  className="rounded-full border border-border bg-surface-hover px-2.5 py-1 text-xs text-muted
                             hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {cat.icon} {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Description */}
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

      {/* ═══════ Variant Tabs (Region/Dialect) ═══════ */}
      {sortedSigns.length > 1 && (
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-1.5 text-sm text-muted">
            <MapPin className="h-4 w-4" />
            <span>Biến thể vùng miền</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedSigns.map((sign, idx) => (
              <button
                key={sign.id}
                onClick={() => setActiveVariantIdx(idx)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  idx === activeVariantIdx
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-border bg-surface hover:border-primary hover:text-primary"
                }`}
              >
                {getVariantLabel(sign)}
                {sign.is_default && (
                  <span className="ml-1.5 text-[10px] opacity-70">
                    (mặc định)
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════ Media Section ═══════ */}
      {activeAssets.length > 0 ? (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">
            {activeAssets.some((a) => a.media_type === "video")
              ? "Video & Hình ảnh"
              : "Hình ảnh"}
          </h2>

          {/* Step Timeline indicator */}
          {activeAssets.length > 1 && (
            <div className="mb-3 flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted">
                {activeAssets.length} bước — xem theo thứ tự
              </span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {activeAssets.map((asset: SignAsset, idx: number) => (
              <div
                key={asset.id}
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                <MediaRenderer asset={asset} className="w-full h-auto" />
                <div className="flex items-center justify-between px-3 py-2 border-t border-border">
                  {activeAssets.length > 1 && (
                    <span className="text-xs font-medium text-primary">
                      Bước {idx + 1}
                    </span>
                  )}
                  {asset.view_angle && (
                    <span className="text-xs text-muted">
                      Góc nhìn:{" "}
                      <span className="font-medium capitalize">
                        {asset.view_angle === "front"
                          ? "Chính diện"
                          : asset.view_angle === "side"
                            ? "Góc nghiêng"
                            : asset.view_angle}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-muted">
            Chưa có hình ảnh hoặc video cho ký hiệu này
          </p>
          <p className="mt-1 text-xs text-muted">
            Dữ liệu đang được bổ sung
          </p>
        </div>
      )}

      {/* ═══════ Semantic Tags ═══════ */}
      {word.semantic_tags && word.semantic_tags.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-muted">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {word.semantic_tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface-hover px-2.5 py-1 text-xs text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
