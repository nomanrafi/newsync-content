"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { categoryList } from "@/lib/config";
import { Search, X, Menu } from "lucide-react";

export default function BBCHeader() {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Close search on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "var(--white)" }}>
      {/* Top black bar */}
      <div className="bbc-header-top">
        <div className="bbc-header-top-inner">
          {/* Left: menu + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              id="mobile-menu-btn"
              className="bbc-search-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              style={{ display: "block" }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" id="site-logo" className="bbc-logo-block" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="logo-n">N</div>
              <span style={{ color: "#111", fontWeight: 800, fontSize: "15px", letterSpacing: "2px" }}>NEWSYNC</span>
            </Link>
          </div>

          {/* Right: search + sign in */}
          <div className="bbc-header-actions">
            <button
              id="search-btn"
              className="bbc-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button id="signin-btn" className="bbc-btn-signin">
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Sub navigation */}
      <nav className="bbc-subnav" id="main-nav">
        <div className="bbc-subnav-inner">
          <Link href="/" className="bbc-nav-link active" id="nav-home">Home</Link>
          {categoryList.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="bbc-nav-link"
              id={`nav-${cat.id}`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "44px",
            left: 0,
            right: 0,
            background: "#111",
            zIndex: 9998,
            padding: "8px 0",
            borderBottom: "2px solid #333",
          }}
        >
          <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ display: "block", color: "#fff", padding: "12px 20px", fontSize: "15px", fontWeight: 600, borderBottom: "1px solid #333" }}>Home</Link>
          {categoryList.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: "block", color: "#ddd", padding: "12px 20px", fontSize: "14px", fontWeight: 500, borderBottom: "1px solid #222" }}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <div className="bbc-search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="bbc-search-box" onClick={(e) => e.stopPropagation()}>
            <input
              id="search-input"
              type="text"
              placeholder="Search Newsync..."
              className="bbc-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              autoFocus
            />
            <button
              className="bbc-search-submit"
              onClick={handleSearch}
            >
              Search
            </button>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", padding: "10px", display: "flex" }}
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
