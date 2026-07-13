// ===========================================
// NEWSYNC - Site Configuration
// ===========================================

import { CategoryInfo, Category } from "@/types";

export const siteConfig = {
  name: "Newsync",
  tagline: "Where News Meets Intelligence",
  description:
    "Newsync delivers the latest global news, intelligently curated and beautifully presented. Stay informed with real-time coverage across technology, business, sports, health, and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://newsync.vercel.app",
  locale: "en_US",
  twitter: "@newsync",
};

export const categories: Record<Category, CategoryInfo> = {
  world: {
    id: "world",
    label: "World",
    icon: "",
    color: "#06b6d4",
    bgColor: "rgba(6, 182, 212, 0.12)",
    description: "Global affairs, international politics, and breaking world events.",
  },
  technology: {
    id: "technology",
    label: "Technology",
    icon: "",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.12)",
    description: "Latest in tech, AI, startups, gadgets, and digital innovation.",
  },
  business: {
    id: "business",
    label: "Business",
    icon: "",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.12)",
    description: "Markets, economy, finance, and corporate developments.",
  },
  sports: {
    id: "sports",
    label: "Sports",
    icon: "",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.12)",
    description: "Football, cricket, basketball, and all major sporting events.",
  },
  entertainment: {
    id: "entertainment",
    label: "Entertainment",
    icon: "",
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.12)",
    description: "Movies, music, celebrities, and pop culture.",
  },
  health: {
    id: "health",
    label: "Health",
    icon: "",
    color: "#14b8a6",
    bgColor: "rgba(20, 184, 166, 0.12)",
    description: "Medical breakthroughs, wellness, and public health news.",
  },
  science: {
    id: "science",
    label: "Science",
    icon: "",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.12)",
    description: "Space, environment, research, and scientific discoveries.",
  },
};

export const categoryList = Object.values(categories);

export function getCategoryInfo(cat: Category): CategoryInfo {
  return categories[cat] || categories.world;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}
