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

// Mock analytics data (will be replaced by Supabase queries when connected)
function getMockStats() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      views: Math.floor(Math.random() * 500) + 100,
    };
  });

  const categoryViews = [
    { name: "Technology", views: 2840, color: "#6366f1" },
    { name: "World", views: 2120, color: "#06b6d4" },
    { name: "Business", views: 1890, color: "#f59e0b" },
    { name: "Sports", views: 1650, color: "#22c55e" },
    { name: "Entertainment", views: 1420, color: "#ec4899" },
    { name: "Health", views: 980, color: "#14b8a6" },
    { name: "Science", views: 870, color: "#8b5cf6" },
  ];

  const topArticles = [
    {
      title: "OpenAI Unveils GPT-6 With Unprecedented Reasoning Capabilities",
      views: 4520,
      category: "Technology",
    },
    {
      title: "G20 Leaders Reach Historic Agreement on Global Climate Fund",
      views: 3890,
      category: "World",
    },
    {
      title: "NASA's James Webb Telescope Discovers Signs of Life",
      views: 3240,
      category: "Science",
    },
    {
      title: "FIFA World Cup 2026: Host Cities Reveal Stadium Upgrades",
      views: 2870,
      category: "Sports",
    },
    {
      title: "Breakthrough mRNA Vaccine Shows Promise Against All Cancer Types",
      views: 2650,
      category: "Health",
    },
  ];

  return {
    totalViews: 45230,
    todayViews: 1847,
    totalArticles: 156,
    activeUsers: 342,
    days,
    categoryViews,
    topArticles,
  };
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(getMockStats());
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

  useEffect(() => {
    const stored = sessionStorage.getItem("newsync-admin");
    if (stored === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    await new Promise((r) => setTimeout(r, 1000));
    setStats(getMockStats());
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
            Command Center
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Newsync Analytics & Control Panel
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
