import Link from "next/link";
import { siteConfig, categoryList } from "@/lib/config";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Home", href: "/" },
    { label: "News", href: "/category/world" },
    { label: "Technology", href: "/category/technology" },
    { label: "Business", href: "/category/business" },
    { label: "Sport", href: "/category/sports" },
    { label: "Entertainment", href: "/category/entertainment" },
    { label: "Health", href: "/category/health" },
    { label: "Science", href: "/category/science" },
    { label: "About Newsync", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Advertise", href: "/advertise" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ];

  return (
    <footer id="main-footer" className="bbc-footer">
      <div className="container">
        {/* Logo */}
        <div className="bbc-footer-logo">
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "#111", color: "#fff", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "18px" }}>N</div>
            <span style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "var(--font-sans)" }}>NEWSYNC</span>
          </Link>
        </div>

        {/* Footer links grid */}
        <div className="bbc-footer-links">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href} className="bbc-footer-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Legal bar */}
        <div className="bbc-footer-legal">
          <span className="bbc-copyright">© {currentYear} {siteConfig.name}</span>
          <Link href="/privacy" className="bbc-footer-link" style={{ border: "none", padding: 0 }}>Privacy Policy</Link>
          <Link href="/terms" className="bbc-footer-link" style={{ border: "none", padding: 0 }}>Terms of Use</Link>
          <Link href="/cookies" className="bbc-footer-link" style={{ border: "none", padding: 0 }}>Cookies</Link>
          <Link href="/accessibility" className="bbc-footer-link" style={{ border: "none", padding: 0 }}>Accessibility Help</Link>
        </div>
      </div>
    </footer>
  );
}
