"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, PenTool, X, ChevronLeft, ChevronRight, Hash, HelpCircle } from "lucide-react";
import DATA from "@/data/alphabet.json";
import NameSpeller from "@/components/features/alphabet/NameSpeller";



type LetterItem = (typeof DATA.letters)[number] & { video?: string };
type NumberItem = (typeof DATA.numbers)[number];
type DiacriticItem =
  | (typeof DATA.diacritics.letter_modifiers)[number]
  | (typeof DATA.diacritics.tone_marks)[number];

export default function AlphabetPage() {
  const [selectedLetter, setSelectedLetter] = useState<LetterItem | null>(null);
  const [mediaTab, setMediaTab] = useState<"video" | "image" | "3d">("image");
  const [selectedDiacritic, setSelectedDiacritic] =
    useState<DiacriticItem | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<NumberItem | null>(null);

  // Prev/Next for letters
  const currentLetterIndex = selectedLetter
    ? DATA.letters.findIndex((l) => l.letter === selectedLetter.letter)
    : -1;
  const goToLetter = useCallback((dir: -1 | 1) => {
    setSelectedLetter((prev) => {
      if (!prev) return null;
      const idx = DATA.letters.findIndex((l) => l.letter === prev.letter);
      const next = idx + dir;
      if (next < 0 || next >= DATA.letters.length) return prev;
      setMediaTab("image");
      return DATA.letters[next] as LetterItem;
    });
  }, []);

  // Prev/Next for numbers
  const currentNumberIndex = selectedNumber
    ? DATA.numbers.findIndex((n) => n.number === selectedNumber.number)
    : -1;
  const goToNumber = useCallback((dir: -1 | 1) => {
    setSelectedNumber((prev) => {
      if (!prev) return null;
      const idx = DATA.numbers.findIndex((n) => n.number === prev.number);
      const next = idx + dir;
      if (next < 0 || next >= DATA.numbers.length) return prev;
      return DATA.numbers[next] as NumberItem;
    });
  }, []);

  // Keyboard arrow navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedLetter) {
        if (e.key === "ArrowLeft") goToLetter(-1);
        if (e.key === "ArrowRight") goToLetter(1);
        if (e.key === "Escape") setSelectedLetter(null);
      }
      if (selectedNumber) {
        if (e.key === "ArrowLeft") goToNumber(-1);
        if (e.key === "ArrowRight") goToNumber(1);
        if (e.key === "Escape") setSelectedNumber(null);
      }
      if (selectedDiacritic && e.key === "Escape") setSelectedDiacritic(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedLetter, selectedNumber, selectedDiacritic, goToLetter, goToNumber]);

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
                {d.images.length > 0 ? (
                  <img
                    src={d.images[0]}
                    alt={d.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-violet-500">
                    {d.name.match(/\((.+?)\)/)?.[1] || d.name.charAt(0)}
                  </span>
                )}
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
                {t.images.length > 0 ? (
                  <img
                    src={t.images[0]}
                    alt={t.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-rose-400">
                    {t.name.match(/\((.+?)\)/)?.[1] || t.name.charAt(0)}
                  </span>
                )}
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

      {/* ═══════════════ SECTION 4: Numbers ═══════════════ */}
      <div className="mt-12">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Hash className="h-4 w-4 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold">Số tự nhiên (0–10)</h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          Cách biểu thị số bằng tay. Nhấn vào thẻ để xem chi tiết.
        </p>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11">
          {DATA.numbers.map((item, i) => (
            <motion.button
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              onClick={() => setSelectedNumber(item)}
              className="group flex flex-col items-center justify-center rounded-2xl border border-border
                         bg-surface p-4 shadow-sm transition-all
                         hover:shadow-lg hover:-translate-y-1 hover:border-amber-400
                         active:scale-95 cursor-pointer"
            >
              <span className="text-3xl font-bold text-amber-600 sm:text-4xl group-hover:scale-110 transition-transform">
                {item.number}
              </span>
              <span className="mt-1 text-[10px] text-muted">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <p className="mt-8 mb-12 text-center text-xs text-muted">
        Nhấn vào bất kỳ thẻ nào để xem chi tiết · Dùng phím ← → để chuyển
      </p>

      {/* ═══════════════ SECTION 5: Name Spelling ═══════════════ */}
      <div className="mb-10">
        <NameSpeller />
      </div>

      {/* ═══════════════ SECTION 6: Information ═══════════════ */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-sky-50 p-6 text-sky-900 shadow-sm border border-sky-100">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-sky-700">
            Bảng chữ cái ngón tay là gì?
          </h2>
        </div>
        
        <div className="space-y-4 text-sm leading-relaxed text-sky-800/90">
          <p>
            Bảng chữ cái ngón tay là một trong những nội dung căn bản và đầu tiên của việc học Ngôn Ngữ Ký Hiệu. Giống như việc học đánh vần trong Tiếng Việt vậy. Về cơ bản thì đánh vần chữ cái ngón tay được sử dụng khi:
          </p>
          
          <ul className="ml-6 list-disc space-y-1 font-medium">
            <li>Cần thông báo tên riêng (địa danh, người...)</li>
            <li>Khi cần biểu đạt khái niệm mà bạn không biết ký hiệu</li>
          </ul>

          <p>
            Khi đánh vần, bạn phải đánh vần chữ cái trước và các thanh (sắc, huyền, hỏi, ngã, nặng) bỏ sau cùng.
          </p>

          <p className="rounded-lg bg-sky-100/50 p-3 italic">
            Ví dụ: &quot;Hà Nội&quot; sẽ được đánh vần theo thứ tự sau: <strong>H | A | Dấu Huyền | (ngắt chữ) | N | Ô | I | Dấu nặng</strong>
          </p>

          <div className="pt-2">
            <p className="font-semibold text-sky-900 mb-2">Khoảng cách giữa 2 từ sẽ được thể hiện bằng những cách sau:</p>
            <ul className="ml-6 list-disc space-y-1.5">
              <li>Gật đầu sau mỗi từ.</li>
              <li>Ngưng lại 1 khoảng thời gian từ 0,5 - 1 giây giữa 2 từ.</li>
              <li>Dùng bàn tay gạt từ phải sang trái nếu thuận tay phải và ngược lại nếu thuận tay trái.</li>
              <li>Đánh vần các từ từ trái sang phải, sau mỗi từ thì tay đánh vần chuyển động sang phải (giống cách viết chữ).</li>
            </ul>
          </div>
        </div>
      </div>

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
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-surface-hover transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Prev/Next arrows */}
              {currentLetterIndex > 0 && (
                <button
                  onClick={() => goToLetter(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-surface border border-border p-2 shadow-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors z-10"
                  title="Chữ trước (←)"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {currentLetterIndex < DATA.letters.length - 1 && (
                <button
                  onClick={() => goToLetter(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-surface border border-border p-2 shadow-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors z-10"
                  title="Chữ sau (→)"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

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
                    {selectedLetter.video && (
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
                    )}
                  </div>

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
                    <div className="space-y-2">
                      {selectedLetter.images && selectedLetter.images.length > 1 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedLetter.images.map((img, idx) => (
                            <div key={idx} className="flex h-28 items-center justify-center rounded-lg bg-white/60 overflow-hidden">
                              <img
                                src={img.replace(/\/view.*$/, "/preview")}
                                alt={`Góc độ ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center rounded-lg bg-white/60 overflow-hidden">
                          <img
                            src={selectedLetter.images[0]}
                            alt={`Ký hiệu chữ ${selectedLetter.letter}`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}
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

                {/* Counter */}
                <p className="mt-4 text-[10px] text-muted">
                  {currentLetterIndex + 1} / {DATA.letters.length} · Dùng phím ← → để chuyển
                </p>
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
                  {selectedDiacritic.images.length > 0 ? (
                    <img
                      src={selectedDiacritic.images[0]}
                      alt={selectedDiacritic.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-violet-400">
                      {selectedDiacritic.name.match(/\((.+?)\)/)?.[1] || selectedDiacritic.name.charAt(0)}
                    </span>
                  )}
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

      {/* ═══════════════ Number Detail Modal ═══════════════ */}
      <AnimatePresence>
        {selectedNumber && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNumber(null)}
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
                onClick={() => setSelectedNumber(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted hover:bg-surface-hover transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {currentNumberIndex > 0 && (
                <button
                  onClick={() => goToNumber(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-surface border border-border p-2 shadow-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors z-10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {currentNumberIndex < DATA.numbers.length - 1 && (
                <button
                  onClick={() => goToNumber(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-surface border border-border p-2 shadow-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors z-10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

              <div className="text-center">
                <div className="mb-5 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-2 ring-amber-500/10">
                  <span className="text-6xl font-extrabold text-amber-600">
                    {selectedNumber.number}
                  </span>
                </div>

                <h2 className="mb-1 text-2xl font-bold">
                  Số {selectedNumber.number} — {selectedNumber.label}
                </h2>
                <p className="text-muted mb-5">{selectedNumber.mnemonic}</p>

                <div className="rounded-xl border border-border bg-surface-hover p-2">
                  <div className="flex h-48 items-center justify-center rounded-lg bg-white/60 overflow-hidden">
                    <img
                      src={selectedNumber.images[0]}
                      alt={`Ký hiệu số ${selectedNumber.number}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-left">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                    Cách ra ký hiệu
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedNumber.mnemonic}
                  </p>
                </div>

                <p className="mt-4 text-[10px] text-muted">
                  {currentNumberIndex + 1} / {DATA.numbers.length} · Dùng phím ← → để chuyển
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
