"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type MediaItem = {
  id: string;
  type: string;
  path: string;
  title: string | null;
};

const AUTO_ADVANCE_MS = 5000;

function mediaUrl(path: string) {
  return `/api/media/${path}`;
}

export function MediaSlideshow({ items }: { items: MediaItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const active = items[activeIndex] ?? null;
  const hasImages = items.some((item) => item.type !== "VIDEO");
  const imageCount = items.length;

  const goTo = useCallback((index: number) => {
    setActiveIndex((index + items.length) % items.length);
  }, [items.length]);

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const previous = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (paused || !hasImages || items.length < 2) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, hasImages, items.length]);

  if (items.length === 0) return null;

  return (
    <div
      className="slideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="slideshow-stage">
        {active?.type === "VIDEO" ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            key={active.id}
            src={mediaUrl(active.path)}
            className="slideshow-media"
            controls
            autoPlay
            muted
            playsInline
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={active?.id}
            src={active ? mediaUrl(active.path) : ""}
            alt={active?.title ?? "Game media"}
            className="slideshow-media"
          />
        )}
        {items.length > 1 ? (
          <>
            <button
              type="button"
              className="slideshow-nav slideshow-nav-prev"
              aria-label="Ảnh trước"
              onClick={previous}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="slideshow-nav slideshow-nav-next"
              aria-label="Ảnh sau"
              onClick={next}
            >
              <ChevronRight size={20} />
            </button>
            <div className="slideshow-counter" aria-hidden="true">
              {activeIndex + 1} / {imageCount}
            </div>
          </>
        ) : null}
      </div>
      {items.length > 1 ? (
        <div className="slideshow-thumbs" role="tablist" aria-label="Chọn media">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={item.title ?? `Media ${index + 1}`}
              className={index === activeIndex ? "slideshow-thumb is-active" : "slideshow-thumb"}
              onClick={() => setActiveIndex(index)}
            >
              {item.type === "VIDEO" ? (
                <span className="slideshow-thumb-video" aria-hidden="true">
                  <ChevronRight size={14} />
                </span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(item.path)} alt="" />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
