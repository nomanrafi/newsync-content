import { NextResponse } from "next/server";
import { getArticles } from "@/lib/articles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase() || "";
  
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const articles = await getArticles();
  const results = articles.filter((a) => 
    a.title.toLowerCase().includes(query) || 
    (a.excerpt && a.excerpt.toLowerCase().includes(query)) ||
    (a.content && a.content.toLowerCase().includes(query)) ||
    a.tags.some(t => t.toLowerCase().includes(query))
  );

  return NextResponse.json({ results });
}
