"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Eye,
  TrendingUp,
  FileText,
  Users,
  RefreshCw,
  LogOut,
  Shield,
  Activity,
  Globe,
  Zap,
  Lock,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
// 1. Create a Supabase project at supabase.com
// 2. Create a table named 'page_views' with columns: id, slug, category, created_at
// 3. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
// 4. Install @supabase/supabase-js: npm i @supabase/supabase-js


export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  interface StatState {
    totalViews: number;
    todayViews: number;
    totalArticles: number;
    activeUsers: number;
    days: { date: string; views: number }[];
    categoryViews: { name: string; views: number; color: string }[];
    topArticles: { title: string; views: number; category: string }[];
  }

  const [stats, setStats] = useState<StatState>({
    totalViews: 0,
    todayViews: 0,
    totalArticles: 0,
    activeUsers: 0,
    days: [],
    categoryViews: [],
    topArticles: [],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simple password auth (in production, use Supabase Auth)
  const ADMIN_PASSWORD = "newsync-admin-2026";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
      // Store in session
      sessionStorage.setItem("newsync-admin", "true");
    } else {
      setError("Invalid password. Access denied.");
    }
  };

  const fetchStats = async () => {
    try {
      // 1. Get all views
      const { data: views, error } = await supabase.from("page_views").select("*");
      if (error) throw error;
      
      const allViews = views || [];
      const totalViews = allViews.length;
      
      // 2. Today's views
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayViews = allViews.filter(v => new Date(v.created_at) >= today).length;
      
      // 3. Total Unique Articles
      const uniqueSlugs = new Set(allViews.map(v => v.slug));
      const totalArticles = uniqueSlugs.size;
      
      // 4. Days (Last 30 days)
      const daysMap = new Map();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        daysMap.set(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), 0);
      }
      
      allViews.forEach(v => {
        const d = new Date(v.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (daysMap.has(d)) {
          daysMap.set(d, daysMap.get(d) + 1);
        }
      });
      const days = Array.from(daysMap, ([date, v]) => ({ date, views: v }));
      
      // 5. Category Distribution
      const catCount: Record<string, number> = {};
      allViews.forEach(v => {
        catCount[v.category] = (catCount[v.category] || 0) + 1;
      });
      const colors = ["#6366f1", "#06b6d4", "#f59e0b", "#22c55e", "#ec4899", "#14b8a6", "#8b5cf6"];
      const categoryViews = Object.entries(catCount)
        .map(([name, v], idx) => ({ name, views: v, color: colors[idx % colors.length] }))
        .sort((a, b) => b.views - a.views);
        
      // 6. Top Articles
      const slugCount: Record<string, { views: number, category: string }> = {};
      allViews.forEach(v => {
        if (!slugCount[v.slug]) slugCount[v.slug] = { views: 0, category: v.category };
        slugCount[v.slug].views += 1;
      });
      const topArticles = Object.entries(slugCount)
        .map(([slug, data]) => ({ title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), views: data.views, category: data.category }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
        
      setStats({
        totalViews,
        todayViews,
        totalArticles,
        activeUsers: Math.floor(todayViews / 24) || 1, // Rough estimate of active hourly users
        days,
        categoryViews,
        topArticles,
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setIsRefreshing(false);
  };

  const handleFetchNews = async () => {
    try {
      const res = await fetch("/api/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      alert(
        data.success
          ? `Successfully processed ${data.count || 0} articles!`
          : `Error: ${data.error || "Unknown error"}`
      );
    } catch {
      alert("Failed to trigger news fetch. Check console for details.");
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="glass-card p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-center font-[var(--font-display)] mb-1">
              Command Center
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] text-center mb-6">
              Restricted access. Enter your credentials.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access key"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent-primary)] focus:ring-1 focus:ring-[var(--color-accent-primary)] outline-none transition-all"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                Authenticate
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="container-main py-8">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] flex items-center gap-2">
            <Activity size={24} className="text-[var(--color-accent-primary)]" />
            Command Center (Live Data)
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Real-time Analytics via Supabase Database
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleFetchNews}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-semibold hover:bg-green-500/20 transition-all"
          >
            <Zap size={16} />
            Fetch News Now
          </button>
          <button
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm font-semibold hover:border-[var(--color-border-hover)] transition-all ${
              isRefreshing ? "opacity-50" : ""
            }`}
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("newsync-admin");
              setIsAuthenticated(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-semibold hover:bg-red-500/20 transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            label: "Total Views",
            value: stats.totalViews.toLocaleString(),
            icon: Eye,
            color: "#6366f1",
            change: "+12.5%",
          },
          {
            label: "Today's Views",
            value: stats.todayViews.toLocaleString(),
            icon: TrendingUp,
            color: "#22c55e",
            change: "+8.2%",
          },
          {
            label: "Total Articles",
            value: stats.totalArticles.toString(),
            icon: FileText,
            color: "#f59e0b",
            change: "+3",
          },
          {
            label: "Active Visitors",
            value: stats.activeUsers.toString(),
            icon: Users,
            color: "#ec4899",
            change: "Live",
          },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--color-text-tertiary)]">
                {stat.label}
              </span>
              <stat.icon size={18} style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-bold font-[var(--font-display)]">
              {stat.value}
            </div>
            <span
              className="text-xs font-semibold mt-1 inline-block"
              style={{ color: stat.color }}
            >
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Views Over Time */}
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="text-base font-bold font-[var(--font-display)] mb-4 flex items-center gap-2">
            <Globe size={16} className="text-[var(--color-accent-primary)]" />
            Views Over Last 30 Days
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a2420" />
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#14141e",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#f1f5f9",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#6366f1" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-5">
          <h2 className="text-base font-bold font-[var(--font-display)] mb-4">
            Category Distribution
          </h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryViews}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="views"
                >
                  {stats.categoryViews.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#14141e",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#f1f5f9",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {stats.categoryViews.slice(0, 4).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[var(--color-text-secondary)]">
                    {cat.name}
                  </span>
                </div>
                <span className="text-[var(--color-text-muted)] font-mono">
                  {cat.views}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Articles & Category Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Articles */}
        <div className="glass-card p-5">
          <h2 className="text-base font-bold font-[var(--font-display)] mb-4 flex items-center gap-2">
            <TrendingUp
              size={16}
              className="text-[var(--color-accent-warm)]"
            />
            Top Performing Articles
          </h2>
          <div className="space-y-3">
            {stats.topArticles.map((article, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]"
              >
                <span className="text-lg font-bold text-[var(--color-text-muted)] w-6 text-center font-[var(--font-display)]">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {article.title}
                  </p>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {article.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm font-mono font-semibold text-[var(--color-accent-secondary)]">
                  <Eye size={14} />
                  {article.views.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="glass-card p-5">
          <h2 className="text-base font-bold font-[var(--font-display)] mb-4">
            Views by Category
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryViews} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1a1a2420"
                  horizontal={false}
                />
                <XAxis type="number" stroke="#475569" fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#475569"
                  fontSize={11}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#14141e",
                    border: "1px solid rgba(148, 163, 184, 0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#f1f5f9",
                  }}
                />
                <Bar dataKey="views" radius={[0, 6, 6, 0]}>
                  {stats.categoryViews.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
