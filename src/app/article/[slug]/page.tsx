import { Metadata } from "next";
import Link from "next/link";
import { getArticleBySlug, getArticles, getRelatedArticles } from "@/lib/articles";
import { getCategoryInfo, formatDate, siteConfig } from "@/lib/config";
import NewsCard from "@/components/NewsCard";
import ViewTracker from "@/components/ViewTracker";
import LeaderboardAd from "@/components/ads/LeaderboardAd";
import NativeAd from "@/components/ads/NativeAd";
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
        <p className="text-[var(--grey-700)] mb-8">
          The article you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--black)] text-[var(--white)] font-semibold hover:bg-[var(--grey-800)] transition-colors"
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

      <ViewTracker slug={article.slug} category={article.category} />

      <article id="article-page" className="container py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-[var(--grey-200)] p-6 md:p-10 lg:p-14">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[var(--grey-700)] mb-6 font-[var(--font-sans)]">
            <Link
              href="/"
              className="hover:text-[var(--red)] transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href={`/category/${article.category}`}
              className="hover:text-[var(--red)] transition-colors"
              style={{ color: catInfo.color }}
            >
              {catInfo.label}
            </Link>
            <span>/</span>
            <span className="text-[var(--black)] truncate font-semibold">
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

          <LeaderboardAd />

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-4xl font-extrabold font-[var(--font-display)] leading-tight mb-6">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-[var(--grey-700)] leading-relaxed mb-6 max-w-3xl font-[var(--font-serif)]">
            {article.excerpt}
          </p>

          {/* Meta Bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--grey-700)] mb-8 pb-6 border-b border-[var(--grey-300)] font-[var(--font-sans)]">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                {article.author.charAt(0)}
              </div>
              <span className="font-bold text-[var(--black)]">
                {article.author}
              </span>
            </div>
            <span className="text-[var(--grey-300)]">·</span>
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
            <span className="text-[var(--grey-300)]">·</span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{article.readingTime} min read</span>
            </div>

            {/* Action Buttons */}
            <div className="ml-auto flex items-center gap-2">
              <button
                className="w-9 h-9 rounded-lg border border-[var(--grey-300)] flex items-center justify-center text-[var(--grey-700)] hover:text-[var(--black)] hover:border-[var(--grey-500)] transition-all"
                aria-label="Share article"
              >
                <Share2 size={15} />
              </button>
              <button
                className="w-9 h-9 rounded-lg border border-[var(--grey-300)] flex items-center justify-center text-[var(--grey-700)] hover:text-[var(--black)] hover:border-[var(--grey-500)] transition-all"
                aria-label="Bookmark article"
              >
                <Bookmark size={15} />
              </button>
            </div>
          </div>

          {/* Featured Image */}
          {article.imageUrl && (
            <figure className="mb-8">
              <div className="overflow-hidden bg-[var(--grey-200)]">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full aspect-video object-cover"
                />
              </div>
              {article.imageCredit && (
                <figcaption className="mt-3 text-xs text-[var(--grey-700)] text-center font-[var(--font-sans)]">
                  📷 Image Source:{" "}
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--black)] hover:underline font-bold"
                  >
                    {article.imageCredit}
                  </a>
                </figcaption>
              )}
            </figure>
          )}

          {/* Article Content */}
          <div
            className="article-content font-[var(--font-serif)]"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Native Ad inside article content */}
          <div className="mt-8">
            <NativeAd />
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[var(--grey-300)] font-[var(--font-sans)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[var(--black)] uppercase tracking-wide">
                  Tags:
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 bg-[var(--grey-100)] text-[var(--grey-800)] border border-[var(--grey-300)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Link */}
          {article.sourceUrl && article.sourceUrl !== "#" && (
            <div className="mt-6 p-4 bg-[var(--grey-100)] border border-[var(--grey-300)] font-[var(--font-sans)]">
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink
                  size={14}
                  className="text-[var(--grey-700)]"
                />
                <span className="text-[var(--grey-800)]">
                  Original Source:
                </span>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--blue)] hover:underline font-bold"
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
        <section className="container py-8 border-t border-[var(--black)] mt-12">
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
