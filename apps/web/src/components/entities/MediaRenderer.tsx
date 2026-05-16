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
 * Check if a URL is a YouTube link.
 */
function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

/**
 * Extract YouTube video ID from various URL formats.
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
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
      // YouTube embed
      if (isYouTubeUrl(asset.url)) {
        const videoId = extractYouTubeId(asset.url);
        if (videoId) {
          return (
            <div className={`relative overflow-hidden rounded-xl ${className}`}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="h-full w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                title="Video ký hiệu ngôn ngữ ký hiệu"
                style={{ border: "none" }}
              />
            </div>
          );
        }
      }

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
