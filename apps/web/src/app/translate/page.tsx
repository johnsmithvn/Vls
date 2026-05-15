"use client";

import { Languages, BookOpen, Hand, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TranslatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-2 ring-primary/5">
          <Languages className="h-10 w-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Dịch sang Ngôn ngữ Ký hiệu
        </h1>

        {/* Description */}
        <p className="mt-3 max-w-md text-muted">
          Tính năng dịch câu tiếng Việt sang chuỗi ký hiệu đang được phát triển.
          Hãy khám phá Từ điển và Bảng chữ cái trước nhé!
        </p>

        {/* Coming Soon badge */}
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-700">
          🚧 Coming Soon
        </span>

        {/* Navigation hints */}
        <div className="mt-10 grid w-full max-w-sm gap-3">
          <Link
            href="/dictionary"
            className="group flex items-center justify-between rounded-xl border border-border
                       bg-surface p-4 shadow-sm transition-all
                       hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Từ điển</p>
                <p className="text-xs text-muted">Tra cứu từ vựng, cụm từ, câu</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/alphabet"
            className="group flex items-center justify-between rounded-xl border border-border
                       bg-surface p-4 shadow-sm transition-all
                       hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Hand className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Bảng chữ cái</p>
                <p className="text-xs text-muted">Học 29 chữ cái ký hiệu</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
