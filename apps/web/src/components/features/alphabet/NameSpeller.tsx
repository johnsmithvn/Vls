"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Keyboard,
} from "lucide-react";
import DATA from "@/data/alphabet.json";

/**
 * Vietnamese character decomposition rules for fingerspelling.
 *
 * Rule: Spell base letters first → letter modifiers → tone mark last.
 * Example: "Ấ" → A + Dấu mũ (^) + Dấu sắc (´)
 *          "Hà" → H + A + Dấu huyền (`)
 *          "Nội" → N + O + Dấu mũ (^) + I + Dấu nặng (.)
 */

interface SpellStep {
  /** Display label on the card */
  label: string;
  /** Image path (null for tone marks / word separator) */
  image: string | null;
  /** Type for visual styling */
  type: "letter" | "modifier" | "tone" | "space";
  /** Mnemonic hint */
  hint: string;
}

// ── Build lookup maps from alphabet.json ────────────────────

const letterMap = new Map<string, { image: string; mnemonic: string }>();
for (const l of DATA.letters) {
  letterMap.set(l.letter.toUpperCase(), {
    image: l.images?.[0] || "",
    mnemonic: l.mnemonic,
  });
}

// Modifier map: modified char → { base, modifierName, modifierImage }
interface ModifierInfo {
  base: string;
  modifierName: string;
  modifierImage: string;
}
const modifierMap = new Map<string, ModifierInfo>();
// Â, Ê, Ô → Dấu mũ (^)
const circumflex = DATA.diacritics.letter_modifiers.find(
  (m) => m.id === "dau_mu",
);
if (circumflex) {
  modifierMap.set("Â", {
    base: "A",
    modifierName: "Dấu mũ (^)",
    modifierImage: circumflex.images?.[0] || "",
  });
  modifierMap.set("Ê", {
    base: "E",
    modifierName: "Dấu mũ (^)",
    modifierImage: circumflex.images?.[0] || "",
  });
  modifierMap.set("Ô", {
    base: "O",
    modifierName: "Dấu mũ (^)",
    modifierImage: circumflex.images?.[0] || "",
  });
}
// Ă → Dấu trăng (˘)
const breve = DATA.diacritics.letter_modifiers.find(
  (m) => m.id === "dau_trang",
);
if (breve) {
  modifierMap.set("Ă", {
    base: "A",
    modifierName: "Dấu trăng (˘)",
    modifierImage: breve.images?.[0] || "",
  });
}
// Ơ, Ư → Dấu móc
const horn = DATA.diacritics.letter_modifiers.find(
  (m) => m.id === "dau_moc",
);
if (horn) {
  modifierMap.set("Ơ", {
    base: "O",
    modifierName: "Dấu móc",
    modifierImage: horn.images?.[0] || "",
  });
  modifierMap.set("Ư", {
    base: "U",
    modifierName: "Dấu móc",
    modifierImage: horn.images?.[0] || "",
  });
}

// Tone mark map: combining character → tone info
interface ToneInfo {
  name: string;
  gesture: string;
}
const toneMap = new Map<string, ToneInfo>();
// Unicode combining marks: acute=\u0301, grave=\u0300, hook=\u0309, tilde=\u0303, dot=\u0323
const toneMarks: [string, string, string][] = [
  ["\u0301", "Dấu sắc (´)", "Ngón trỏ vạch chéo lên từ trái sang phải (/)"],
  [
    "\u0300",
    "Dấu huyền (`)",
    "Ngón trỏ vạch chéo xuống từ trái sang phải (\\)",
  ],
  [
    "\u0309",
    "Dấu hỏi (?)",
    "Ngón trỏ vẽ hình dấu hỏi nhỏ (?) phía trên",
  ],
  ["\u0303", "Dấu ngã (~)", "Ngón trỏ vẽ hình sóng (~) ngang"],
  ["\u0323", "Dấu nặng (.)", "Ngón trỏ chấm xuống một điểm phía dưới"],
];
for (const [mark, name, gesture] of toneMarks) {
  toneMap.set(mark, { name, gesture });
}

/**
 * Decompose a Vietnamese string into SpellStep[].
 * Uses Unicode NFD normalization to split base char + combining marks.
 */
function decomposeVietnamese(text: string): SpellStep[] {
  const steps: SpellStep[] = [];
  const words = text.trim().split(/\s+/);

  for (let wi = 0; wi < words.length; wi++) {
    if (wi > 0) {
      steps.push({
        label: "⏸ Ngắt",
        image: null,
        type: "space",
        hint: "Gật đầu hoặc ngưng 0.5-1 giây giữa 2 từ",
      });
    }

    const word = words[wi];
    // NFD decomposition: "Ấ" → "A" + "\u0302" (circumflex) + "\u0301" (acute)
    const nfd = word.normalize("NFD");

    let pendingTone: ToneInfo | null = null;
    let i = 0;

    while (i < nfd.length) {
      const char = nfd[i];
      const upper = char.toUpperCase();

      // Check if it's a combining mark (tone)
      if (toneMap.has(char)) {
        pendingTone = toneMap.get(char)!;
        i++;
        continue;
      }

      // Check if it's a combining circumflex/breve/horn (letter modifier)
      // \u0302 = circumflex, \u0306 = breve, \u031B = horn
      if (char === "\u0302" || char === "\u0306" || char === "\u031B") {
        // These are handled by looking at previous base char
        // The modifier step was already pushed or will be pushed
        // Find what base letter this applies to
        const prevStep = steps[steps.length - 1];
        if (prevStep && prevStep.type === "letter") {
          const combined =
            char === "\u0302"
              ? prevStep.label + "\u0302" // → Â, Ê, Ô
              : char === "\u0306"
                ? prevStep.label + "\u0306" // → Ă
                : prevStep.label + "\u031B"; // → Ơ, Ư
          const normalized = combined.normalize("NFC").toUpperCase();
          const modInfo = modifierMap.get(normalized);
          if (modInfo) {
            steps.push({
              label: modInfo.modifierName,
              image: modInfo.modifierImage,
              type: "modifier",
              hint: `Thêm ${modInfo.modifierName} sau chữ ${prevStep.label}`,
            });
          }
        }
        i++;
        continue;
      }

      // Regular letter
      // Special case: Đ (already has its own entry)
      if (upper === "Đ" || (upper === "D" && nfd[i + 1] === "\u0335")) {
        const dData = letterMap.get("Đ");
        steps.push({
          label: "Đ",
          image: dData?.image || null,
          type: "letter",
          hint: dData?.mnemonic || "",
        });
        if (nfd[i + 1] === "\u0335") i++; // skip combining stroke
        i++;
        continue;
      }

      if (letterMap.has(upper)) {
        const lData = letterMap.get(upper)!;
        steps.push({
          label: upper,
          image: lData.image,
          type: "letter",
          hint: lData.mnemonic,
        });
      } else if (/[a-zA-Z]/.test(char)) {
        // Unknown letter (F, J, W, Z) — no VSL sign, show placeholder
        steps.push({
          label: upper,
          image: null,
          type: "letter",
          hint: "Chữ này không có trong bảng ký hiệu VSL",
        });
      }
      // Skip non-letter characters (numbers, punctuation, etc.)
      i++;
    }

    // Add tone mark at the end of the word (Vietnamese rule)
    if (pendingTone) {
      steps.push({
        label: pendingTone.name,
        image: null,
        type: "tone",
        hint: pendingTone.gesture,
      });
      pendingTone = null;
    }
  }

  return steps;
}

// ── Component ───────────────────────────────────────────────

export default function NameSpeller() {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState<SpellStep[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = useCallback(() => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setHasGenerated(false);

    // Simulated loading for UX feel
    setTimeout(() => {
      const result = decomposeVietnamese(input);
      setSteps(result);
      setActiveIndex(0);
      setIsGenerating(false);
      setHasGenerated(true);
    }, 800);
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") generate();
  };

  // Keyboard nav for carousel
  useEffect(() => {
    if (!hasGenerated || steps.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setActiveIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setActiveIndex((i) => Math.min(steps.length - 1, i + 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasGenerated, steps.length]);

  const reset = () => {
    setInput("");
    setSteps([]);
    setActiveIndex(0);
    setHasGenerated(false);
  };

  const currentStep = steps[activeIndex];

  const typeColors = {
    letter: "border-primary/40 bg-primary/5",
    modifier: "border-violet-400/40 bg-violet-500/5",
    tone: "border-rose-400/40 bg-rose-500/5",
    space: "border-amber-400/40 bg-amber-500/5",
  };

  const typeBadgeColors = {
    letter: "bg-primary/10 text-primary",
    modifier: "bg-violet-500/10 text-violet-500",
    tone: "bg-rose-500/10 text-rose-500",
    space: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
          <Keyboard className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-emerald-800">
            Đánh vần tên của bạn
          </h2>
          <p className="text-xs text-emerald-600/70">
            Nhập tên hoặc bất kỳ từ nào → xem cách đánh vần bằng ký hiệu tay
          </p>
        </div>
      </div>

      {/* Input + Generate */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="VD: Hà Nội, Minh, Việt Nam..."
          className="flex-1 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-900 outline-none placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          disabled={isGenerating}
        />
        <button
          onClick={generate}
          disabled={!input.trim() || isGenerating}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Đánh vần</span>
        </button>
        {hasGenerated && (
          <button
            onClick={reset}
            className="rounded-xl border border-emerald-200 bg-white p-3 text-emerald-600 transition hover:bg-emerald-50"
            title="Làm lại"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Loading */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 flex flex-col items-center gap-3 py-8"
          >
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="h-3 w-3 rounded-full bg-emerald-400"
                  animate={{ y: [0, -12, 0] }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-emerald-600">
              Đang phân tích &quot;{input}&quot;...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {hasGenerated && steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            {/* Mini timeline dots */}
            <div className="mb-4 flex items-center justify-center gap-1 flex-wrap">
              {steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-1 text-[10px] font-bold transition-all ${
                    i === activeIndex
                      ? "bg-emerald-600 text-white scale-110 shadow-md"
                      : step.type === "space"
                        ? "bg-amber-100 text-amber-600"
                        : step.type === "tone"
                          ? "bg-rose-100 text-rose-600"
                          : step.type === "modifier"
                            ? "bg-violet-100 text-violet-600"
                            : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {step.type === "space" ? "·" : step.label.charAt(0)}
                </button>
              ))}
            </div>

            {/* Main Card */}
            <div className="relative">
              {/* Nav arrows */}
              <button
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
                className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-emerald-200 transition hover:bg-emerald-50 disabled:opacity-20 sm:-left-5"
              >
                <ChevronLeft className="h-5 w-5 text-emerald-700" />
              </button>
              <button
                onClick={() =>
                  setActiveIndex((i) => Math.min(steps.length - 1, i + 1))
                }
                disabled={activeIndex === steps.length - 1}
                className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-emerald-200 transition hover:bg-emerald-50 disabled:opacity-20 sm:-right-5"
              >
                <ChevronRight className="h-5 w-5 text-emerald-700" />
              </button>

              {/* Card content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25 }}
                  className={`mx-auto max-w-sm rounded-2xl border-2 p-6 shadow-sm ${typeColors[currentStep.type]}`}
                >
                  {/* Step counter */}
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${typeBadgeColors[currentStep.type]}`}
                    >
                      {currentStep.type === "letter" && "Chữ cái"}
                      {currentStep.type === "modifier" && "Dấu phụ"}
                      {currentStep.type === "tone" && "Dấu thanh"}
                      {currentStep.type === "space" && "Ngắt từ"}
                    </span>
                    <span className="text-xs font-medium text-emerald-600/60">
                      {activeIndex + 1} / {steps.length}
                    </span>
                  </div>

                  {/* Image or fallback */}
                  <div className="mb-4 flex items-center justify-center">
                    {currentStep.image ? (
                      <img
                        src={currentStep.image}
                        alt={currentStep.label}
                        className="h-48 w-48 rounded-xl object-contain"
                      />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-white/60">
                        <span className="text-5xl font-black text-emerald-400/60">
                          {currentStep.type === "space"
                            ? "⏸"
                            : currentStep.label
                                .match(/\((.+?)\)/)?.[1]
                                ?.charAt(0) || currentStep.label.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <h3 className="mb-1 text-center text-2xl font-black text-emerald-900">
                    {currentStep.label}
                  </h3>
                  <p className="text-center text-xs text-emerald-700/60">
                    {currentStep.hint}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1.5 rounded-full bg-emerald-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={false}
                animate={{
                  width: `${((activeIndex + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="mt-2 text-center text-[10px] text-emerald-500">
              Dùng phím ← → để chuyển bước · Nhấn vào dot phía trên để nhảy
              nhanh
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
