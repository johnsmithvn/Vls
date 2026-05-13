"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { TranslationInput } from "@/components/features/translation/TranslationUI";
import { TranslationModeSelector } from "@/components/features/translation/TranslationModeSelector";
import { SignTimelinePlayer } from "@/components/features/translation/SignTimelinePlayer";
import type { TranslationResult, TranslationMode } from "@/lib/api";

export default function TranslatePage() {
  const [mode, setMode] = useState<TranslationMode>("auto");
  const [result, setResult] = useState<TranslationResult | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Languages className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Dịch sang Ngôn ngữ Ký hiệu
          </h1>
        </div>
        <p className="text-muted">
          Nhập câu tiếng Việt → xem chuỗi ký hiệu tương ứng.
          Từ chưa có sẽ được đánh vần tự động.
        </p>
      </div>

      {/* Mode selector */}
      <div className="mb-4">
        <TranslationModeSelector value={mode} onChange={setMode} />
      </div>

      {/* Input */}
      <div className="mb-6">
        <TranslationInput onResult={setResult} mode={mode} />
      </div>

      {/* Results — SignTimelinePlayer */}
      {result && (
        <div className="space-y-6">
          {/* Original text echo */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted mb-1">Văn bản gốc</p>
            <p className="font-medium">{result.original_text}</p>
            <p className="mt-1 text-xs text-muted">
              Tokens: {result.tokens.join(" → ")}
            </p>
          </div>

          {/* Timeline Player */}
          <SignTimelinePlayer results={result.results} stats={result.stats} />
        </div>
      )}

      {/* Empty state */}
      {!result && (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <Languages className="mx-auto mb-3 h-12 w-12 text-muted/40" />
          <h3 className="mb-1 font-semibold text-muted">Bắt đầu dịch</h3>
          <p className="text-sm text-muted">
            Nhập câu như &quot;Mẹ yêu con&quot; hoặc &quot;Tôi đi học&quot; để xem kết quả.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["Xin chào", "Mẹ yêu con", "Tôi đi học", "Cảm ơn bạn"].map(
              (example) => (
                <button
                  key={example}
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>(
                      'input[type="text"]',
                    );
                    if (input) {
                      const nativeInputValueSetter =
                        Object.getOwnPropertyDescriptor(
                          window.HTMLInputElement.prototype,
                          "value",
                        )?.set;
                      nativeInputValueSetter?.call(input, example);
                      input.dispatchEvent(
                        new Event("input", { bubbles: true }),
                      );
                    }
                  }}
                  className="rounded-lg border border-border bg-surface-hover px-3 py-1.5 text-sm
                           text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  {example}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
