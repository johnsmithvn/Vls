"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  Loader2,
  ArrowRight,
  FileText,
  MessageSquare,
  Quote,
  Filter,
  ChevronLeft,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { getCategories, browseWords, searchWords } from "@/lib/api";
import type {
  CategoryWithCount,
  WordBrowseItem,
  WordSearchResult,
} from "@/lib/api";

const ENTRY_TYPE_CONFIG = {
  word: { label: "Từ", icon: FileText, color: "bg-blue-100 text-blue-700" },
  phrase: {
    label: "Cụm từ",
    icon: MessageSquare,
    color: "bg-emerald-100 text-emerald-700",
  },
  sentence: { label: "Câu", icon: Quote, color: "bg-violet-100 text-violet-700" },
} as const;

function EntryTypeBadge({ type }: { type: keyof typeof ENTRY_TYPE_CONFIG }) {
  const config = ENTRY_TYPE_CONFIG[type] || ENTRY_TYPE_CONFIG.word;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.color}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default function DictionaryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [entryTypeFilter, setEntryTypeFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => setDebouncedQuery(value), 300);
    setDebounceTimer(timer);
  };

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError, refetch: refetchCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch browse results (when category selected or browsing all)
  const { data: browseData, isLoading: browseLoading, isError: browseError, refetch: refetchBrowse } = useQuery({
    queryKey: [
      "browse",
      selectedCategory,
      entryTypeFilter,
      page,
    ],
    queryFn: () =>
      browseWords({
        category: selectedCategory || undefined,
        entry_type: entryTypeFilter || undefined,
        page,
        limit: 20,
      }),
    enabled: !debouncedQuery,
    retry: 1,
  });

  // Search results (when user is typing)
  const { data: searchResults, isLoading: searchLoading, isError: searchError } = useQuery({
    queryKey: ["dictionary-search", debouncedQuery],
    queryFn: () => searchWords(debouncedQuery, { limit: 20 }),
    enabled: debouncedQuery.length >= 1,
    retry: 1,
  });

  const isSearchMode = debouncedQuery.length >= 1;
  const showBrowse = !isSearchMode;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <BookOpen className="h-5 w-5 text-amber-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Từ điển Ngôn ngữ Ký hiệu
          </h1>
        </div>
        <p className="text-muted">
          Tra cứu từ vựng, cụm từ và câu thông dụng. Mỗi mục đều có video
          hướng dẫn cách ra ký hiệu.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          id="dictionary-search"
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Tìm từ, cụm từ, hoặc câu..."
          className="w-full rounded-2xl border border-border bg-surface py-4 pl-12 pr-4 text-base
                     shadow-md outline-none transition-all placeholder:text-muted
                     focus:border-primary focus:shadow-lg focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
        />
        {searchLoading && (
          <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      {/* ═══════ SEARCH RESULTS ═══════ */}
      {isSearchMode && (
        <div className="space-y-2">
          <p className="mb-4 text-sm text-muted">
            Kết quả cho &quot;{debouncedQuery}&quot;
            {searchResults && ` — ${searchResults.length} kết quả`}
          </p>
          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((word: WordSearchResult) => (
                <Link
                  key={word.id}
                  href={`/dictionary/${word.id}`}
                  className="flex items-center justify-between rounded-xl border border-border
                             bg-surface p-4 shadow-sm transition-all
                             hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold">
                      {word.text_vn}
                    </span>
                    <EntryTypeBadge
                      type={word.entry_type as keyof typeof ENTRY_TYPE_CONFIG}
                    />
                    {word.part_of_speech && (
                      <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] text-primary">
                        {word.part_of_speech}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted" />
                </Link>
              ))}
            </div>
          ) : (
            !searchLoading && (
              <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                <Search className="mx-auto mb-3 h-8 w-8 text-muted/40" />
                <p className="text-muted">
                  Không tìm thấy &quot;{debouncedQuery}&quot;
                </p>
                <p className="mt-1 text-xs text-muted">
                  Thử tìm từ khác hoặc duyệt theo chủ đề bên dưới
                </p>
              </div>
            )
          )}
        </div>
      )}

      {/* ═══════ BROWSE MODE ═══════ */}
      {showBrowse && (
        <>
          {/* Back button when inside a category */}
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedCategoryName("");
                setEntryTypeFilter(null);
                setPage(1);
              }}
              className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Quay lại danh mục
            </button>
          )}

          {/* Category Grid */}
          {!selectedCategory && (
            <div className="mb-10">
              <h2 className="mb-4 text-lg font-bold">Duyệt theo chủ đề</h2>
              {categoriesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : categoriesError ? (
                <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-8 text-center">
                  <WifiOff className="mx-auto mb-3 h-8 w-8 text-red-400" />
                  <p className="font-medium text-red-600">Không thể kết nối đến server</p>
                  <p className="mt-1 text-xs text-red-400">
                    Hãy chắc chắn Backend API đang chạy tại localhost:8000
                  </p>
                  <button
                    onClick={() => refetchCategories()}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Thử lại
                  </button>
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {categories.map((cat: CategoryWithCount, i: number) => (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setSelectedCategoryName(cat.name);
                        setPage(1);
                      }}
                      className="group flex flex-col items-center justify-center rounded-2xl border border-border
                                 bg-surface p-5 shadow-sm transition-all cursor-pointer
                                 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
                    >
                      <span className="mb-2 text-3xl">{cat.icon || "📂"}</span>
                      <span className="text-sm font-semibold">{cat.name}</span>
                      <span className="mt-1 text-xs text-muted">
                        {cat.word_count} từ
                      </span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                  <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted/40" />
                  <p className="text-muted">
                    Chưa có chủ đề nào. Dữ liệu đang được bổ sung.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Entry Type filter tabs */}
          {selectedCategory && (
            <div className="mb-6">
              <h2 className="mb-3 text-lg font-bold">{selectedCategoryName}</h2>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted" />
                {[
                  { value: null, label: "Tất cả" },
                  { value: "word", label: "Từ đơn" },
                  { value: "phrase", label: "Cụm từ" },
                  { value: "sentence", label: "Câu" },
                ].map((tab) => (
                  <button
                    key={tab.value ?? "all"}
                    onClick={() => {
                      setEntryTypeFilter(tab.value);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      entryTypeFilter === tab.value
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Word List (browse results) */}
          {selectedCategory && (
            <AnimatePresence mode="wait">
              {browseLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : browseData && browseData.data.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {browseData.data.map((word: WordBrowseItem) => (
                    <Link
                      key={word.id}
                      href={`/dictionary/${word.id}`}
                      className="flex items-center justify-between rounded-xl border border-border
                                 bg-surface p-4 shadow-sm transition-all
                                 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base font-semibold">
                          {word.text_vn}
                        </span>
                        <EntryTypeBadge
                          type={
                            word.entry_type as keyof typeof ENTRY_TYPE_CONFIG
                          }
                        />
                        {word.part_of_speech && (
                          <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-[10px] text-primary">
                            {word.part_of_speech}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </Link>
                  ))}

                  {/* Pagination */}
                  {browseData.meta?.pagination &&
                    browseData.meta.pagination.pages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium
                                     transition-colors hover:bg-surface-hover disabled:opacity-40"
                        >
                          Trước
                        </button>
                        <span className="text-sm text-muted">
                          Trang {page} / {browseData.meta.pagination.pages}
                        </span>
                        <button
                          onClick={() =>
                            setPage((p) =>
                              Math.min(browseData.meta.pagination.pages, p + 1),
                            )
                          }
                          disabled={page === browseData.meta.pagination.pages}
                          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium
                                     transition-colors hover:bg-surface-hover disabled:opacity-40"
                        >
                          Sau
                        </button>
                      </div>
                    )}
                </motion.div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                  <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted/40" />
                  <p className="text-muted">
                    Chưa có từ nào trong chủ đề này
                  </p>
                </div>
              )}
            </AnimatePresence>
          )}

          {/* All words section (when no category selected) */}
          {!selectedCategory && (
            <div>
              <h2 className="mb-4 text-lg font-bold">Tất cả từ vựng</h2>
              <div className="mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted" />
                {[
                  { value: null, label: "Tất cả" },
                  { value: "word", label: "Từ đơn" },
                  { value: "phrase", label: "Cụm từ" },
                  { value: "sentence", label: "Câu" },
                ].map((tab) => (
                  <button
                    key={tab.value ?? "all"}
                    onClick={() => {
                      setEntryTypeFilter(tab.value);
                      setPage(1);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      entryTypeFilter === tab.value
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {browseLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : browseError ? (
                <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-8 text-center">
                  <WifiOff className="mx-auto mb-3 h-8 w-8 text-red-400" />
                  <p className="font-medium text-red-600">Không thể tải dữ liệu</p>
                  <button
                    onClick={() => refetchBrowse()}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Thử lại
                  </button>
                </div>
              ) : browseData && browseData.data.length > 0 ? (
                <div className="space-y-2">
                  {browseData.data.map((word: WordBrowseItem) => (
                    <Link
                      key={word.id}
                      href={`/dictionary/${word.id}`}
                      className="flex items-center justify-between rounded-xl border border-border
                                 bg-surface p-4 shadow-sm transition-all
                                 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base font-semibold">
                          {word.text_vn}
                        </span>
                        <EntryTypeBadge
                          type={
                            word.entry_type as keyof typeof ENTRY_TYPE_CONFIG
                          }
                        />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted" />
                    </Link>
                  ))}

                  {/* Pagination */}
                  {browseData.meta?.pagination &&
                    browseData.meta.pagination.pages > 1 && (
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium
                                     transition-colors hover:bg-surface-hover disabled:opacity-40"
                        >
                          Trước
                        </button>
                        <span className="text-sm text-muted">
                          Trang {page} / {browseData.meta.pagination.pages}
                        </span>
                        <button
                          onClick={() =>
                            setPage((p) =>
                              Math.min(browseData.meta.pagination.pages, p + 1),
                            )
                          }
                          disabled={page === browseData.meta.pagination.pages}
                          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium
                                     transition-colors hover:bg-surface-hover disabled:opacity-40"
                        >
                          Sau
                        </button>
                      </div>
                    )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
                  <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted/40" />
                  <p className="text-muted">
                    Chưa có dữ liệu từ điển. Hãy thêm từ vựng để bắt đầu.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
