import { getArticles, getBreakingNews } from "@/lib/articles";
import { Category } from "@/types";
import { categoryList } from "@/lib/config";
import BreakingNewsTicker from "@/components/BreakingNewsTicker";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import Link from "next/link";

// Demo articles for initial setup (before GitHub content repo is populated)
function getDemoArticles() {
  const now = new Date().toISOString();
  const categories: Category[] = [
    "world",
    "technology",
    "business",
    "sports",
    "entertainment",
    "health",
    "science",
  ];

  const demoData: Record<
    Category,
    { title: string; excerpt: string; image: string }[]
  > = {
    world: [
      {
        title: "G20 Leaders Reach Historic Agreement on Global Climate Fund",
        excerpt:
          "World leaders gathered at the G20 summit have finalized a landmark agreement establishing a $100 billion climate resilience fund, marking the largest multilateral climate commitment to date.",
        image:
          "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
      },
      {
        title: "United Nations Launches Ambitious Plan to End Global Water Crisis",
        excerpt:
          "The UN General Assembly has unveiled a comprehensive strategy aimed at providing clean water access to 2 billion people by 2030.",
        image:
          "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
      },
      {
        title: "European Union Expands Digital Sovereignty Initiative Across Member States",
        excerpt:
          "The EU Commission has approved a sweeping digital autonomy package aimed at reducing dependence on foreign technology platforms.",
        image:
          "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&q=80",
      },
      {
        title: "Diplomatic Breakthrough: Middle East Peace Talks Enter New Phase",
        excerpt:
          "After months of negotiations, key stakeholders in the Middle East peace process have agreed to a new framework for bilateral discussions.",
        image:
          "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80",
      },
      {
        title: "African Union Summit Agrees on Continental Free Trade Framework",
        excerpt:
          "Leaders from 55 African nations have endorsed a comprehensive trade framework that aims to boost intra-continental commerce by 40% over the next decade.",
        image:
          "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
      },
      {
        title: "NATO Expands Eastern European Defense Partnerships",
        excerpt:
          "The alliance has formally extended its defense cooperation agreements with six new Eastern European partners in a landmark expansion of collective security.",
        image:
          "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
      },
      {
        title: "South Asian Leaders Sign Historic Water-Sharing Treaty",
        excerpt:
          "After decades of tension, five South Asian nations have reached a landmark accord governing the shared use of major transboundary river systems.",
        image:
          "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80",
      },
      {
        title: "Arctic Council Agrees on New Environmental Protection Measures",
        excerpt:
          "The eight Arctic nations have jointly committed to a new framework that restricts industrial development in key ecological zones across the Arctic circle.",
        image:
          "https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=800&q=80",
      },
    ],
    technology: [
      {
        title: "OpenAI Unveils GPT-6 With Unprecedented Reasoning Capabilities",
        excerpt:
          "The latest generation of artificial intelligence demonstrates near-human reasoning abilities across complex mathematical and scientific domains.",
        image:
          "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      },
      {
        title: "Quantum Computing Milestone: 10,000-Qubit Processor Achieved",
        excerpt:
          "A breakthrough in quantum computing brings us closer to solving problems that would take classical computers millions of years.",
        image:
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
      },
      {
        title: "Apple Announces Revolutionary AR Glasses at WWDC 2026",
        excerpt:
          "Apple's latest innovation promises to merge digital and physical worlds with lightweight, all-day-wearable augmented reality glasses.",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
      },
      {
        title: "SpaceX Launches First Commercial Moon Landing Mission",
        excerpt:
          "SpaceX has successfully launched the first fully commercial lunar landing mission, carrying scientific payloads from five different international research institutions.",
        image:
          "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&q=80",
      },
      {
        title: "Tesla Unveils Next-Generation Autonomous Driving Platform",
        excerpt:
          "Tesla's new Full Self-Driving system achieves Level 5 autonomy certification in three major markets following extensive regulatory review.",
        image:
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      },
    ],
    business: [
      {
        title: "Global Stock Markets Reach Record Highs on AI Investment Surge",
        excerpt:
          "Major exchanges worldwide have surpassed all-time highs as investor confidence in artificial intelligence infrastructure spending reaches new levels.",
        image:
          "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
      },
      {
        title: "Amazon Expands Drone Delivery to 50 New Cities Globally",
        excerpt:
          "Amazon Prime Air is set to transform last-mile logistics in 50 new metropolitan areas, promising 30-minute delivery windows for eligible products.",
        image:
          "https://images.unsplash.com/photo-1569748130764-3fed0c102c59?w=800&q=80",
      },
      {
        title: "Federal Reserve Signals Rate Cuts as Inflation Stabilizes Below 2%",
        excerpt:
          "Fed Chair signals a gradual loosening of monetary policy following confirmation that inflation has returned to its 2% target range for three consecutive quarters.",
        image:
          "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
      },
      {
        title: "Merger of Two Largest Pharmaceutical Companies Creates New Giant",
        excerpt:
          "A $180 billion merger between two pharmaceutical giants has created the world's largest drug maker, promising accelerated R&D and new distribution networks.",
        image:
          "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&q=80",
      },
    ],
    sports: [
      {
        title: "Bangladesh Cricket Team Clinches Historic Test Victory in England",
        excerpt:
          "In a stunning reversal, Bangladesh overcame a 200-run first innings deficit to record a famous Test win at Lord's Cricket Ground.",
        image:
          "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
      },
      {
        title: "FIFA World Cup 2026 Host Cities Confirmed for North American Tournament",
        excerpt:
          "FIFA has confirmed all 16 host venues across the United States, Canada, and Mexico for the most expansive World Cup in the tournament's history.",
        image:
          "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
      },
      {
        title: "Novak Djokovic Claims Record 25th Grand Slam Title at Wimbledon",
        excerpt:
          "In an epic five-set final, Djokovic extended his all-time Grand Slam record with a commanding victory on the Centre Court grass.",
        image:
          "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
      },
      {
        title: "Paris 2024 Olympic Legacy: Cities Transform Sporting Infrastructure",
        excerpt:
          "Cities that hosted the Paris Olympics are reporting lasting benefits in public sporting facilities two years after the Games concluded.",
        image:
          "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
      },
    ],
    entertainment: [
      {
        title: "Cannes 2026: Bangladeshi Director Wins Palme d'Or for Debut Film",
        excerpt:
          "In a historic first, a Bangladeshi feature film has claimed the festival's top prize, marking a watershed moment for South Asian cinema on the world stage.",
        image:
          "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&q=80",
      },
      {
        title: "Netflix Announces New Original Series Set in Ancient Bangladesh",
        excerpt:
          "The streaming giant's major investment in South Asian historical drama signals a new era of global interest in the region's rich cultural heritage.",
        image:
          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
      },
      {
        title: "Grammy Awards 2026: Global Music Dominates with Record Diversity",
        excerpt:
          "This year's Grammy nominations feature the most diverse international roster in the award's history, reflecting a fundamental shift in music consumption patterns.",
        image:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      },
      {
        title: "Streaming Wars Intensify as Disney and Apple Merge Content Libraries",
        excerpt:
          "A landmark content-sharing agreement between Disney and Apple promises to reshape the streaming landscape with a combined catalogue of over 100,000 titles.",
        image:
          "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80",
      },
    ],
    health: [
      {
        title: "WHO Declares Mpox Variant Under Control as New Vaccines Distributed",
        excerpt:
          "The World Health Organization has announced that a coordinated global vaccination campaign has brought the latest mpox variant under control in all affected nations.",
        image:
          "https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&q=80",
      },
      {
        title: "Breakthrough Cancer Treatment Shows 95% Remission Rate in Trials",
        excerpt:
          "A novel mRNA-based immunotherapy has demonstrated a 95% remission rate in Phase III trials for three common cancer types, marking a potential revolution in oncology.",
        image:
          "https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&q=80",
      },
      {
        title: "Global Mental Health Crisis: WHO Calls for Emergency Action Plans",
        excerpt:
          "New WHO data reveals a 40% increase in reported anxiety and depression globally since 2020, prompting urgent calls for national mental health emergency strategies.",
        image:
          "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
      },
      {
        title: "Mediterranean Diet Confirmed to Reduce Alzheimer's Risk by 30%",
        excerpt:
          "The largest ever long-term dietary study has confirmed that strict adherence to a Mediterranean diet reduces the risk of Alzheimer's disease by nearly a third.",
        image:
          "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
      },
    ],
    science: [
      {
        title: "James Webb Telescope Discovers Signs of Life Markers on Exoplanet K2-18b",
        excerpt:
          "Astronomers have detected complex organic molecules in the atmosphere of K2-18b, a super-Earth 124 light-years away, in the most promising signs of potential extraterrestrial life ever recorded.",
        image:
          "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
      },
      {
        title: "Scientists Achieve First Successful Nuclear Fusion Energy Net Gain",
        excerpt:
          "Researchers at the National Ignition Facility have consistently achieved fusion energy net gain for the first time, marking a transformative step toward unlimited clean energy.",
        image:
          "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=80",
      },
      {
        title: "New Coral Reef Species Discovered in Indian Ocean Thermal Vents",
        excerpt:
          "Marine biologists have catalogued over 200 previously unknown species in a newly discovered deep-sea ecosystem surrounding thermal vents in the central Indian Ocean.",
        image:
          "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&q=80",
      },
      {
        title: "CRISPR Gene Editing Eliminates Hereditary Blindness in Clinical Trial",
        excerpt:
          "The first in-vivo CRISPR therapy for inherited retinal dystrophy has restored functional vision to 12 of 13 patients in a landmark Phase II clinical trial.",
        image:
          "https://images.unsplash.com/photo-1576319155264-99536e0be1ee?w=800&q=80",
      },
    ],
  };

  const allArticles: {
    slug: string;
    title: string;
    excerpt: string;
    category: Category;
    imageUrl: string;
    publishedAt: string;
    readingTime: number;
    sourceName: string;
    isFeatured: boolean;
    isBreaking: boolean;
    relatedSlugs: string[];
  }[] = [];

  let offset = 0;
  for (const cat of categories) {
    const items = demoData[cat];
    items.forEach((item, i) => {
      const date = new Date(Date.now() - (offset + i) * 1800000);
      allArticles.push({
        slug: `${cat}-${i + 1}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").substring(0, 40)}`,
        title: item.title,
        excerpt: item.excerpt,
        content: item.excerpt,
        category: cat,
        imageUrl: item.image,
        imageCredit: "",
        sourceUrl: "",
        sourceName: "Demo Source",
        author: "Newsync Staff",
        publishedAt: date.toISOString(),
        readingTime: 3 + Math.floor(Math.random() * 5),
        tags: [cat],
        seo: { title: item.title, description: item.excerpt, keywords: [cat], ogImage: item.image },
        isFeatured: offset === 0 && i === 0,
        isBreaking: offset < 2,
        relatedSlugs: [],
      });
    });
    offset += items.length;
  }

  return allArticles;
}

export default async function HomePage() {
  let articles = await getArticles();
  if (articles.length === 0) {
    articles = getDemoArticles();
  }

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
          <CategorySection
            key={cat.id}
            category={cat.id as Category}
            articles={catArticles}
            layoutType={layoutType}
          />
        );
      })}
    </>
  );
}
