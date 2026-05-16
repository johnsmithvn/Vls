"use client";

/**
 * SignMediaPlayer — Unified media player for Google Drive, YouTube, and direct video URLs.
 *
 * Auto-detects URL type and renders the appropriate embed.
 * Usage: <SignMediaPlayer src="https://drive.google.com/file/d/xxx/view" />
 */

interface SignMediaPlayerProps {
  src: string;
  className?: string;
  /** Fallback text when URL is empty or invalid */
  fallbackText?: string;
}

type MediaSource = "youtube" | "gdrive" | "video" | "unknown";

function detectSource(url: string): MediaSource {
  if (!url) return "unknown";
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("drive.google.com")) return "gdrive";
  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg")
  )
    return "video";
  return "unknown";
}

function extractYouTubeId(url: string): string | null {
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
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

function extractGDriveFileId(url: string): string | null {
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/file/d/FILE_ID/preview
  // https://drive.google.com/open?id=FILE_ID
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function SignMediaPlayer({
  src,
  className = "",
  fallbackText = "Không có video",
}: SignMediaPlayerProps) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-surface-hover text-muted ${className}`}
        style={{ aspectRatio: "16/9" }}
      >
        <p className="text-sm">{fallbackText}</p>
      </div>
    );
  }

  const source = detectSource(src);

  if (source === "youtube") {
    const videoId = extractYouTubeId(src);
    if (!videoId) {
      return (
        <div
          className={`flex items-center justify-center rounded-xl bg-surface-hover text-muted ${className}`}
          style={{ aspectRatio: "16/9" }}
        >
          <p className="text-sm">Link YouTube không hợp lệ</p>
        </div>
      );
    }
    return (
      <iframe
        className={`w-full rounded-xl ${className}`}
        style={{ aspectRatio: "16/9" }}
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (source === "gdrive") {
    const fileId = extractGDriveFileId(src);
    if (!fileId) {
      return (
        <div
          className={`flex items-center justify-center rounded-xl bg-surface-hover text-muted ${className}`}
          style={{ aspectRatio: "16/9" }}
        >
          <p className="text-sm">Link Google Drive không hợp lệ</p>
        </div>
      );
    }
    return (
      <iframe
        className={`w-full rounded-xl ${className}`}
        style={{ aspectRatio: "16/9" }}
        src={`https://drive.google.com/file/d/${fileId}/preview`}
        title="Google Drive video player"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    );
  }

  if (source === "video") {
    return (
      <video
        className={`w-full rounded-xl ${className}`}
        style={{ aspectRatio: "16/9" }}
        controls
        preload="metadata"
      >
        <source src={src} />
        Trình duyệt không hỗ trợ video.
      </video>
    );
  }

  // Unknown — try as direct video
  return (
    <video
      className={`w-full rounded-xl ${className}`}
      style={{ aspectRatio: "16/9" }}
      controls
      preload="metadata"
    >
      <source src={src} />
      Trình duyệt không hỗ trợ video.
    </video>
  );
}
