import { Article, Category } from "@/types";
import { getCategoryInfo, formatDate } from "@/lib/config";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategorySectionProps {
  category: Category;
  articles: Article[];
  showViewAll?: boolean;
  layoutType?: "grid-4" | "grid-3" | "mixed";
}

export default function CategorySection({
  category,
  articles,
  showViewAll = true,
  layoutType = "grid-4",
}: CategorySectionProps) {
  const catInfo = getCategoryInfo(category);

  if (!articles || articles.length === 0) return null;

  const renderGrid4 = () => {
    const leadArticle = articles[0];
    const col2 = articles[1];
    const col3 = articles[2];
    const col4 = articles[3];
    const subArticles = articles.slice(4, 8);

    return (
      <div className="bbc-grid-4">
        {/* Column 1 - Lead */}
        {leadArticle && (
          <div className="bbc-col-section">
            <Link href={`/article/${leadArticle.slug}`} className="bbc-card">
              <div className="bbc-card-img">
                <img src={leadArticle.imageUrl || "/placeholder.jpg"} alt={leadArticle.title} loading="lazy" />
              </div>
              <h3 className="bbc-headline-md">{leadArticle.title}</h3>
              <p className="bbc-summary">{leadArticle.excerpt}</p>
              <span className="bbc-meta">{formatDate(leadArticle.publishedAt)}</span>
            </Link>
            {subArticles.slice(0, 2).map((a) => (
              <Link key={a.slug} href={`/article/${a.slug}`} className="bbc-sub-item" style={{ display: "block" }}>
                <h4 className="bbc-headline-xs">{a.title}</h4>
                <span className="bbc-meta">{formatDate(a.publishedAt)}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Column 2 */}
        {col2 && (
          <div className="bbc-col-section">
            <Link href={`/article/${col2.slug}`} className="bbc-card">
              <div className="bbc-card-img">
                <img src={col2.imageUrl || "/placeholder.jpg"} alt={col2.title} loading="lazy" />
              </div>
              <h3 className="bbc-headline-sm">{col2.title}</h3>
              <span className="bbc-meta">{formatDate(col2.publishedAt)}</span>
            </Link>
            {subArticles.slice(2, 3).map((a) => (
              <Link key={a.slug} href={`/article/${a.slug}`} className="bbc-sub-item" style={{ display: "block" }}>
                <h4 className="bbc-headline-xs">{a.title}</h4>
                <span className="bbc-meta">{formatDate(a.publishedAt)}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Column 3 */}
        {col3 && (
          <div className="bbc-col-section">
            <Link href={`/article/${col3.slug}`} className="bbc-card">
              <div className="bbc-card-img">
                <img src={col3.imageUrl || "/placeholder.jpg"} alt={col3.title} loading="lazy" />
              </div>
              <h3 className="bbc-headline-sm">{col3.title}</h3>
              <span className="bbc-meta">{formatDate(col3.publishedAt)}</span>
            </Link>
          </div>
        )}

        {/* Column 4 */}
        {col4 && (
          <div className="bbc-col-section">
            <Link href={`/article/${col4.slug}`} className="bbc-card">
              <div className="bbc-card-img">
                <img src={col4.imageUrl || "/placeholder.jpg"} alt={col4.title} loading="lazy" />
              </div>
              <h3 className="bbc-headline-sm">{col4.title}</h3>
              <span className="bbc-meta">{formatDate(col4.publishedAt)}</span>
            </Link>
          </div>
        )}
      </div>
    );
  };

  const renderGrid3 = () => {
    return (
      <div className="bbc-grid-3">
        {articles.slice(0, 3).map((article, idx) => (
          <div key={article.slug} className="bbc-col-section">
            <Link href={`/article/${article.slug}`} className="bbc-card">
              <div className="bbc-card-img" style={{ aspectRatio: "16/9" }}>
                <img src={article.imageUrl || "/placeholder.jpg"} alt={article.title} loading="lazy" />
              </div>
              <h3 className="bbc-headline-md">{article.title}</h3>
              <p className="bbc-summary">{article.excerpt}</p>
              <span className="bbc-meta">{formatDate(article.publishedAt)}</span>
            </Link>
            {articles.slice(3 + idx * 2, 5 + idx * 2).map((a) => (
              <Link key={a.slug} href={`/article/${a.slug}`} className="bbc-sub-item" style={{ display: "block" }}>
                <h4 className="bbc-headline-xs">{a.title}</h4>
              </Link>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderMixed = () => {
    const mainArticle = articles[0];
    const rightArticles = articles.slice(1, 5);

    return (
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        <div className="bbc-col-section">
          <Link href={`/article/${mainArticle.slug}`} className="bbc-card">
            <div className="bbc-card-img" style={{ aspectRatio: "16/9" }}>
              <img src={mainArticle.imageUrl || "/placeholder.jpg"} alt={mainArticle.title} loading="lazy" />
            </div>
            <h3 className="bbc-headline-lg">{mainArticle.title}</h3>
            <p className="bbc-summary" style={{ fontSize: "14px" }}>{mainArticle.excerpt}</p>
            <span className="bbc-meta">{formatDate(mainArticle.publishedAt)}</span>
          </Link>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          {rightArticles.map((article) => (
            <Link key={article.slug} href={`/article/${article.slug}`} className="bbc-text-headline">
              <h3 className="bbc-headline-sm">{article.title}</h3>
              <span className="bbc-meta">{formatDate(article.publishedAt)}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id={`section-${category}`} className="bbc-section">
      <div className="container">
        <div className="bbc-section-header">
          <div className="bbc-section-title">
            <span style={{ color: catInfo.color }}>{catInfo.label}</span>
            <ChevronRight size={16} style={{ color: "#555" }} />
          </div>
          {showViewAll && (
            <Link
              href={`/category/${category}`}
              className="bbc-section-link"
              id={`viewall-${category}`}
            >
              More <ChevronRight size={13} />
            </Link>
          )}
        </div>

        {layoutType === "grid-4" && renderGrid4()}
        {layoutType === "grid-3" && renderGrid3()}
        {layoutType === "mixed" && renderMixed()}
      </div>
    </section>
  );
}
