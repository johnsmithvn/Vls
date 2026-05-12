"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { searchWords, type WordSearchResult } from "@/lib/api";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce: only search when user stops typing for 300ms
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchWords(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleFocus = useCallback(() => setIsOpen(true), []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
        <input
          id="search-bar"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          placeholder="Tìm từ vựng ngôn ngữ ký hiệu..."
          className="w-full rounded-2xl border border-border bg-surface py-4 pl-12 pr-4 text-base
                     shadow-md outline-none transition-all
                     placeholder:text-muted
                     focus:border-primary focus:shadow-lg focus:ring-2 focus:ring-primary/20"
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results && results.length > 0 && (
        <ul className="absolute top-full mt-2 w-full rounded-xl border border-border bg-surface shadow-lg overflow-hidden z-50">
          {results.map((word: WordSearchResult) => (
            <li key={word.id}>
              <Link
                href={`/dictionary/${word.id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface-hover"
              >
                <span className="font-medium">{word.text_vn}</span>
                {word.part_of_speech && (
                  <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-xs text-primary">
                    {word.part_of_speech}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {isOpen && debouncedQuery.length >= 1 && results?.length === 0 && !isLoading && (
        <div className="absolute top-full mt-2 w-full rounded-xl border border-border bg-surface p-4 text-center text-muted shadow-lg z-50">
          Không tìm thấy từ &quot;{debouncedQuery}&quot;
        </div>
      )}
    </div>
  );
}
