"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BreakingNews } from "@/types";

interface TickerProps {
  items: BreakingNews[];
}

export default function BreakingNewsTicker({ items }: TickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  if (!items || items.length === 0) return null;

  const displayItems = [...items, ...items, ...items];

  return (
    <div
      id="breaking-news-ticker"
      className="bbc-ticker"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Breaking label */}
      <div className="bbc-ticker-label">
        <span className="bbc-ticker-dot" />
        BREAKING
      </div>

      {/* Scrolling content */}
      <div className="bbc-ticker-track">
        <div
          className="bbc-ticker-content"
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {displayItems.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              href={`/article/${item.slug}`}
              className="bbc-ticker-item"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
