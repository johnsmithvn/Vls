"use client";

import type { SignAsset } from "@/lib/api";

interface MediaRendererProps {
  asset: SignAsset;
  className?: string;
}

/**
 * Extract Google Drive file ID from various URL formats.
 * Supports:
 * - https://drive.google.com/file/d/{ID}/view
 * - https://drive.google.com/file/d/{ID}/preview
 * - https://drive.google.com/open?id={ID}
 */
function extractDriveId(url: string): string | null {
  // Format: /file/d/{ID}/...
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // Format: ?id={ID}
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  return null;
}

/**
 * Check if a URL is a Google Drive link.
 */
function isDriveUrl(url: string): boolean {
  return url.includes("drive.google.com");
}

/**
 * Polymorphic media renderer.
 * Auto-detects media_type and renders the appropriate HTML element.
 * Supports: image, video (self-hosted + Google Drive embed), 3d_model.
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

    case "video": {
      // Google Drive embed
      if (isDriveUrl(asset.url)) {
        const driveId = extractDriveId(asset.url);
        if (driveId) {
          return (
            <div className={`relative overflow-hidden rounded-xl ${className}`}>
              <iframe
                src={`https://drive.google.com/file/d/${driveId}/preview`}
                className="h-full w-full aspect-video"
                allow="autoplay; encrypted-media"
                allowFullScreen
                loading="lazy"
                title="Video ký hiệu ngôn ngữ ký hiệu"
                style={{ border: "none" }}
              />
            </div>
          );
        }
      }

      // Self-hosted video (R2, local, etc.)
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
    }

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
