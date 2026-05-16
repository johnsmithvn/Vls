"use client";

import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { Shield, LogIn, LogOut, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  // Not logged in → show login form
  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
              <Shield className="h-6 w-6 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="mt-1 text-sm text-muted">
              Đăng nhập với tài khoản Owner
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Mật khẩu"
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <LogIn className="h-4 w-4" />
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-xs text-muted">
            <Link href="/" className="text-indigo-400 hover:underline">
              ← Về trang chủ
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Logged in → render admin content with sidebar header
  return (
    <div className="min-h-[60vh]">
      {/* Admin top bar */}
      <div className="border-b border-border bg-surface/50 px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20">
              <Shield className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/admin"
                className="font-semibold text-foreground hover:text-indigo-400 transition"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/words"
                className="text-muted hover:text-foreground transition"
              >
                Từ vựng
              </Link>
              <Link
                href="/admin/categories"
                className="text-muted hover:text-foreground transition"
              >
                Chủ đề
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              {session.user.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted transition hover:bg-surface-hover hover:text-foreground"
            >
              <LogOut className="h-3 w-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Admin content */}
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}
