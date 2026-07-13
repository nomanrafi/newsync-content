"""
===========================================
NEWSYNC - Python Automation Script
===========================================
This script can be run locally or via GitHub Actions to:
1. Fetch latest news from GNews API
2. Rewrite articles using Google Gemini AI
3. Push markdown files to GitHub content repo

Usage:
    python scripts/fetch_news.py

Environment Variables Required:
    GNEWS_API_KEY
    GEMINI_API_KEY
    GITHUB_TOKEN
    GITHUB_OWNER (default: nomanrafi)
    GITHUB_REPO (default: newsync-content)
"""

import os
import re
import json
import time
import base64
import hashlib
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from urllib.parse import quote

# ===========================================
# Configuration (Load from .env.local)
# ===========================================
import os

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

GNEWS_API_KEY = os.environ.get("GNEWS_API_KEY", "")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_OWNER = os.environ.get("GITHUB_OWNER", "nomanrafi")
GITHUB_REPO = os.environ.get("GITHUB_REPO", "newsync-content")
GITHUB_BRANCH = os.environ.get("GITHUB_BRANCH", "main")

GNEWS_CATEGORIES = ["general", "world", "business", "technology", "entertainment", "sports", "science", "health"]

CATEGORY_MAP = {
    "general": "world",
    "world": "world",
    "business": "business",
    "technology": "technology",
    "entertainment": "entertainment",
    "sports": "sports",
    "science": "science",
    "health": "health",
}

# ===========================================
# Utility Functions
# ===========================================

def make_request(url, method="GET", data=None, headers=None):
    """Make an HTTP request and return the response."""
    if headers is None:
        headers = {}
    
    req = Request(url, method=method, headers=headers)
    
    if data:
        req.data = json.dumps(data).encode("utf-8")
        if "Content-Type" not in headers:
            req.add_header("Content-Type", "application/json")
    
    try:
        with urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as e:
        print(f"  [ERROR] HTTP {e.code}: {e.reason}")
        try:
            error_body = e.read().decode("utf-8")
            print(f"  [ERROR] Response: {error_body[:300]}")
        except:
            pass
        return None
    except URLError as e:
        print(f"  [ERROR] URL Error: {e.reason}")
        return None
    except Exception as e:
        print(f"  [ERROR] Request failed: {e}")
        return None


def generate_slug(title):
    """Generate a URL-safe slug from a title."""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug[:80]


def detect_category(title, description):
    """Detect the article category based on keywords."""
    text = f"{title} {description}".lower()
    
    category_keywords = {
        "technology": [
            "ai", "tech", "software", "app", "google", "apple", "microsoft",
            "startup", "cyber", "robot", "chip", "quantum", "digital", "computer",
            "smartphone", "gadget", "innovation", "openai", "meta", "tesla",
        ],
        "sports": [
            "football", "soccer", "nba", "nfl", "cricket", "tennis", "olympic",
            "championship", "league", "tournament", "match", "player", "coach",
            "team", "score", "stadium", "athlete", "medal", "fifa",
        ],
        "business": [
            "market", "stock", "economy", "bank", "finance", "trade", "invest",
            "revenue", "profit", "company", "corporate", "ceo", "billion",
            "deal", "merger", "crypto", "bitcoin", "inflation",
        ],
        "entertainment": [
            "movie", "film", "music", "celebrity", "hollywood", "netflix",
            "actor", "singer", "concert", "album", "award", "grammy", "oscar",
            "disney", "series", "show", "streaming",
        ],
        "health": [
            "health", "medical", "vaccine", "hospital", "disease", "cancer",
            "drug", "treatment", "patient", "doctor", "surgery", "mental",
            "fitness", "wellness", "pandemic", "virus",
        ],
        "science": [
            "space", "nasa", "planet", "research", "study", "scientist",
            "discovery", "climate", "environment", "ocean", "species",
            "evolution", "physics", "biology", "genome",
        ],
    }
    
    best_category = "world"
    best_score = 0
    
    for category, keywords in category_keywords.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > best_score:
            best_score = score
            best_category = category
    
    return best_category


# ===========================================
# GNews API
# ===========================================

def fetch_gnews(category=None, max_articles=5):
    """Fetch articles from GNews API."""
    if not GNEWS_API_KEY:
        print("  [WARN] GNEWS_API_KEY not set. Skipping.")
        return []
    
    if category:
        url = f"https://gnews.io/api/v4/top-headlines?category={category}&lang=en&max={max_articles}&apikey={GNEWS_API_KEY}"
    else:
        url = f"https://gnews.io/api/v4/top-headlines?lang=en&max={max_articles}&apikey={GNEWS_API_KEY}"
    
    data = make_request(url)
    if data and "articles" in data:
        return data["articles"]
    return []


# ===========================================
# Gemini AI Rewriter
# ===========================================

def rewrite_with_gemini(title, content, category):
    """Rewrite an article using Google Gemini API."""
    if not GEMINI_API_KEY:
        print("  [WARN] GEMINI_API_KEY not set. Using original content.")
        return {
            "rewrittenTitle": title,
            "rewrittenContent": f"<p>{content}</p>",
            "excerpt": content[:200],
            "seoTitle": title[:60],
            "seoDescription": content[:155],
            "tags": [category, "news", "latest"],
        }
    
    prompt = f"""You are a senior news editor at a premium international news publication. Your task is to completely rewrite the following news article in a way that:

1. REWRITE the title to be more engaging, click-worthy, and SEO-optimized (keep it under 80 characters)
2. REWRITE the entire content as a 300-500 word article in a professional, human journalistic tone
3. Write in clean, sophisticated English (not robotic or AI-sounding)
4. Use varied sentence structures, transition words, and a natural flow
5. Include relevant context and analysis (as a real journalist would)
6. Format the content as HTML with <p>, <h2>, <h3>, <blockquote> tags where appropriate
7. Add 2-3 internal linking suggestions (use format: <a href="/category/{category}">relevant anchor text</a>)
8. Generate an SEO-optimized title (under 60 characters)
9. Generate a compelling meta description (under 155 characters)
10. Generate 5-8 relevant tags/keywords

ORIGINAL TITLE: {title}
ORIGINAL CONTENT: {content}
CATEGORY: {category}

RESPOND IN THIS EXACT JSON FORMAT ONLY (no markdown, no extra text):
{{
  "rewrittenTitle": "...",
  "rewrittenContent": "<p>...</p>",
  "excerpt": "A 1-2 sentence summary...",
  "seoTitle": "...",
  "seoDescription": "...",
  "tags": ["tag1", "tag2", "tag3"]
}}"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.8,
            "maxOutputTokens": 2048,
        },
    }
    
    data = make_request(url, method="POST", data=payload)
    
    if not data:
        return None
    
    try:
        response_text = data["candidates"][0]["content"]["parts"][0]["text"]
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        print(f"  [ERROR] Failed to parse Gemini response: {e}")
    
    return None


# ===========================================
# GitHub Publisher
# ===========================================

def file_exists_on_github(file_path):
    """Check if a file already exists in the GitHub repo."""
    url = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/{quote(file_path)}?ref={GITHUB_BRANCH}"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
    }
    data = make_request(url, headers=headers)
    return data is not None


def push_to_github(slug, category, frontmatter, content):
    """Push an article as a Markdown file to GitHub."""
    if not GITHUB_TOKEN:
        print("  [WARN] GITHUB_TOKEN not set. Skipping GitHub push.")
        return False
    
    file_path = f"articles/{category}/{slug}.md"
    
    # Check if already exists
    if file_exists_on_github(file_path):
        print(f"  [SKIP] File already exists: {file_path}")
        return False
    
    # Build markdown
    tags_yaml = "\n".join(f'  - "{t}"' for t in frontmatter.get("tags", []))
    keywords_yaml = "\n".join(f'  - "{k}"' for k in frontmatter.get("tags", []))
    
    title_escaped = frontmatter.get("title", "").replace('"', '\\"')
    excerpt_escaped = frontmatter.get("excerpt", "").replace('"', '\\"')
    seo_title_escaped = frontmatter.get("seoTitle", "").replace('"', '\\"')
    seo_desc_escaped = frontmatter.get("seoDescription", "").replace('"', '\\"')
    
    markdown = f"""---
title: "{title_escaped}"
excerpt: "{excerpt_escaped}"
category: "{category}"
imageUrl: "{frontmatter.get('imageUrl', '')}"
imageCredit: "{frontmatter.get('imageCredit', '')}"
sourceUrl: "{frontmatter.get('sourceUrl', '')}"
sourceName: "{frontmatter.get('sourceName', '')}"
author: "Newsync"
publishedAt: "{frontmatter.get('publishedAt', datetime.utcnow().isoformat() + 'Z')}"
readingTime: {frontmatter.get('readingTime', 4)}
seoTitle: "{seo_title_escaped}"
seoDescription: "{seo_desc_escaped}"
tags:
{tags_yaml}
seoKeywords:
{keywords_yaml}
relatedSlugs: []
---

{content}"""
    
    encoded = base64.b64encode(markdown.encode("utf-8")).decode("utf-8")
    
    url = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/contents/{quote(file_path)}"
    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
    }
    payload = {
        "message": f"[auto] Add article: {slug}",
        "content": encoded,
        "branch": GITHUB_BRANCH,
    }
    
    result = make_request(url, method="PUT", data=payload, headers=headers)
    
    if result and "content" in result:
        print(f"  [OK] Published: {file_path}")
        return True
    else:
        print(f"  [FAIL] Could not publish: {file_path}")
        return False


# ===========================================
# Main Pipeline
# ===========================================

def run_pipeline():
    """Run the complete news automation pipeline."""
    print("=" * 60)
    print(f"NEWSYNC - Automated News Pipeline")
    print(f"Started at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 60)
    
    total_processed = 0
    total_fetched = 0
    
    # Fetch general top headlines
    print("\n[1/3] Fetching latest news from GNews API...")
    articles = fetch_gnews(max_articles=10)
    total_fetched += len(articles)
    print(f"  Found {len(articles)} articles.")
    
    for i, article in enumerate(articles):
        title = article.get("title", "")
        description = article.get("description", "")
        content = article.get("content", description)
        image_url = article.get("image", "")
        source_name = article.get("source", {}).get("name", "")
        source_url = article.get("url", "")
        published_at = article.get("publishedAt", datetime.utcnow().isoformat() + "Z")
        
        print(f"\n--- Article {i+1}/{len(articles)} ---")
        print(f"  Original: {title[:70]}...")
        
        # Detect category
        category = detect_category(title, description)
        print(f"  Category: {category}")
        
        # Generate slug
        slug = generate_slug(title)
        
        # Rewrite with Gemini
        print("  [2/3] Rewriting with Gemini AI...")
        rewritten = rewrite_with_gemini(title, content, category)
        
        if not rewritten:
            print("  [SKIP] Gemini rewrite failed. Skipping.")
            continue
        
        print(f"  New Title: {rewritten.get('rewrittenTitle', 'N/A')[:70]}...")
        
        # Calculate reading time
        word_count = len(re.sub(r'<[^>]*>', '', rewritten.get("rewrittenContent", "")).split())
        reading_time = max(2, word_count // 200)
        
        # Push to GitHub
        print("  [3/3] Publishing to GitHub...")
        success = push_to_github(
            slug=slug,
            category=category,
            frontmatter={
                "title": rewritten.get("rewrittenTitle", title),
                "excerpt": rewritten.get("excerpt", description[:200]),
                "imageUrl": image_url,
                "imageCredit": source_name,
                "sourceUrl": source_url,
                "sourceName": source_name,
                "publishedAt": published_at,
                "readingTime": reading_time,
                "seoTitle": rewritten.get("seoTitle", title[:60]),
                "seoDescription": rewritten.get("seoDescription", description[:155]),
                "tags": rewritten.get("tags", [category, "news"]),
            },
            content=rewritten.get("rewrittenContent", f"<p>{content}</p>"),
        )
        
        if success:
            total_processed += 1
        
        # Rate limiting delay
        time.sleep(2)
    
    print("\n" + "=" * 60)
    print(f"Pipeline Complete!")
    print(f"  Fetched: {total_fetched} articles")
    print(f"  Published: {total_processed} articles")
    print(f"  Finished at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()
