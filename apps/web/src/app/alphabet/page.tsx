"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, PenTool, X } from "lucide-react";
import DATA from "@/data/alphabet.json";

type LetterItem = (typeof DATA.letters)[number] & { video?: string };
type DiacriticItem =
  | (typeof DATA.diacritics.letter_modifiers)[number]
  | (typeof DATA.diacritics.tone_marks)[number];

export default function AlphabetPage() {
  const [selectedLetter, setSelectedLetter] = useState<LetterItem | null>(null);
  const [mediaTab, setMediaTab] = useState<"video" | "image">("image");
  const [selectedDiacritic, setSelectedDiacritic] =
    useState<DiacriticItem | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Hand className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Bảng chữ cái Ngôn ngữ Ký hiệu
          </h1>
        </div>
        <p className="text-muted">
          Nhấn vào thẻ để xem chi tiết cách ra ký hiệu. Học{" "}
          {DATA.letters.length} chữ cái cơ bản + 9 dấu thanh & dấu phụ.
        </p>
      </div>

      {/* ═══════════════ SECTION 1: Base Letters ═══════════════ */}
      <h2 className="mb-4 text-lg font-bold">
        Chữ cái cơ bản ({DATA.letters.length} ký hiệu)
      </h2>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8">
        {DATA.letters.map((item, i) => (
          <motion.button
            key={item.letter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.02 }}
            onClick={() => {
              setSelectedLetter(item);
              setMediaTab("image");
            }}
            className="group flex flex-col items-center justify-center rounded-2xl border border-border
                       bg-surface p-4 shadow-sm transition-all
                       hover:shadow-lg hover:-translate-y-1 hover:border-primary/40
                       active:scale-95 cursor-pointer"
          >
            <span className="text-4xl font-bold text-primary sm:text-5xl group-hover:scale-110 transition-transform">
              {item.letter}
            </span>
            <span className="mt-2 text-[10px] text-muted opacity-0 group-hover:opacity-100 transition-opacity">
              Xem chi tiết
            </span>
          </motion.button>
        ))}
      </div>

      {/* ═══════════════ SECTION 2: Letter Modifiers ═══════════════ */}
      <div className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <PenTool className="h-4 w-4 text-violet-600" />
          </div>
          <h2 className="text-lg font-bold">Dấu phụ chữ cái</h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          Sau khi ra ký hiệu chữ cái gốc, thêm cử chỉ dấu phụ để tạo thành Ă,
          Â, Đ, Ê, Ô, Ơ, Ư.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {DATA.diacritics.letter_modifiers.map((d) => (
            <motion.button
              key={d.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedDiacritic(d)}
              className="cursor-pointer rounded-2xl border border-border bg-surface p-4 shadow-sm
                         text-left transition-all hover:shadow-lg hover:border-violet-300"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-50 mx-auto overflow-hidden">
                <img
                  src={d.image}
                  alt={d.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="text-center text-sm font-bold text-violet-700">
                {d.name}
              </h3>
              <p className="mt-1 text-center text-xs text-muted">
                {"applies_to" in d ? d.applies_to.join(", ") : ""}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ═══════════════ SECTION 3: Tone Marks ═══════════════ */}
      <div className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
            <PenTool className="h-4 w-4 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold">Dấu thanh</h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          5 dấu thanh điệu. Sau khi đánh vần xong từ, dùng cử chỉ tay để biểu
          thị thanh điệu. Thanh ngang không cần thêm cử chỉ.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {DATA.diacritics.tone_marks.map((t) => (
            <motion.button
              key={t.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedDiacritic(t)}
              className="cursor-pointer rounded-2xl border border-border bg-surface p-4 shadow-sm
                         text-left transition-all hover:shadow-lg hover:border-rose-300"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-50 mx-auto overflow-hidden">
                <img
                  src={t.image}
                  alt={t.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="text-center text-sm font-bold text-rose-600">
                {t.name}
              </h3>
              <p className="mt-1 text-center text-xs text-muted">
                {"example" in t ? t.example : ""}
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <p className="mt-8 text-center text-xs text-muted">
        Nhấn vào bất kỳ thẻ nào để xem chi tiết cách ra ký hiệu
      </p>

      {/* ═══════════════ Letter Detail Modal ═══════════════ */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
              className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedLetter(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-surface-hover transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center">
                {/* Letter badge */}
                <div className="mb-5 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-2 ring-primary/10">
                  <span className="text-6xl font-extrabold text-primary">
                    {selectedLetter.letter}
                  </span>
                </div>

                <h2 className="mb-1 text-2xl font-bold">
                  Chữ {selectedLetter.letter}
                </h2>
                <p className="text-muted mb-5">{selectedLetter.mnemonic}</p>

                {/* Media preview: Tabs */}
                <div className="rounded-xl border border-border bg-surface-hover p-2">
                  {selectedLetter.video && (
                    <div className="mb-3 flex rounded-lg bg-surface p-1 shadow-sm">
                      <button
                        onClick={() => setMediaTab("image")}
                        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          mediaTab === "image"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        Hình ảnh
                      </button>
                      <button
                        onClick={() => setMediaTab("video")}
                        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          mediaTab === "video"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted hover:text-foreground"
                        }`}
                      >
                        Video
                      </button>
                    </div>
                  )}

                  {mediaTab === "video" && selectedLetter.video && (
                    <div className="overflow-hidden rounded-lg aspect-video bg-black/5">
                      <iframe
                        src={selectedLetter.video.replace(/\/view.*$/, "/preview")}
                        className="h-full w-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        loading="lazy"
                        title={`Video ký hiệu chữ ${selectedLetter.letter}`}
                        style={{ border: "none" }}
                      />
                    </div>
                  )}

                  {mediaTab === "image" && (
                    <div className="flex h-48 items-center justify-center rounded-lg bg-white/60 overflow-hidden">
                      <img
                        src={selectedLetter.image}
                        alt={`Ký hiệu chữ ${selectedLetter.letter}`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* How-to */}
                <div className="mt-5 rounded-xl border border-primary/10 bg-primary/5 p-4 text-left">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                    Cách ra ký hiệu
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedLetter.mnemonic}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════ Diacritic Detail Modal ═══════════════ */}
      <AnimatePresence>
        {selectedDiacritic && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDiacritic(null)}
          >
            <motion.div
              className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedDiacritic(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-surface-hover transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center">
                {/* Icon */}
                <div className="mb-5 flex h-28 w-28 mx-auto items-center justify-center rounded-2xl bg-violet-50 overflow-hidden ring-2 ring-violet-100">
                  <img
                    src={selectedDiacritic.image}
                    alt={selectedDiacritic.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <h2 className="mb-3 text-2xl font-bold">
                  {selectedDiacritic.name}
                </h2>

                {"applies_to" in selectedDiacritic && (
                  <div className="mb-4 flex flex-wrap justify-center gap-1.5">
                    {selectedDiacritic.applies_to.map((a: string) => (
                      <span
                        key={a}
                        className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {"example" in selectedDiacritic && (
                  <p className="mb-4 text-sm text-muted">
                    Ví dụ: {selectedDiacritic.example}
                  </p>
                )}

                {/* How-to */}
                <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-left">
                  <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1">
                    Cách ra ký hiệu
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedDiacritic.gesture}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
