"use client";

import type { SignAsset } from "@/lib/api";

interface MediaRendererProps {
  asset: SignAsset;
  className?: string;
}

/**
 * Polymorphic media renderer.
 * Auto-detects media_type and renders the appropriate HTML element.
 */
export function MediaRenderer({ asset, className = "" }: MediaRendererProps) {
  switch (asset.media_type) {
    case "image":
      return (
        <picture>
          <img
            src={asset.url}
            alt="Ký hiệu ngôn ngữ ký hiệu"
            className={`rounded-xl object-contain ${className}`}
            loading="lazy"
          />
        </picture>
      );

    case "video":
      return (
        <video
          src={asset.url}
          className={`rounded-xl ${className}`}
          autoPlay
          loop
          muted
          playsInline
          controls
        />
      );

    case "3d_model":
      // Phase 5: React Three Fiber
      return (
        <div
          className={`flex items-center justify-center rounded-xl bg-surface-hover ${className}`}
        >
          <span className="text-muted text-sm">Mô hình 3D (sắp ra mắt)</span>
        </div>
      );

    default:
      return null;
  }
}
