// ===========================================
// NEWSYNC - Article Service
// Fetches articles from GitHub content repo
// ===========================================

import { Article, ArticleFrontmatter, Category } from "@/types";

const GITHUB_OWNER = process.env.GITHUB_OWNER || "nomanrafi";
const GITHUB_REPO = process.env.GITHUB_REPO || "newsync-content";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

const GITHUB_API = "https://api.github.com";
const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  download_url: string;
}

// Parse frontmatter from markdown content
function parseFrontmatter(content: string): {
  data: ArticleFrontmatter;
  content: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {
      data: {} as ArticleFrontmatter,
      content: content,
    };
  }

  const frontmatterStr = match[1];
  const articleContent = match[2].trim();

  // Simple YAML parser for our known frontmatter fields
  const data: Record<string, unknown> = {};
  const lines = frontmatterStr.split("\n");
  let currentKey = "";

  for (const line of lines) {
    const keyValueMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyValueMatch) {
      currentKey = keyValueMatch[1];
      let value: unknown = keyValueMatch[2].trim();

      // Handle arrays (simple format)
      if (value === "") {
        data[currentKey] = [];
        continue;
      }

      // Remove surrounding quotes
      if (
        typeof value === "string" &&
        value.startsWith('"') &&
        value.endsWith('"')
      ) {
        value = value.slice(1, -1);
      }
      if (
        typeof value === "string" &&
        value.startsWith("'") &&
        value.endsWith("'")
      ) {
        value = value.slice(1, -1);
      }

      // Handle inline arrays like [tag1, tag2]
      if (
        typeof value === "string" &&
        value.startsWith("[") &&
        value.endsWith("]")
      ) {
        value = value
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""));
      }

      // Handle numbers
      if (typeof value === "string" && /^\d+$/.test(value)) {
        value = parseInt(value, 10);
      }

      data[currentKey] = value;
    } else if (line.match(/^\s*-\s+(.*)$/)) {
      // Handle YAML list items
      const itemMatch = line.match(/^\s*-\s+(.*)$/);
      if (itemMatch && currentKey) {
        if (!Array.isArray(data[currentKey])) {
          data[currentKey] = [];
        }
        (data[currentKey] as string[]).push(
          itemMatch[1].replace(/^["']|["']$/g, "")
        );
      }
    }
  }

  return {
    data: data as unknown as ArticleFrontmatter,
    content: articleContent,
  };
}

// Fetch list of article files from GitHub
async function fetchArticleList(
  category?: Category
): Promise<GitHubFile[]> {
  const path = category ? `articles/${category}` : "articles";

  try {
    // Try to fetch from specific category folder
    if (category) {
      const res = await fetch(
        `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
        {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (!res.ok) return [];
      const files: GitHubFile[] = await res.json();
      return files.filter((f) => f.name.endsWith(".md"));
    }

    // Fetch all categories
    const categoriesRes = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/articles?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!categoriesRes.ok) return [];
    const categoryFolders: GitHubFile[] = await categoriesRes.json();

    const allFiles: GitHubFile[] = [];
    for (const folder of categoryFolders) {
      if (folder.type === "dir") {
        const folderRes = await fetch(
          `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${folder.path}?ref=${GITHUB_BRANCH}`,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
            },
            next: { revalidate: 300 },
          }
        );

        if (folderRes.ok) {
          const files: GitHubFile[] = await folderRes.json();
          allFiles.push(...files.filter((f) => f.name.endsWith(".md")));
        }
      }
    }

    return allFiles;
  } catch (error) {
    console.error("Error fetching article list:", error);
    return [];
  }
}

// Fetch a single article's content
async function fetchArticleContent(filePath: string): Promise<string | null> {
  try {
    const url = `${RAW_BASE}/${filePath}`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// Get all articles, optionally filtered by category
export async function getArticles(
  category?: Category,
  limit?: number
): Promise<Article[]> {
  const files = await fetchArticleList(category);

  const articles: Article[] = [];
  for (const file of files) {
    const content = await fetchArticleContent(file.path);
    if (!content) continue;

    const { data, content: articleContent } = parseFrontmatter(content);
    const slug = file.name.replace(".md", "");

    articles.push({
      slug,
      title: data.title || "Untitled",
      excerpt: data.excerpt || "",
      content: articleContent,
      category: data.category || "world",
      imageUrl: data.imageUrl || "",
      imageCredit: data.imageCredit || "",
      sourceUrl: data.sourceUrl || "",
      sourceName: data.sourceName || "",
      author: data.author || "Newsync",
      publishedAt: data.publishedAt || new Date().toISOString(),
      readingTime: data.readingTime || 3,
      tags: data.tags || [],
      seo: {
        title: data.seoTitle || data.title || "",
        description: data.seoDescription || data.excerpt || "",
        keywords: data.seoKeywords || data.tags || [],
        ogImage: data.imageUrl || "",
      },
      relatedSlugs: data.relatedSlugs || [],
    });
  }

  // Sort by date (newest first)
  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (limit) {
    return articles.slice(0, limit);
  }

  return articles;
}

// Get a single article by slug
export async function getArticleBySlug(
  slug: string
): Promise<Article | null> {
  const allArticles = await getArticles();
  return allArticles.find((a) => a.slug === slug) || null;
}

// Get breaking news (latest 10 articles)
export async function getBreakingNews() {
  const articles = await getArticles(undefined, 10);
  return articles.map((a) => ({
    id: a.slug,
    title: a.title,
    slug: a.slug,
    timestamp: a.publishedAt,
  }));
}

// Get related articles based on category and tags
export async function getRelatedArticles(
  article: Article,
  limit: number = 4
): Promise<Article[]> {
  const allArticles = await getArticles();

  // Filter out the current article, then score by relevance
  const scored = allArticles
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      let score = 0;
      if (a.category === article.category) score += 5;
      const sharedTags = a.tags.filter((t) => article.tags.includes(t));
      score += sharedTags.length * 2;
      return { article: a, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.article);
}
