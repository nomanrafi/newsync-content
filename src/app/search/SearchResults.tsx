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
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setResults([]);
        setLoading(false);
      });
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
