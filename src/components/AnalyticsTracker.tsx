"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on route change
    const title = document.title || "Newsync";
    trackPageView(pathname, title);
  }, [pathname]);

  return null; // This component renders nothing
}
