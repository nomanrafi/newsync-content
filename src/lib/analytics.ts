// ===========================================
// NEWSYNC - Analytics Service
// Tracks page views and clicks via Supabase
// ===========================================

import { getSupabase } from "./supabase";
import { AnalyticsEvent } from "@/types";

// Track a page view (called from client-side)
export async function trackPageView(
  pagePath: string,
  pageTitle: string
): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) return; // Supabase not configured yet

    const event: AnalyticsEvent = {
      page_path: pagePath,
      page_title: pageTitle,
      event_type: "pageview",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    await supabase.from("analytics").insert(event);
  } catch (error) {
    // Silently fail - analytics should never break the user experience
    console.error("Analytics tracking error:", error);
  }
}

// Track a click event
export async function trackClick(
  pagePath: string,
  elementId: string
): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    const event: AnalyticsEvent = {
      page_path: pagePath,
      page_title: elementId,
      event_type: "click",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    await supabase.from("analytics").insert(event);
  } catch (error) {
    console.error("Analytics tracking error:", error);
  }
}
