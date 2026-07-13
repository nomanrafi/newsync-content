import { Metadata } from "next";
import Link from "next/link";
import { getArticleBySlug, getArticles, getRelatedArticles } from "@/lib/articles";
import { getCategoryInfo, formatDate, siteConfig } from "@/lib/config";
import NewsCard from "@/components/NewsCard";
import {
  Clock,
  Calendar,
  ExternalLink,
  ChevronLeft,
  Share2,
  Bookmark,
} from "lucide-react";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Generate SEO metadata
export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  return {
    title: article.seo.title || article.title,
    description: article.seo.description || article.excerpt,
    keywords: article.seo.keywords,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: article.imageUrl ? [{ url: article.imageUrl }] : [],
      url: `${siteConfig.url}/article/${article.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Try GitHub first, fallback to demo
  let article = await getArticleBySlug(slug);
  let relatedArticles = article ? await getRelatedArticles(article) : [];

  // If not found in GitHub, check demo articles
  if (!article) {
    // Import demo data from homepage
    const allArticles = await getArticles();

    article = allArticles.find((a) => a.slug === slug) || null;
    if (article) {
      relatedArticles = allArticles
        .filter(
          (a) => a.category === article!.category && a.slug !== article!.slug
        )
        .slice(0, 4);
    }
  }

  if (!article) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-[var(--color-text-tertiary)] mb-8">
          The article you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold hover:bg-indigo-600 transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Home
        </Link>
      </div>
    );
  }

  const catInfo = getCategoryInfo(article.category);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description: article.excerpt,
            image: article.imageUrl,
            datePublished: article.publishedAt,
            author: {
              "@type": "Person",
              name: article.author,
            },
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.url,
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteConfig.url}/article/${article.slug}`,
            },
          }),
        }}
      />

      <article id="article-page" className="container-main py-8">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
            <Link
              href="/"
              className="hover:text-[var(--color-accent-secondary)] transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/category/${article.category}`}
              className="hover:text-[var(--color-accent-secondary)] transition-colors"
              style={{ color: catInfo.color }}
            >
              {catInfo.label}
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text-tertiary)] truncate">
              {article.title}
            </span>
          </nav>

          {/* Category Badge */}
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
            style={{
              color: catInfo.color,
              backgroundColor: catInfo.bgColor,
            }}
          >
            {catInfo.icon} {catInfo.label}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-4xl font-extrabold font-[var(--font-display)] leading-tight mb-6">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-6 max-w-3xl">
            {article.excerpt}
          </p>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-tertiary)] mb-8 pb-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {article.author.charAt(0)}
              </div>
              <span className="font-medium text-[var(--color-text-primary)]">
                {article.author}
              </span>
            </div>
            <span className="text-[var(--color-text-muted)]">·</span>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <span className="text-[var(--color-text-muted)]">·</span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{article.readingTime} min read</span>
            </div>

            {/* Action Buttons */}
            <div className="ml-auto flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-white hover:border-[var(--color-border-hover)] transition-all"
                aria-label="Share article"
              >
                <Share2 size={15} />
              </button>
              <button
                className="w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-white hover:border-[var(--color-border-hover)] transition-all"
                aria-label="Bookmark article"
              >
                <Bookmark size={15} />
              </button>
            </div>
          </div>

          {/* Featured Image */}
          {article.imageUrl && (
            <figure className="mb-8">
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
              {article.imageCredit && (
                <figcaption className="mt-3 text-xs text-[var(--color-text-muted)] text-center">
                  📷 Image Source:{" "}
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-accent-secondary)] hover:underline"
                  >
                    {article.imageCredit}
                  </a>
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Content */}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[var(--color-border)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                  Tags:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Link */}
          {article.sourceUrl && article.sourceUrl !== "#" && (
            <div className="mt-6 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink
                  size={14}
                  className="text-[var(--color-text-muted)]"
                />
                <span className="text-[var(--color-text-tertiary)]">
                  Original Source:
                </span>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent-secondary)] hover:underline font-medium"
                >
                  {article.sourceName || "View Original"}
                </a>
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="container-main py-8 border-t border-[var(--color-border)]">
          <div className="section-header">
            <div className="section-title">
              <span className="section-title-accent" />
              <span>Related Articles</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedArticles.map((ra) => (
              <NewsCard key={ra.slug} article={ra} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
