"use client";

import { Zap, ArrowRightLeft, Type } from "lucide-react";
import type { TranslationMode } from "@/lib/api";

const MODES: {
  value: TranslationMode;
  label: string;
  description: string;
  icon: typeof Zap;
}[] = [
  {
    value: "auto",
    label: "Tự động",
    description: "Hệ thống tự chọn cách dịch tốt nhất",
    icon: Zap,
  },
  {
    value: "word_by_word",
    label: "Từng từ",
    description: "Dịch từng từ riêng lẻ, bỏ qua cụm từ",
    icon: ArrowRightLeft,
  },
  {
    value: "fingerspell",
    label: "Đánh vần",
    description: "Đánh vần từng chữ cái (luyện bảng chữ cái)",
    icon: Type,
  },
];

export function TranslationModeSelector({
  value,
  onChange,
}: {
  value: TranslationMode;
  onChange: (mode: TranslationMode) => void;
}) {
  return (
    <div className="flex gap-2">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = value === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`group flex flex-1 items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all
              ${
                isActive
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-surface hover:border-primary/30 hover:bg-surface-hover"
              }`}
            title={mode.description}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors
              ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-sm font-semibold ${isActive ? "text-primary" : ""}`}
              >
                {mode.label}
              </p>
              <p className="hidden text-[11px] text-muted sm:block">
                {mode.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
