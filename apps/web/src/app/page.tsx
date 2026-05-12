import { SearchBar } from "@/components/features/dictionary/SearchBar";
import { Hand, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Hero */}
      <section className="mb-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-subtle px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Ngôn ngữ ký hiệu Việt Nam
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Tra cứu <span className="text-primary">Ngôn ngữ Ký hiệu</span>
          <br />
          nhanh như gõ Google
        </h1>

        <p className="mx-auto mb-8 max-w-lg text-muted">
          Từ điển đa phương tiện đầu tiên cho ngôn ngữ ký hiệu Việt Nam.
          Tra từ, xem video, học bảng chữ cái — tất cả trong một nơi.
        </p>

        <SearchBar />
      </section>

      {/* Feature Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <FeatureLink
          href="/alphabet"
          icon={<Hand className="h-6 w-6" />}
          title="Bảng chữ cái"
          description="29 chữ cái với hình ảnh liên tưởng giúp ghi nhớ nhanh"
          color="primary"
        />
        <FeatureLink
          href="/"
          icon={<BookOpen className="h-6 w-6" />}
          title="Từ điển đa góc"
          description="Xem ký hiệu từ nhiều góc nhìn: trước, bên, trên"
          color="accent"
        />
        <FeatureLink
          href="/"
          icon={<Sparkles className="h-6 w-6" />}
          title="Dịch câu"
          description="Nhập câu tiếng Việt → xem chuỗi ký hiệu tương ứng"
          color="success"
          badge="Sắp ra mắt"
        />
      </section>
    </div>
  );
}

function FeatureLink({
  href,
  icon,
  title,
  description,
  color,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  badge?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-amber-500/10 text-amber-600",
    success: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <Link
      href={href}
      className="group relative rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
    >
      {badge && (
        <span className="absolute top-3 right-3 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
          {badge}
        </span>
      )}
      <div
        className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${colorMap[color]}`}
      >
        {icon}
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Khám phá <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}
