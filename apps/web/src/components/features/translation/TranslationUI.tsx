"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Loader2, BarChart3, AlertCircle } from "lucide-react";
import { translateText, type ResolvedToken, type TranslationMode } from "@/lib/api";

export function TranslationInput({
  onResult,
  mode = "auto",
}: {
  onResult: (data: Awaited<ReturnType<typeof translateText>>) => void;
  mode?: TranslationMode;
}) {
  const [text, setText] = useState("");

  const mutation = useMutation({
    mutationFn: (inputText: string) => translateText(inputText, mode),
    onSuccess: (data) => onResult(data),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    mutation.mutate(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập câu tiếng Việt để dịch..."
        className="w-full rounded-xl border border-border bg-surface px-4 py-3.5 pr-12
                   text-base shadow-sm transition-all
                   placeholder:text-muted
                   focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        disabled={mutation.isPending}
      />
      <button
        type="submit"
        disabled={!text.trim() || mutation.isPending}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center
                   rounded-lg bg-primary text-white transition-all
                   hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}

export function SignTimeline({
  results,
  stats,
}: {
  results: ResolvedToken[];
  stats: {
    total_tokens: number;
    phrase_match: number;
    word_match: number;
    fingerspell: number;
    coverage: number;
  };
}) {
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
        <BarChart3 className="h-4 w-4 text-primary" />
        <div className="flex flex-1 items-center gap-3 text-sm">
          <span className="font-medium">
            {stats.coverage}% <span className="text-muted">coverage</span>
          </span>
          <div className="h-4 w-px bg-border" />
          {stats.phrase_match > 0 && (
            <span className="text-emerald-600">{stats.phrase_match} cụm từ</span>
          )}
          {stats.word_match > 0 && (
            <span className="text-primary">{stats.word_match} từ</span>
          )}
          {stats.fingerspell > 0 && (
            <span className="text-amber-600">{stats.fingerspell} đánh vần</span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-wrap gap-2">
        {results.map((token, i) => (
          <TokenCard key={`${token.token}-${i}`} token={token} />
        ))}
      </div>
    </div>
  );
}

function TokenCard({ token }: { token: ResolvedToken }) {
  const isFingerspell = token.result_type === "fingerspell";
  const isPhrase = token.result_type === "phrase_match";

  const borderColor = isFingerspell
    ? "border-amber-300 bg-amber-50"
    : isPhrase
      ? "border-emerald-300 bg-emerald-50"
      : "border-primary/30 bg-primary-subtle";

  const labelColor = isFingerspell
    ? "text-amber-700"
    : isPhrase
      ? "text-emerald-700"
      : "text-primary";

  const tagText = isFingerspell
    ? "đánh vần"
    : isPhrase
      ? "cụm từ"
      : "từ đơn";

  return (
    <div
      className={`relative flex flex-col items-center rounded-xl border p-3 shadow-sm transition-all hover:shadow-md ${borderColor}`}
    >
      {/* Fingerspell warning */}
      {isFingerspell && (
        <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white">
          <AlertCircle className="h-3 w-3" />
        </div>
      )}

      {/* Sign visual */}
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-lg bg-white/60">
        {isFingerspell && token.letters ? (
          <div className="flex gap-0.5">
            {token.letters.slice(0, 5).map((l, i) => (
              <span key={i} className="text-xs font-bold text-amber-700">
                {l.token}
              </span>
            ))}
            {token.letters.length > 5 && (
              <span className="text-xs text-amber-500">…</span>
            )}
          </div>
        ) : (
          <span className="text-2xl">🤟</span>
        )}
      </div>

      {/* Token text */}
      <span className="text-sm font-semibold">{token.token}</span>

      {/* Type tag */}
      <span className={`mt-1 text-[10px] font-medium ${labelColor}`}>
        {tagText}
      </span>

      {/* Fingerspell helper text */}
      {isFingerspell && (
        <p className="mt-1 max-w-[120px] text-center text-[9px] text-amber-600/70">
          Chưa có ký hiệu, đang đánh vần
        </p>
      )}
    </div>
  );
}
