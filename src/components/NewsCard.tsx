"use client";

import Link from "next/link";
import { Article } from "@/types";
import { getCategoryInfo, formatDate } from "@/lib/config";
import { Clock, ArrowUpRight } from "lucide-react";

interface NewsCardProps {
  article: Article;
  variant?: "default" | "compact" | "horizontal";
}

export default function NewsCard({
  article,
  variant = "default",
}: NewsCardProps) {
  const catInfo = getCategoryInfo(article.category);

  if (variant === "horizontal") {
    return (
      <Link
        href={`/article/${article.slug}`}
        id={`news-card-${article.slug}`}
        className="group flex gap-4 pb-4 border-b border-[var(--color-border)]"
      >
        {/* Image */}
        {article.imageUrl && (
          <div className="w-32 h-24 flex-shrink-0 bg-gray-100">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-start">
          <span
            className="inline-block text-[0.65rem] font-bold uppercase tracking-wider mb-1"
            style={{ color: catInfo.color }}
          >
            {catInfo.label}
          </span>
          <h3 className="text-sm font-bold font-[var(--font-display)] text-black line-clamp-2 group-hover:text-[var(--color-accent-primary)] transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-text-muted)]">
            <Clock size={12} />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href={`/article/${article.slug}`}
        id={`news-card-compact-${article.slug}`}
        className="group block"
      >
        <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg-secondary)] transition-colors px-2">
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-[0.6rem] font-bold uppercase tracking-wider mb-1"
              style={{ color: catInfo.color }}
            >
              {catInfo.label}
            </span>
            <h4 className="text-sm font-bold font-[var(--font-display)] text-black line-clamp-2 group-hover:text-[var(--color-accent-primary)] transition-colors">
              {article.title}
            </h4>
            <span className="text-xs text-[var(--color-text-muted)] mt-1 block">
              {formatDate(article.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link
      href={`/article/${article.slug}`}
      id={`news-card-${article.slug}`}
      className="group block flex flex-col h-full"
    >
      {/* Image */}
      {article.imageUrl && (
        <div className="w-full aspect-[3/2] overflow-hidden mb-3 bg-gray-100">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col flex-grow">
        <span
          className="inline-block text-[0.7rem] font-bold uppercase tracking-wider mb-1"
          style={{ color: catInfo.color }}
        >
          {catInfo.label}
        </span>
        <h3 className="text-base md:text-lg font-bold font-[var(--font-display)] text-black leading-snug group-hover:text-[var(--color-accent-primary)] transition-colors mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3 flex-grow leading-snug">
          {article.excerpt}
        </p>
        
        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-[var(--color-text-tertiary)] mt-auto pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          <span>·</span>
          <span>{article.readingTime} min</span>
        </div>
      </div>
    </Link>
  );
}
