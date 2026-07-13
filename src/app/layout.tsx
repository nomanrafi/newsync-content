import type { Metadata } from "next";
import "./globals.css";
import BBCHeader from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "news",
    "world news",
    "technology",
    "business",
    "sports",
    "breaking news",
    "latest news",
    "global news",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#111111" />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#ffffff" }}>
        <AnalyticsTracker />
        <BBCHeader />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
        
        {/* Global Ads (Popunders/Interstitials) */}
        <Script src="https://pl30350308.effectivecpmnetwork.com/38/e8/da/38e8da327ec62d8dd2153ef9dec6faba.js" strategy="afterInteractive" />
        <Script src="https://pl30350358.effectivecpmnetwork.com/dc/ce/fe/dccefee62226cbaa7845dbee1d9c5a80.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
