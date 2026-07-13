"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface ViewTrackerProps {
  slug: string;
  category: string;
}

export default function ViewTracker({ slug, category }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Insert view record into Supabase
    const recordView = async () => {
      try {
        await supabase.from("page_views").insert([
          {
            slug,
            category,
          },
        ]);
      } catch (err) {
        console.error("Failed to record view:", err);
      }
    };

    recordView();
  }, [slug, category]);

  return null;
}
