import { getArticles, getBreakingNews } from "@/lib/articles";
import { Category, Article } from "@/types";
import { categoryList } from "@/lib/config";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import LeaderboardAd from "@/components/ads/LeaderboardAd";
import NativeAd from "@/components/ads/NativeAd";
import Link from "next/link";



export default async function HomePage() {
  let articles = await getArticles();

  const breakingNews = articles.slice(0, 8).map((a) => ({
    id: a.slug,
    title: a.title,
    slug: a.slug,
    timestamp: a.publishedAt,
  }));

  // BBC layout: featured = index 0 (center), left = [1,2], right = [3..7]
  const featured = articles[0];
  const secondaryLeft = articles.slice(1, 3);
  const textHeadlines = articles.slice(3, 8);

  // Group articles by category
  const articlesByCategory: Record<string, typeof articles> = {};
  for (const article of articles) {
    if (!articlesByCategory[article.category]) {
      articlesByCategory[article.category] = [];
    }
    articlesByCategory[article.category].push(article);
  }

  return (
    <>
      {/* Breaking News Ticker */}
      <BreakingNewsTicker items={breakingNews} />

      {/* Top Leaderboard Ad */}
      <div className="container mt-2">
        <LeaderboardAd />
      </div>

      {/* Hero Section - BBC 3-column layout */}
      {featured && (
        <HeroSection
          featured={featured}
          secondaryLeft={secondaryLeft}
          textHeadlines={textHeadlines}
        />
      )}



      {/* Category Sections */}
      {categoryList.map((cat, index) => {
        const catArticles = articlesByCategory[cat.id];
        if (!catArticles || catArticles.length === 0) return null;

        let layoutType: "grid-4" | "grid-3" | "mixed" = "grid-4";
        if (index % 3 === 1) layoutType = "mixed";
        else if (index % 3 === 2) layoutType = "grid-3";

        return (
          <div key={cat.id}>
            <CategorySection
              category={cat.id as Category}
              articles={catArticles}
              layoutType={layoutType}
            />
            {/* Insert Native Ad after the first category */}
            {index === 0 && (
              <div className="container border-b border-[var(--grey-200)] pb-6 mb-6">
                <span className="text-xs font-bold text-[var(--grey-500)] uppercase tracking-widest mb-2 block">Sponsored Content</span>
                <NativeAd />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

