// ===========================================
// NEWSYNC - Type Definitions
// ===========================================

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  imageUrl: string;
  imageCredit: string;
  sourceUrl: string;
  sourceName: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  seo: SEOMetadata;
  relatedSlugs: string[];
}

export interface ArticleFrontmatter {
  title: string;
  excerpt: string;
  category: Category;
  imageUrl: string;
  imageCredit: string;
  sourceUrl: string;
  sourceName: string;
  author: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  relatedSlugs: string[];
}

export type Category =
  | "world"
  | "technology"
  | "business"
  | "sports"
  | "entertainment"
  | "health"
  | "science";

export interface CategoryInfo {
  id: Category;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
}

export interface BreakingNews {
  id: string;
  title: string;
  slug: string;
  timestamp: string;
}

export interface AnalyticsEvent {
  id?: string;
  page_path: string;
  page_title: string;
  event_type: "pageview" | "click" | "scroll";
  referrer: string;
  user_agent: string;
  country?: string;
  created_at?: string;
}

export interface DashboardStats {
  totalViews: number;
  todayViews: number;
  totalArticles: number;
  topArticles: TopArticle[];
  viewsByDay: DailyViews[];
  viewsByCategory: CategoryViews[];
}

export interface TopArticle {
  slug: string;
  title: string;
  views: number;
  category: Category;
}

export interface DailyViews {
  date: string;
  views: number;
}

export interface CategoryViews {
  category: Category;
  views: number;
}

export interface GNewsArticle {
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

export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}
