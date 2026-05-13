"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, RotateCcw, X } from "lucide-react";
import ALPHABET from "@/data/alphabet.json";

export default function AlphabetPage() {
  const [selectedLetter, setSelectedLetter] = useState<typeof ALPHABET[number] | null>(null);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleFlip = (letter: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  };

  const resetAll = () => setFlippedCards(new Set());
  const flipAll = () => setFlippedCards(new Set(ALPHABET.map((a) => a.letter)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Hand className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Bảng chữ cái Ngôn ngữ Ký hiệu
            </h1>
          </div>
          <p className="text-muted">
            Nhấn vào thẻ để xem mô tả cách ra ký hiệu. Học 29 chữ cái tiếng Việt trong ngôn ngữ ký hiệu.
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={flipAll}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted
                       transition-all hover:border-primary hover:text-primary"
          >
            Lật tất cả
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm
                       font-medium text-muted transition-all hover:border-primary hover:text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="text-muted">Tiến độ</span>
          <span className="font-medium text-primary">
            {flippedCards.size}/{ALPHABET.length} đã xem
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
            initial={{ width: 0 }}
            animate={{ width: `${(flippedCards.size / ALPHABET.length) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Grid — large cards */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {ALPHABET.map((item) => {
          const isFlipped = flippedCards.has(item.letter);
          return (
            <div
              key={item.letter}
              className="perspective-[800px] cursor-pointer"
              onClick={() => toggleFlip(item.letter)}
              onDoubleClick={() => setSelectedLetter(item)}
            >
              <motion.div
                className="relative h-36 w-full sm:h-40 md:h-44"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl
                             border bg-surface shadow-sm transition-all
                             ${isFlipped ? "" : "hover:shadow-md hover:-translate-y-0.5"}
                             ${isFlipped ? "border-border" : "border-border hover:border-primary/30"}`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-5xl font-bold text-primary sm:text-6xl">{item.letter}</span>
                  <span className="mt-2 text-xs text-muted">Nhấn để lật</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl
                             border border-primary/30 bg-primary-subtle p-4"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-3xl">🤟</span>
                  </div>
                  <span className="text-center text-sm font-medium leading-snug text-primary">
                    {item.mnemonic}
                  </span>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <p className="mt-6 text-center text-xs text-muted">
        💡 Nhấn đúp để xem chi tiết • Nhấn một lần để lật thẻ
      </p>

      {/* Detail Modal */}
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
              className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedLetter(null)}
                className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:bg-surface-hover transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center">
                <div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10">
                  <span className="text-6xl font-bold text-primary">{selectedLetter.letter}</span>
                </div>
                <h2 className="mb-2 text-xl font-bold">Chữ {selectedLetter.letter}</h2>
                <p className="text-muted">{selectedLetter.mnemonic}</p>

                <div className="mt-6 rounded-xl bg-surface-hover p-4">
                  <div className="flex h-32 items-center justify-center rounded-lg bg-primary/5">
                    <span className="text-5xl">🤟</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Hình ảnh mô phỏng sẽ được thêm sau khi có media
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
