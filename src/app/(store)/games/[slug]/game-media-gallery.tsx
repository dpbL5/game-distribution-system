"use client";

import { useState } from "react";

type MediaItem = { id: string; type: string; path: string; previewPath: string | null; title: string | null };

type Props = { images: MediaItem[]; videos: MediaItem[]; gameName: string };

export function GameMediaGallery({ images, videos, gameName }: Props) {
  const all: MediaItem[] = [...images, ...videos];
  const [activeId, setActiveId] = useState<string | null>(all[0]?.id ?? null);
  const active = all.find((m) => m.id === activeId) ?? all[0] ?? null;

  if (all.length === 0) {
    return (
      <section className="panel stack">
        <span className="eyebrow">MEDIA</span>
        <p className="muted small">Chưa có ảnh/video cho tựa này.</p>
      </section>
    );
  }

  return (
    <section className="panel stack showcase-gallery">
      <span className="eyebrow">GALLERY · {images.length} ẢNH · {videos.length} VIDEO</span>
      <div className="showcase-stage">
        {active ? (
          active.type === "VIDEO" ? (
            <video
              key={active.id}
              className="showcase-stage-media"
              src={`/api/media/${active.path}`}
              poster={active.previewPath ? `/api/media/${active.previewPath}` : undefined}
              controls
              preload="metadata"
              playsInline
            />
          ) : (
            <img
              key={active.id}
              className="showcase-stage-media"
              src={`/api/media/${active.path}`}
              alt={active.title ?? `${gameName} screenshot`}
              loading="eager"
            />
          )
        ) : null}
        {active?.title ? <span className="showcase-stage-caption muted small">{active.title}</span> : null}
      </div>
      <div className="showcase-thumbs" role="tablist" aria-label="Chọn ảnh hoặc video">
        {all.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={item.id === activeId}
            className={`showcase-thumb ${item.id === activeId ? "showcase-thumb-active" : ""} ${item.type === "VIDEO" ? "showcase-thumb-video" : ""}`}
            onClick={() => setActiveId(item.id)}
            title={item.title ?? item.type}
          >
            <img
              src={item.type === "VIDEO" && item.previewPath ? `/api/media/${item.previewPath}` : `/api/media/${item.path}`}
              alt=""
              loading="lazy"
            />
            {item.type === "VIDEO" ? <span className="showcase-thumb-play" aria-hidden="true">▶</span> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
