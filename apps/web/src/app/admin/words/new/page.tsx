"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  createWord,
  listCategoriesAdmin,
  type CategoryInfo,
  type CanonicalSignInput,
} from "@/lib/admin-api";
import SignMediaPlayer from "@/components/shared/ui/SignMediaPlayer";
import { Save, Plus, Trash2, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";

const ENTRY_TYPES = [
  { value: "word", label: "Từ đơn" },
  { value: "phrase", label: "Cụm từ" },
  { value: "sentence", label: "Câu" },
];

const REGIONS = [
  { value: "standard", label: "Chuẩn" },
  { value: "north", label: "Miền Bắc" },
  { value: "central", label: "Miền Trung" },
  { value: "south", label: "Miền Nam" },
];

interface SignFormData {
  variant_name: string;
  region: string;
  is_default: boolean;
  video_url: string;
  video_format: string;
}

export default function AdminWordNewPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [textVn, setTextVn] = useState("");
  const [entryType, setEntryType] = useState("word");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Signs
  const [signs, setSigns] = useState<SignFormData[]>([
    { variant_name: "Chuẩn", region: "standard", is_default: true, video_url: "", video_format: "gdrive" },
  ]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        listCategoriesAdmin(session.access_token).then(setCategories).catch(() => {});
      }
    });
  }, []);

  const addSign = () => {
    setSigns((prev) => [
      ...prev,
      { variant_name: "", region: "north", is_default: false, video_url: "", video_format: "gdrive" },
    ]);
  };

  const removeSign = (idx: number) => {
    setSigns((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSign = (idx: number, field: keyof SignFormData, value: string | boolean) => {
    setSigns((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    );
  };

  const detectFormat = (url: string): string => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("drive.google.com")) return "gdrive";
    if (url.endsWith(".mp4")) return "mp4";
    if (url.endsWith(".webm")) return "webm";
    return "gdrive";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textVn.trim()) return;
    setError(null);
    setSaving(true);

    try {
      const canonicalSigns: CanonicalSignInput[] = signs.map((s) => ({
        variant_name: s.variant_name || null,
        region: s.region || null,
        is_default: s.is_default,
        assets: s.video_url
          ? [
              {
                media_type: "video",
                file_format: detectFormat(s.video_url),
                url: s.video_url,
                view_angle: "front",
                step_order: 1,
              },
            ]
          : [],
      }));

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await createWord(token, {
        text_vn: textVn.trim(),
        entry_type: entryType,
        part_of_speech: partOfSpeech || null,
        difficulty_level: difficultyLevel,
        semantic_tags: tags,
        description: description || null,
        category_ids: selectedCategoryIds,
        canonical_signs: canonicalSigns,
      });

      router.push("/admin/words");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tạo từ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/words"
          className="rounded-md p-1.5 text-muted transition hover:bg-surface-hover hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">Thêm từ mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Thông tin cơ bản ── */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Thông tin cơ bản</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Từ vựng *
              </label>
              <input
                value={textVn}
                onChange={(e) => setTextVn(e.target.value)}
                required
                placeholder="VD: Xin chào"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Loại
              </label>
              <select
                value={entryType}
                onChange={(e) => setEntryType(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                {ENTRY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Từ loại
              </label>
              <input
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                placeholder="VD: danh từ, động từ, tính từ"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">
                Độ khó (1-5)
              </label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {"⭐".repeat(n)}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Mô tả ngắn gọn về từ vựng"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">
                Tags (phân cách bởi dấu phẩy)
              </label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="VD: chào hỏi, cơ bản, lịch sự"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Chủ đề ── */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">Chủ đề</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-muted">Chưa có chủ đề. Tạo trong mục Chủ đề.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryIds((prev) =>
                        selected
                          ? prev.filter((id) => id !== cat.id)
                          : [...prev, cat.id],
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      selected
                        ? "bg-indigo-600 text-white"
                        : "bg-surface-hover text-muted hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Section 3: Biến thể vùng miền + Video ── */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Biến thể vùng miền & Video
            </h2>
            <button
              type="button"
              onClick={addSign}
              className="flex items-center gap-1 rounded-lg bg-surface-hover px-3 py-1.5 text-xs font-medium text-muted transition hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm biến thể
            </button>
          </div>

          <div className="space-y-6">
            {signs.map((sign, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border/50 bg-background p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Biến thể #{idx + 1}
                  </span>
                  {signs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSign(idx)}
                      className="rounded-md p-1 text-muted transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted">
                      Tên biến thể
                    </label>
                    <input
                      value={sign.variant_name}
                      onChange={(e) =>
                        updateSign(idx, "variant_name", e.target.value)
                      }
                      placeholder="VD: Chuẩn"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-muted">
                      Vùng miền
                    </label>
                    <select
                      value={sign.region}
                      onChange={(e) =>
                        updateSign(idx, "region", e.target.value)
                      }
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-indigo-500"
                    >
                      {REGIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={sign.is_default}
                        onChange={(e) =>
                          updateSign(idx, "is_default", e.target.checked)
                        }
                        className="rounded border-border"
                      />
                      Mặc định
                    </label>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="mb-1 block text-xs text-muted">
                    Link Video (Google Drive / YouTube / Direct URL)
                  </label>
                  <input
                    value={sign.video_url}
                    onChange={(e) =>
                      updateSign(idx, "video_url", e.target.value)
                    }
                    placeholder="VD: https://drive.google.com/file/d/xxx/view"
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Live Preview */}
                {sign.video_url && (
                  <div className="mt-3">
                    <div className="mb-1 flex items-center gap-1 text-xs text-muted">
                      <Eye className="h-3 w-3" />
                      Preview
                    </div>
                    <div className="max-w-md">
                      <SignMediaPlayer src={sign.video_url} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error & Submit */}
        {error && (
          <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !textVn.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Đang lưu..." : "Lưu từ vựng"}
          </button>
          <Link
            href="/admin/words"
            className="rounded-lg px-4 py-2.5 text-sm text-muted transition hover:bg-surface-hover"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
