import Link from "next/link";
import { Article } from "@/types";
import { getCategoryInfo, formatDate } from "@/lib/config";
import { ChevronRight } from "lucide-react";

interface HeroSectionProps {
  featured: Article;
  secondaryLeft: Article[];   // 2 articles for left column
  textHeadlines: Article[];   // 4 text-only articles for right column
}

export default function HeroSection({
  featured,
  secondaryLeft,
  textHeadlines,
}: HeroSectionProps) {
  const featuredCat = getCategoryInfo(featured.category);

  return (
    <section id="hero-section" className="bbc-hero">
      <div className="container">
        <div className="bbc-hero-grid">
          {/* ── LEFT COLUMN: 2 stacked image cards ── */}
          <div className="bbc-hero-left">
            {secondaryLeft.slice(0, 2).map((article) => {
              const cat = getCategoryInfo(article.category);
              return (
                <Link
                  key={article.slug}
                  href={`/article/${article.slug}`}
                  className="bbc-stacked-card bbc-card"
                  id={`hero-left-${article.slug}`}
                >
                  <div className="bbc-card-img" style={{ aspectRatio: "16/9" }}>
                    <img
                      src={article.imageUrl || "/placeholder.jpg"}
                      alt={article.title}
                      loading="eager"
                    />
                  </div>
                  <span className="bbc-category-label" style={{ color: cat.color }}>{cat.label}</span>
                  <h2 className="bbc-headline-sm">{article.title}</h2>
                  <span className="bbc-meta">{formatDate(article.publishedAt)}</span>
                </Link>
              );
            })}
          </div>

          {/* ── CENTER COLUMN: Featured large article ── */}
          <div className="bbc-hero-center">
            <Link
              href={`/article/${featured.slug}`}
              className="bbc-card"
              id="hero-featured"
            >
              <div className="bbc-hero-featured-img">
                <img
                  src={featured.imageUrl || "/placeholder.jpg"}
                  alt={featured.title}
                  loading="eager"
                />
              </div>
              <span className="bbc-category-label" style={{ color: featuredCat.color }}>
                {featuredCat.label}
              </span>
              <h1 className="bbc-headline-xl">{featured.title}</h1>
              <p className="bbc-summary">{featured.excerpt}</p>
              <span className="bbc-meta" style={{ marginTop: "8px" }}>
                {formatDate(featured.publishedAt)} · {featured.readingTime} min read
                {featured.sourceName ? ` · ${featured.sourceName}` : ""}
              </span>
            </Link>
          </div>

          {/* ── RIGHT COLUMN: Text-only headlines ── */}
          <div className="bbc-hero-right">
            <div className="bbc-hero-right-title">Top Stories</div>
            {textHeadlines.slice(0, 5).map((article) => {
              const cat = getCategoryInfo(article.category);
              return (
                <Link
                  key={article.slug}
                  href={`/article/${article.slug}`}
                  className="bbc-text-headline"
                  id={`hero-right-${article.slug}`}
                >
                  <span className="bbc-category-label" style={{ color: cat.color }}>{cat.label}</span>
                  <h3 className="bbc-headline-xs">{article.title}</h3>
                  <span className="bbc-meta">{formatDate(article.publishedAt)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
