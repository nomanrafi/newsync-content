import { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/articles";
import { getCategoryInfo, categoryList, siteConfig } from "@/lib/config";
import { Category } from "@/types";
import NewsCard from "@/components/NewsCard";
import { ChevronLeft } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const catInfo = getCategoryInfo(category as Category);

  return {
    title: `${catInfo.label} News — Latest ${catInfo.label} Headlines`,
    description: catInfo.description,
    openGraph: {
      title: `${catInfo.label} News | ${siteConfig.name}`,
      description: catInfo.description,
      url: `${siteConfig.url}/category/${category}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const catInfo = getCategoryInfo(category as Category);

  // Fetch articles for this category
  let articles = await getArticles(category as Category);

  // Fallback to demo data if empty
  if (articles.length === 0) {
    const allArticles = await getArticles();
    articles = allArticles.filter((a) => a.category === category);
  }

  return (
    <div className="container-main py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
        <Link
          href="/"
          className="hover:text-[var(--color-accent-secondary)] transition-colors flex items-center gap-1"
        >
          <ChevronLeft size={14} />
          Home
        </Link>
        <span>/</span>
        <span style={{ color: catInfo.color }}>{catInfo.label}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{catInfo.icon}</span>
          <h1
            className="text-3xl md:text-4xl font-extrabold font-[var(--font-display)]"
            style={{ color: catInfo.color }}
          >
            {catInfo.label}
          </h1>
        </div>
        <p className="text-[var(--color-text-tertiary)] max-w-2xl">
          {catInfo.description}
        </p>
        <div className="mt-4 text-sm text-[var(--color-text-muted)]">
          {articles.length} article{articles.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-nav mb-8">
        <Link href="/" className="category-pill">
          All News
        </Link>
        {categoryList.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className={`category-pill ${
              cat.id === category ? "active" : ""
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Articles Grid */}
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">📭</p>
          <h2 className="text-xl font-bold mb-2">No articles yet</h2>
          <p className="text-[var(--color-text-tertiary)]">
            Articles for this category will appear here once published.
          </p>
        </div>
      )}
    </div>
  );
}
