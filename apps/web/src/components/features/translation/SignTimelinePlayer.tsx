"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Gauge,
  ChevronRight,
} from "lucide-react";
import type { ResolvedToken } from "@/lib/api";

/**
 * SignTimelinePlayer — Mini Media Sequencing Engine.
 *
 * State machine: idle → playing → paused → complete
 * Auto-advances through tokens based on duration_ms from asset metadata.
 * Falls back to DEFAULT_DURATION_MS when no metadata available.
 */

type PlayerState = "idle" | "playing" | "paused" | "complete";

const DEFAULT_DURATION_MS = 1200;
const SPEED_OPTIONS = [0.5, 1, 1.5] as const;
type SpeedOption = (typeof SPEED_OPTIONS)[number];

function getTokenDuration(token: ResolvedToken): number {
  /**
   * Extract duration from asset metadata.
   * Priority: first asset with duration_ms > default.
   */
  if (!token.sign?.assets?.length) return DEFAULT_DURATION_MS;

  for (const asset of token.sign.assets) {
    const meta = asset.metadata;
    if (meta && typeof meta.duration_ms === "number") {
      return meta.duration_ms || DEFAULT_DURATION_MS;
    }
  }
  return DEFAULT_DURATION_MS;
}

function getTotalDuration(tokens: ResolvedToken[], speed: SpeedOption): number {
  return tokens.reduce(
    (sum, token) => sum + getTokenDuration(token) / speed,
    0,
  );
}

export function SignTimelinePlayer({
  results,
  stats,
}: {
  results: ResolvedToken[];
  stats: {
    total_tokens: number;
    phrase_match: number;
    word_match: number;
    fingerspell: number;
    coverage: number;
  };
}) {
  const [state, setState] = useState<PlayerState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speed, setSpeed] = useState<SpeedOption>(1);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const tokenStartTimeRef = useRef<number>(0);
  const activeTokenRef = useRef<HTMLDivElement | null>(null);

  const totalDuration = getTotalDuration(results, speed);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-scroll active token into view
  useEffect(() => {
    if (activeTokenRef.current) {
      activeTokenRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advanceToken = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= results.length) {
        stopTimer();
        setState("complete");
        return prev;
      }
      tokenStartTimeRef.current = Date.now();
      return next;
    });
  }, [results.length, stopTimer]);

  const startPlayback = useCallback(() => {
    if (results.length === 0) return;

    stopTimer();
    setState("playing");
    tokenStartTimeRef.current = Date.now();

    if (state === "complete" || state === "idle") {
      setCurrentIndex(0);
      setElapsed(0);
      startTimeRef.current = Date.now();
      tokenStartTimeRef.current = Date.now();
    } else {
      // Resuming from pause
      startTimeRef.current = Date.now() - elapsed;
    }

    timerRef.current = setInterval(() => {
      const now = Date.now();
      setElapsed(now - startTimeRef.current);

      // Check if current token duration has elapsed
      const currentTokenDuration =
        getTokenDuration(results[currentIndex]) / speed;
      const tokenElapsed = now - tokenStartTimeRef.current;

      if (tokenElapsed >= currentTokenDuration) {
        advanceToken();
      }
    }, 50); // 50ms tick for smooth progress
  }, [results, state, speed, elapsed, currentIndex, stopTimer, advanceToken]);

  const pausePlayback = useCallback(() => {
    stopTimer();
    setState("paused");
  }, [stopTimer]);

  const resetPlayback = useCallback(() => {
    stopTimer();
    setState("idle");
    setCurrentIndex(0);
    setElapsed(0);
  }, [stopTimer]);

  // When speed changes during playback, restart timer
  useEffect(() => {
    if (state === "playing") {
      startPlayback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  if (results.length === 0) return null;

  const progressPercent = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;
  const clampedProgress = Math.min(progressPercent, 100);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
        <div className="flex flex-1 flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold">
            {stats.coverage}%{" "}
            <span className="font-normal text-muted">coverage</span>
          </span>
          <div className="h-4 w-px bg-border" />
          {stats.phrase_match > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
              {stats.phrase_match} cụm từ
            </span>
          )}
          {stats.word_match > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {stats.word_match} từ
            </span>
          )}
          {stats.fingerspell > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
              {stats.fingerspell} đánh vần
            </span>
          )}
        </div>
      </div>

      {/* Player controls */}
      <div className="rounded-xl border border-border bg-surface p-4">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            <span>
              {currentIndex + 1}/{results.length} tokens
            </span>
            <span>
              {(elapsed / 1000).toFixed(1)}s /{" "}
              {(totalDuration / 1000).toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play / Pause */}
            <button
              onClick={state === "playing" ? pausePlayback : startPlayback}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white
                         shadow-md shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-lg
                         active:scale-95"
            >
              {state === "playing" ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </button>

            {/* Reset */}
            <button
              onClick={resetPlayback}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border
                         text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              title="Quay lại đầu"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-muted" />
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all
                  ${
                    speed === s
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Token timeline */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {results.map((token, i) => (
          <PlayerTokenCard
            key={`${token.token}-${i}`}
            token={token}
            index={i}
            isActive={i === currentIndex && state !== "idle"}
            isPlayed={i < currentIndex}
            isUpcoming={i > currentIndex}
            ref={i === currentIndex ? activeTokenRef : null}
          />
        ))}
      </div>

      {/* State indicator */}
      {state === "complete" && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <ChevronRight className="h-4 w-4" />
          Phát xong! Nhấn ▶ để xem lại.
        </div>
      )}
    </div>
  );
}

/**
 * PlayerTokenCard — Individual token in the player timeline.
 * Shows active/played/upcoming visual states.
 */
import { forwardRef } from "react";

const PlayerTokenCard = forwardRef<
  HTMLDivElement,
  {
    token: ResolvedToken;
    index: number;
    isActive: boolean;
    isPlayed: boolean;
    isUpcoming: boolean;
  }
>(function PlayerTokenCard({ token, isActive, isPlayed, isUpcoming }, ref) {
  const isFingerspell = token.result_type === "fingerspell";
  const isPhrase = token.result_type === "phrase_match";

  // Dynamic border/bg based on state + tier
  let containerClass = "";
  if (isActive) {
    containerClass =
      "border-primary bg-primary/10 ring-2 ring-primary/30 scale-105 shadow-md";
  } else if (isPlayed) {
    containerClass = "border-border bg-surface opacity-60";
  } else if (isUpcoming) {
    containerClass = "border-border bg-surface";
  } else {
    // idle state
    const tierColor = isFingerspell
      ? "border-amber-300 bg-amber-50"
      : isPhrase
        ? "border-emerald-300 bg-emerald-50"
        : "border-primary/30 bg-primary-subtle";
    containerClass = tierColor;
  }

  const labelColor = isFingerspell
    ? "text-amber-700"
    : isPhrase
      ? "text-emerald-700"
      : "text-primary";

  const tagText = isFingerspell
    ? "đánh vần"
    : isPhrase
      ? "cụm từ"
      : "từ đơn";

  return (
    <div
      ref={ref}
      className={`relative flex shrink-0 flex-col items-center rounded-xl border p-3 transition-all duration-300 ${containerClass}`}
      style={{ minWidth: "80px" }}
    >
      {/* Fingerspell warning badge */}
      {isFingerspell && (
        <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white">
          <AlertCircle className="h-3 w-3" />
        </div>
      )}

      {/* Active indicator dot */}
      {isActive && (
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary animate-pulse" />
      )}

      {/* Sign visual */}
      <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-lg bg-white/60">
        {isFingerspell && token.letters ? (
          <div className="flex gap-0.5">
            {token.letters.slice(0, 5).map((l, i) => (
              <span key={i} className="text-xs font-bold text-amber-700">
                {l.token}
              </span>
            ))}
            {token.letters.length > 5 && (
              <span className="text-xs text-amber-500">…</span>
            )}
          </div>
        ) : (
          <span className="text-2xl">{isPlayed ? "✅" : "🤟"}</span>
        )}
      </div>

      {/* Token text */}
      <span
        className={`text-sm font-semibold ${isActive ? "text-primary" : ""}`}
      >
        {token.token}
      </span>

      {/* Type tag */}
      <span className={`mt-1 text-[10px] font-medium ${labelColor}`}>
        {tagText}
      </span>

      {/* Fingerspell helper text */}
      {isFingerspell && (
        <p className="mt-1 max-w-[100px] text-center text-[9px] text-amber-600/70">
          Chưa có ký hiệu
        </p>
      )}
    </div>
  );
});
