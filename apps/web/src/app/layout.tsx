import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/shared/layout/Header";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Sign Language OS — Từ điển Ngôn ngữ Ký hiệu",
  description:
    "Hệ thống tra cứu và học ngôn ngữ ký hiệu Việt Nam. Từ điển đa phương tiện, bảng chữ cái liên tưởng, dịch câu sang ký hiệu.",
  keywords: ["ngôn ngữ ký hiệu", "sign language", "từ điển", "học", "Việt Nam"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
