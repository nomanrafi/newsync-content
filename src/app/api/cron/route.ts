// ===========================================
// NEWSYNC - Cron API Route
// Automated News Pipeline:
// 1. Fetch news from GNews API
// 2. Rewrite with Gemini AI
// 3. Push to GitHub as Markdown
// ===========================================

import { NextRequest, NextResponse } from "next/server";

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "nomanrafi";
const GITHUB_REPO = process.env.GITHUB_REPO || "newsync-content";

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

// Map GNews categories to our categories
function detectCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    technology: [
      "ai", "tech", "software", "app", "google", "apple", "microsoft",
      "startup", "cyber", "robot", "chip", "quantum", "digital", "computer",
      "smartphone", "gadget", "innovation", "silicon", "data", "cloud",
      "programming", "algorithm", "neural", "openai", "meta", "tesla",
    ],
    sports: [
      "football", "soccer", "nba", "nfl", "cricket", "tennis", "olympic",
      "championship", "league", "tournament", "match", "game", "player",
      "coach", "team", "score", "stadium", "athlete", "medal", "fifa",
    ],
    business: [
      "market", "stock", "economy", "bank", "finance", "trade", "invest",
      "revenue", "profit", "company", "corporate", "ceo", "billion",
      "million", "deal", "merger", "acquisition", "ipo", "crypto",
      "bitcoin", "inflation", "gdp", "federal reserve",
    ],
    entertainment: [
      "movie", "film", "music", "celebrity", "hollywood", "netflix",
      "actor", "singer", "concert", "album", "award", "grammy", "oscar",
      "disney", "series", "show", "streaming", "premiere", "box office",
    ],
    health: [
      "health", "medical", "vaccine", "hospital", "disease", "cancer",
      "drug", "treatment", "patient", "doctor", "surgery", "mental",
      "fitness", "wellness", "pandemic", "virus", "clinical", "therapy",
    ],
    science: [
      "space", "nasa", "planet", "research", "study", "scientist",
      "discovery", "climate", "environment", "ocean", "species",
      "evolution", "physics", "biology", "chemistry", "genome", "fossil",
    ],
  };

  let bestCategory = "world";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const score = keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  return bestCategory;
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

// Rewrite article using Gemini API
async function rewriteWithGemini(
  title: string,
  content: string,
  category: string
): Promise<{
  rewrittenTitle: string;
  rewrittenContent: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
} | null> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    // Return original content if no API key
    return {
      rewrittenTitle: title,
      rewrittenContent: `<p>${content}</p>`,
      excerpt: content.substring(0, 200),
      seoTitle: title,
      seoDescription: content.substring(0, 155),
      tags: [category],
    };
  }

  try {
    const prompt = `You are a senior news editor at a premium international news publication. Your task is to completely rewrite the following news article in a way that:

1. REWRITE the title to be more engaging, click-worthy, and SEO-optimized (keep it under 80 characters)
2. REWRITE the entire content as a 300-500 word article in a professional, human journalistic tone
3. Write in clean, sophisticated English (not robotic or AI-sounding)
4. Use varied sentence structures, transition words, and a natural flow
5. Include relevant context and analysis (as a real journalist would)
6. Format the content as HTML with <p>, <h2>, <h3>, <blockquote> tags where appropriate
7. Add 2-3 internal linking suggestions in the text (use placeholder format: <a href="/category/${category}">relevant anchor text</a>)
8. Generate an SEO-optimized title (under 60 characters)
9. Generate a compelling meta description (under 155 characters)
10. Generate 5-8 relevant tags/keywords

ORIGINAL TITLE: ${title}
ORIGINAL CONTENT: ${content}
CATEGORY: ${category}

RESPOND IN THIS EXACT JSON FORMAT ONLY (no markdown, no extra text):
{
  "rewrittenTitle": "...",
  "rewrittenContent": "<p>...</p>",
  "excerpt": "A 1-2 sentence summary...",
  "seoTitle": "...",
  "seoDescription": "...",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!res.ok) {
      console.error("Gemini API error:", res.status);
      return null;
    }

    const data = await res.json();
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error("Gemini rewrite error:", error);
    return null;
  }
}

// Push article to GitHub as Markdown file
async function pushToGitHub(
  slug: string,
  category: string,
  frontmatter: Record<string, unknown>,
  content: string
): Promise<boolean> {
  try {
    const filePath = `articles/${category}/${slug}.md`;

    // Build markdown with frontmatter
    const markdown = `---
title: "${(frontmatter.title as string || '').replace(/"/g, '\\"')}"
excerpt: "${(frontmatter.excerpt as string || '').replace(/"/g, '\\"')}"
category: "${category}"
imageUrl: "${frontmatter.imageUrl || ''}"
imageCredit: "${frontmatter.imageCredit || ''}"
sourceUrl: "${frontmatter.sourceUrl || ''}"
sourceName: "${frontmatter.sourceName || ''}"
author: "Newsync"
publishedAt: "${frontmatter.publishedAt || new Date().toISOString()}"
readingTime: ${frontmatter.readingTime || 4}
seoTitle: "${(frontmatter.seoTitle as string || '').replace(/"/g, '\\"')}"
seoDescription: "${(frontmatter.seoDescription as string || '').replace(/"/g, '\\"')}"
tags:
${(frontmatter.tags as string[] || []).map((t: string) => `  - "${t}"`).join("\n")}
seoKeywords:
${(frontmatter.seoKeywords as string[] || []).map((k: string) => `  - "${k}"`).join("\n")}
relatedSlugs: []
---

${content}`;

    // Base64 encode the content
    const encodedContent = Buffer.from(markdown).toString("base64");

    // Check if file already exists
    const checkRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (checkRes.ok) {
      // File already exists, skip
      return false;
    }

    // Create the file
    const createRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `[auto] Add article: ${slug}`,
          content: encodedContent,
          branch: "main",
        }),
      }
    );

    return createRes.ok;
  } catch (error) {
    console.error("GitHub push error:", error);
    return false;
  }
}

// Fetch news from GNews API
async function fetchGNews(category?: string): Promise<GNewsArticle[]> {
  try {
    const url = category
      ? `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=5&apikey=${GNEWS_API_KEY}`
      : `https://gnews.io/api/v4/top-headlines?lang=en&max=10&apikey=${GNEWS_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error("GNews API error:", res.status);
      return [];
    }

    const data = await res.json();
    return data.articles || [];
  } catch (error) {
    console.error("GNews fetch error:", error);
    return [];
  }
}

// Main cron handler
export async function GET(request: NextRequest) {
  // Verify cron secret for Vercel Cron Jobs
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runPipeline();
}

export async function POST() {
  return runPipeline();
}

async function runPipeline() {
  try {
    // Fetch latest news
    const articles = await fetchGNews();

    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "No new articles found.",
      });
    }

    let processed = 0;

    for (const article of articles) {
      // Detect category
      const category = detectCategory(article.title, article.description);

      // Generate slug
      const slug = generateSlug(article.title);

      // Rewrite with Gemini
      const rewritten = await rewriteWithGemini(
        article.title,
        article.content || article.description,
        category
      );

      if (!rewritten) continue;

      // Calculate reading time (~200 words per minute)
      const wordCount = rewritten.rewrittenContent
        .replace(/<[^>]*>/g, "")
        .split(/\s+/).length;
      const readingTime = Math.max(2, Math.ceil(wordCount / 200));

      // Push to GitHub
      const success = await pushToGitHub(slug, category, {
        title: rewritten.rewrittenTitle,
        excerpt: rewritten.excerpt,
        imageUrl: article.image || "",
        imageCredit: article.source.name,
        sourceUrl: article.url,
        sourceName: article.source.name,
        publishedAt: article.publishedAt,
        readingTime,
        seoTitle: rewritten.seoTitle,
        seoDescription: rewritten.seoDescription,
        tags: rewritten.tags,
        seoKeywords: rewritten.tags,
      }, rewritten.rewrittenContent);

      if (success) processed++;

      // Small delay to avoid rate limits
      await new Promise((r) => setTimeout(r, 1500));
    }

    return NextResponse.json({
      success: true,
      count: processed,
      total: articles.length,
      message: `Processed ${processed} out of ${articles.length} articles.`,
    });
  } catch (error) {
    console.error("Pipeline error:", error);
    return NextResponse.json(
      { success: false, error: "Pipeline execution failed." },
      { status: 500 }
    );
  }
}
