"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDashboardStats, type DashboardStats } from "@/lib/admin-api";
import {
  BookOpen,
  MessageSquare,
  Quote,
  FolderOpen,
  Video,
  Image,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const data = await getDashboardStats(session.access_token);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <p className="mt-1 text-xs text-muted">
          Kiểm tra lại quyền truy cập (role: owner) trong database.
        </p>
      </div>
    );
  }

  const cards = stats
    ? [
        {
          label: "Từ đơn",
          value: stats.total_words,
          icon: BookOpen,
          color: "text-blue-400 bg-blue-500/10",
        },
        {
          label: "Cụm từ",
          value: stats.total_phrases,
          icon: MessageSquare,
          color: "text-emerald-400 bg-emerald-500/10",
        },
        {
          label: "Câu",
          value: stats.total_sentences,
          icon: Quote,
          color: "text-amber-400 bg-amber-500/10",
        },
        {
          label: "Chủ đề",
          value: stats.total_categories,
          icon: FolderOpen,
          color: "text-purple-400 bg-purple-500/10",
        },
        {
          label: "Video",
          value: stats.total_videos,
          icon: Video,
          color: "text-rose-400 bg-rose-500/10",
        },
        {
          label: "Hình ảnh",
          value: stats.total_images,
          icon: Image,
          color: "text-cyan-400 bg-cyan-500/10",
        },
      ]
    : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      {!stats ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-surface"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-surface p-5 transition hover:border-indigo-500/30"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted">{card.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
