"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Article } from "@/types";
import { formatDate } from "@/lib/config";

// Normally we'd hit an API, but since this is demo data, we will fetch the global demo articles
// For simplicity, we just fetch from a new api endpoint or mock it.
// Let's create a quick API fetcher to our local api, or just use a mock response.
export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch `/api/search?q=${query}`
    // Here we'll simulate a fetch delay and return dummy data that matches the query
    setLoading(true);
    setTimeout(() => {
      // Mock results
      const mockResults: Article[] = [
        {
          slug: `search-result-1`,
          title: `${query ? query.charAt(0).toUpperCase() + query.slice(1) : "New"} Policy Announced Amid Global Economic Shifts`,
          excerpt: `Recent developments regarding ${query || "global matters"} have sparked widespread discussion across major financial markets.`,
          content: "",
          category: "world",
          imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
          imageCredit: "",
          sourceUrl: "",
          sourceName: "Newsync Staff",
          author: "Admin",
          publishedAt: new Date().toISOString(),
          readingTime: 4,
          tags: [],
          seo: { title: "", description: "", keywords: [], ogImage: "" },
          relatedSlugs: []
        },
        {
          slug: `search-result-2`,
          title: `Experts Weigh In On The Future Of ${query || "Technology"}`,
          excerpt: `Leading analysts provide their insights on how the recent trends in ${query || "the tech sector"} will shape the upcoming decade.`,
          content: "",
          category: "technology",
          imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
          imageCredit: "",
          sourceUrl: "",
          sourceName: "Newsync Staff",
          author: "Admin",
          publishedAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
          readingTime: 3,
          tags: [],
          seo: { title: "", description: "", keywords: [], ogImage: "" },
          relatedSlugs: []
        },
        {
          slug: `search-result-3`,
          title: `Local Communities Rally Around ${query || "Environmental"} Initiatives`,
          excerpt: `Grassroots movements focusing on ${query || "community welfare"} are gaining unprecedented momentum in key urban centers.`,
          content: "",
          category: "science",
          imageUrl: "https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=800&q=80",
          imageCredit: "",
          sourceUrl: "",
          sourceName: "Newsync Staff",
          author: "Admin",
          publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          readingTime: 5,
          tags: [],
          seo: { title: "", description: "", keywords: [], ogImage: "" },
          relatedSlugs: []
        }
      ];
      setResults(mockResults);
      setLoading(false);
    }, 600);
  }, [query]);

  if (loading) {
    return <div className="bbc-summary">Loading results for "{query}"...</div>;
  }

  if (results.length === 0) {
    return <div className="bbc-summary">No results found for "{query}".</div>;
  }

  return (
    <div>
      <p className="bbc-summary" style={{ marginBottom: "24px" }}>
        Showing results for <strong>"{query}"</strong>
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {results.map((article) => (
          <div key={article.slug} style={{ display: "flex", gap: "20px", borderBottom: "1px solid var(--grey-200)", paddingBottom: "24px" }}>
            <div style={{ width: "240px", flexShrink: 0 }}>
              <Link href={`/article/${article.slug}`}>
                <div className="bbc-card-img" style={{ aspectRatio: "16/9", marginBottom: 0 }}>
                  <img src={article.imageUrl} alt={article.title} />
                </div>
              </Link>
            </div>
            <div style={{ flex: 1 }}>
              <span className="bbc-category-label" style={{ color: "var(--red)" }}>{article.category}</span>
              <Link href={`/article/${article.slug}`}>
                <h3 className="bbc-headline-md" style={{ marginBottom: "8px" }}>{article.title}</h3>
                <p className="bbc-summary" style={{ marginTop: 0 }}>{article.excerpt}</p>
              </Link>
              <div className="bbc-meta" style={{ marginTop: "12px" }}>
                {formatDate(article.publishedAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
