"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

import { Hand, HelpCircle, ChevronLeft, ChevronRight, Play, Box, RefreshCw, X } from "lucide-react";
import DATA from "@/data/alphabet.json";
import NameSpeller from "@/components/features/alphabet/NameSpeller";

type ItemType = "letter" | "diacritic" | "number";

interface SeqItem {
  type: ItemType;
  id: string;
  section: string;
}

export default function AlphabetPage() {
  const [activeType, setActiveType] = useState<ItemType>("letter");
  const [activeId, setActiveId] = useState<string>("A");
  const [imageIndex, setImageIndex] = useState(0);

  // Close modals
  const [mediaModal, setMediaModal] = useState<"video" | "3d" | null>(null);

  // Flatten sequence for Prev/Next
  const sequence: SeqItem[] = useMemo(() => [
    ...DATA.letters.filter(l => !l.is_extended).map(l => ({ type: "letter" as const, id: l.letter, section: "Chữ cái cơ bản" })),
    ...DATA.letters.filter(l => l.is_extended).map(l => ({ type: "letter" as const, id: l.letter, section: "Chữ mở rộng" })),
    ...DATA.diacritics.tone_marks.map(d => ({ type: "diacritic" as const, id: d.id, section: "Dấu thanh" })),
    ...DATA.diacritics.letter_modifiers.map(d => ({ type: "diacritic" as const, id: d.id, section: "Dấu phụ" })),
    ...DATA.numbers.map(n => ({ type: "number" as const, id: n.number, section: "Số tự nhiên" }))
  ], []);

  const currentIndex = sequence.findIndex(s => s.type === activeType && s.id === activeId);
  const currentSeq = sequence[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < sequence.length - 1) {
      const next = sequence[currentIndex + 1];
      setActiveType(next.type);
      setActiveId(next.id);
      setImageIndex(0);
    }
  }, [currentIndex, sequence]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prev = sequence[currentIndex - 1];
      setActiveType(prev.type);
      setActiveId(prev.id);
      setImageIndex(0);
    }
  }, [currentIndex, sequence]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in NameSpeller input
      if (document.activeElement?.tagName === "INPUT") return;
      
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // Active Data normalization
  const activeData = useMemo(() => {
    if (activeType === "letter") {
      const data = DATA.letters.find(l => l.letter === activeId);
      return {
        title: data?.letter || "",
        subtitle: data?.is_extended ? "Ký hiệu mở rộng" : "Ký hiệu cơ bản",
        images: data?.images || [],
        mnemonic: data?.mnemonic,
        derivation: data?.derivation,
        base_letter: data?.base_letter,
        related_letters: data?.related_letters,
        // `video` and `model_3d` are optional fields not present in all JSON entries
        video: (data as Record<string, unknown>)?.video as string | undefined,
        model_3d: (data as Record<string, unknown>)?.model_3d as string | undefined
      };
    }
    if (activeType === "diacritic") {
      const allDiacritics = [...DATA.diacritics.tone_marks, ...DATA.diacritics.letter_modifiers];
      const data = allDiacritics.find(d => d.id === activeId);
      const isMod = DATA.diacritics.letter_modifiers.some(m => m.id === activeId);
      return {
        title: data?.name || "",
        subtitle: isMod ? "Dấu phụ chữ cái" : "Dấu thanh điệu",
        images: data?.images || [],
        mnemonic: data?.gesture,
        derivation: undefined,
        base_letter: undefined,
        related_letters: undefined,
        video: undefined,
        model_3d: undefined
      };
    }
    if (activeType === "number") {
      const data = DATA.numbers.find(n => n.number === activeId);
      return {
        title: data?.number || "",
        subtitle: `Số ${data?.label}`,
        images: data?.images || [],
        mnemonic: data?.mnemonic,
        derivation: undefined,
        base_letter: undefined,
        related_letters: undefined,
        video: undefined,
        model_3d: undefined
      };
    }
    return null;
  }, [activeType, activeId]);

  const selectItem = (type: ItemType, id: string) => {
    setActiveType(type);
    setActiveId(id);
    setImageIndex(0);
    
    // Auto scroll detail panel into view on mobile
    if (window.innerWidth < 768) {
      document.getElementById('learning-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // itemData shape varies between letters, diacritics, numbers — using Record for flexibility
  const renderSelectorButton = (itemData: Record<string, unknown>, type: ItemType, id: string, label: string) => {
    const isActive = activeType === type && activeId === id;
    const images = itemData.images as string[] | undefined;
    const hasImage = images && images.length > 0;
    
    return (
      <>
        {/* MOBILE: Compact Text Button */}
        <button
          onClick={() => selectItem(type, id)}
          className={`md:hidden relative flex items-center justify-center rounded-xl border-2 transition-all min-w-[48px] h-[48px] shrink-0 font-black text-lg
            ${isActive 
              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 text-primary" 
              : "border-border bg-surface hover:border-primary/40 text-muted-foreground"}`}
        >
          {label}
        </button>

        {/* DESKTOP: Thumbnail Image Card */}
        <button
          onClick={() => selectItem(type, id)}
          className={`hidden md:flex relative flex-col items-center justify-center overflow-hidden rounded-xl border-2 transition-all w-[64px] h-[82px] shrink-0
            ${isActive 
              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20 ring-offset-1" 
              : "border-border bg-surface hover:border-primary/40 hover:bg-surface-hover hover:-translate-y-0.5"}`}
        >
          <div className="absolute inset-x-0 top-0 h-[72%] flex items-center justify-center p-1">
             {hasImage ? (
               <img src={images[0]} alt={label} className="h-full w-full object-contain scale-[1.3] mix-blend-multiply dark:mix-blend-normal" />
             ) : (
               <span className={`text-xl font-black opacity-30 ${isActive ? 'text-primary' : 'text-muted'}`}>{label.charAt(0)}</span>
             )}
          </div>
          <div className={`absolute inset-x-0 bottom-0 h-[28%] flex items-center justify-center text-[13px] font-black tracking-wider
            ${isActive ? 'bg-primary text-white' : 'bg-muted/10 text-foreground'}`}>
            {label}
          </div>
        </button>
      </>
    );
  };

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
          Hệ thống học tập tương tác. Chọn thẻ bên dưới để xem cách ra ký hiệu, hướng dẫn chi tiết và các biến thể.
        </p>
      </div>

      {/* MASTER-DETAIL LAYOUT */}
      <div className="flex flex-col md:flex-row gap-8 mb-16">
        
        {/* LEFT COLUMN: SELECTOR */}
        <div className="w-full md:w-[380px] shrink-0 flex flex-col gap-8">
          {/* Section: Basic Letters */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-2">
              <span className="w-6 border-b border-border"></span>
              Chữ cái cơ bản
              <span className="w-6 border-b border-border"></span>
            </h2>
            {/* Mobile horizontal scroll, Desktop grid */}
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pb-2 md:pb-0">
              {DATA.letters.filter(l => !l.is_extended).map(l => (
                <div key={l.letter} className="snap-start">
                  {renderSelectorButton(l, "letter", l.letter, l.letter)}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Extended Letters */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-violet-600 flex items-center gap-2">
              <span className="w-6 border-b border-violet-200"></span>
              Chữ mở rộng
              <span className="w-6 border-b border-violet-200"></span>
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pb-2 md:pb-0">
              {DATA.letters.filter(l => l.is_extended).map(l => (
                <div key={l.letter} className="snap-start">
                  {renderSelectorButton(l, "letter", l.letter, l.letter)}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Tone Marks */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
              <span className="w-6 border-b border-rose-200"></span>
              Dấu thanh
              <span className="w-6 border-b border-rose-200"></span>
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pb-2 md:pb-0">
              {DATA.diacritics.tone_marks.map(d => {
                const shortLabel = d.name.match(/\((.+?)\)/)?.[1] || d.name.split(" ")[1] || d.name;
                return (
                  <div key={d.id} className="snap-start">
                    {renderSelectorButton(d, "diacritic", d.id, shortLabel)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Letter Modifiers */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-orange-500 flex items-center gap-2">
              <span className="w-6 border-b border-orange-200"></span>
              Dấu phụ chữ cái
              <span className="w-6 border-b border-orange-200"></span>
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pb-2 md:pb-0">
              {DATA.diacritics.letter_modifiers.map(d => {
                const shortLabel = d.name.match(/\((.+?)\)/)?.[1] || d.name.split(" ")[1] || d.name;
                return (
                  <div key={d.id} className="snap-start">
                    {renderSelectorButton(d, "diacritic", d.id, shortLabel)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Numbers */}
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-600 flex items-center gap-2">
              <span className="w-6 border-b border-amber-200"></span>
              Số tự nhiên (0-10)
              <span className="w-6 border-b border-amber-200"></span>
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 pb-2 md:pb-0">
              {DATA.numbers.map(n => (
                <div key={n.number} className="snap-start">
                  {renderSelectorButton(n, "number", n.number, n.number)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LEARNING PANEL */}
        <div id="learning-panel" className="w-full md:flex-1 md:sticky md:top-24 self-start scroll-mt-24">
          <div className="rounded-2xl border border-border bg-surface shadow-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
            
            {/* Panel Header: Progress & Nav */}
            <div className="flex items-center justify-between border-b border-border bg-muted/5 px-4 py-3">
                            <button 
                onClick={goPrev} 
                disabled={currentIndex === 0}
                className="p-2 rounded-full hover:bg-surface-hover disabled:opacity-30 transition shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <div className="text-sm font-bold text-muted-foreground text-center px-2 truncate">
                <span className="text-primary">{currentIndex + 1}</span> / {sequence.length}
                <span className="hidden sm:inline"> — {currentSeq?.section}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeData?.images && activeData.images.length > 1 && (
                  <button 
                    onClick={() => setImageIndex(i => (i + 1) % activeData.images.length)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition"
                    title="Đổi góc nhìn"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Góc khác</span>
                  </button>
                )}
                <button 
                  onClick={goNext} 
                  disabled={currentIndex === sequence.length - 1}
                  className="p-2 rounded-full hover:bg-surface-hover disabled:opacity-30 transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Panel Body */}
            {activeData && (
              <div key={`${activeType}-${activeId}`} className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* Left side of Panel: Main Image */}
                    <div className="w-full md:w-1/2 flex flex-col gap-4">
                      <div className="relative aspect-square w-full rounded-2xl border border-border bg-muted/10 overflow-hidden flex items-center justify-center group">
                        {activeData.images && activeData.images.length > 0 ? (
                            <img
                              key={activeData.images[imageIndex]}
                              src={activeData.images[imageIndex]}
                              alt={activeData.title}
                              className="w-full h-full object-contain transition-opacity duration-200"
                            />
                        ) : (
                          <span className="text-8xl font-black text-muted/20">
                            {activeData.title.match(/\((.+?)\)/)?.[1] || activeData.title.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Media Action Buttons */}
                      <div className="flex gap-2">
                        {activeData.video && (
                          <button 
                            onClick={() => setMediaModal("video")}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
                          >
                            <Play className="h-4 w-4" />
                            Xem Video
                          </button>
                        )}
                        {activeData.model_3d && (
                          <button 
                            onClick={() => setMediaModal("3d")}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
                          >
                            <Box className="h-4 w-4" />
                            Mô hình 3D
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right side of Panel: Info */}
                    <div className="w-full md:w-1/2 flex flex-col">
                      <div className="mb-6">
                        <h2 className="text-5xl font-black text-foreground mb-2">{activeData.title}</h2>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{activeData.subtitle}</p>
                      </div>

                      {/* Relationships / Derivation */}
                      {(activeData.derivation || activeData.base_letter || activeData.related_letters) && (
                        <div className="mb-6 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:bg-violet-950/20 dark:border-violet-900/50">
                          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600">Mối quan hệ</h3>
                          
                          {activeData.derivation && (
                            <p className="text-sm text-violet-800 dark:text-violet-200 mb-3 leading-relaxed">
                              {activeData.derivation}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {activeData.base_letter && (
                              <button 
                                onClick={() => selectItem("letter", activeData.base_letter!)}
                                className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-violet-700 shadow-sm border border-violet-100 hover:border-violet-300 transition"
                              >
                                ← Chữ gốc: {activeData.base_letter}
                              </button>
                            )}
                            {activeData.related_letters?.map(rel => (
                              <button 
                                key={rel}
                                onClick={() => selectItem("letter", rel)}
                                className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-violet-700 shadow-sm border border-violet-100 hover:border-violet-300 transition"
                              >
                                Biến thể: {rel} →
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Mnemonic */}
                      {activeData.mnemonic && (
                        <div>
                          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Cách ra ký hiệu</h3>
                          <div className="rounded-xl bg-muted/10 p-4 border border-border">
                            <p className="text-base font-medium leading-relaxed">
                              {activeData.mnemonic}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            )}
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              💡 Mẹo: Dùng phím <kbd className="rounded border bg-muted px-1">←</kbd> <kbd className="rounded border bg-muted px-1">→</kbd> trên bàn phím để chuyển chữ nhanh.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════ SECTION: Name Spelling ═══════════════ */}
      <div className="mb-10">
        <NameSpeller />
      </div>

      {/* ═══════════════ SECTION: Information ═══════════════ */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-sky-50 p-6 text-sky-900 shadow-sm border border-sky-100 dark:bg-sky-950/20 dark:text-sky-100 dark:border-sky-900/50">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold text-sky-700 dark:text-sky-300">
            Bảng chữ cái ngón tay là gì?
          </h2>
        </div>
        
        <div className="space-y-4 text-sm leading-relaxed text-sky-800/90 dark:text-sky-200/90">
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
          <p className="rounded-lg bg-sky-100/50 p-3 italic dark:bg-sky-900/50">
            Ví dụ: &quot;Hà Nội&quot; sẽ được đánh vần theo thứ tự sau: <strong>H | A | Dấu Huyền | (ngắt chữ) | N | Ô | I | Dấu nặng</strong>
          </p>
          <div className="pt-2">
            <p className="font-semibold text-sky-900 dark:text-sky-100 mb-2">Khoảng cách giữa 2 từ sẽ được thể hiện bằng những cách sau:</p>
            <ul className="ml-6 list-disc space-y-1.5">
              <li>Gật đầu sau mỗi từ.</li>
              <li>Ngưng lại 1 khoảng thời gian từ 0,5 - 1 giây giữa 2 từ.</li>
              <li>Dùng bàn tay gạt từ phải sang trái nếu thuận tay phải và ngược lại nếu thuận tay trái.</li>
              <li>Đánh vần các từ từ trái sang phải, sau mỗi từ thì tay đánh vần chuyển động sang phải (giống cách viết chữ).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ═══════════════ Media Modal (Video/3D only) ═══════════════ */}
      {mediaModal && activeData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-opacity duration-200"
          onClick={() => setMediaModal(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video rounded-2xl border border-border bg-black shadow-2xl overflow-hidden flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMediaModal(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {mediaModal === "video" && activeData.video && (
              <iframe
                src={activeData.video}
                className="h-full w-full"
                allow="autoplay"
                allowFullScreen
              />
            )}
            
            {mediaModal === "3d" && activeData.model_3d && (
              <div className="text-white text-center">
                <Box className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Trình duyệt 3D đang tải...</p>
                <p className="text-xs text-muted-foreground mt-2">Tính năng đang được phát triển (Phase 5)</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
