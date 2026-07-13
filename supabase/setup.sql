-- ===========================================
-- NEWSYNC - Supabase Database Setup
-- ===========================================
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)
-- ===========================================

-- 1. Create the analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT DEFAULT '',
  event_type TEXT DEFAULT 'pageview' CHECK (event_type IN ('pageview', 'click', 'scroll')),
  referrer TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  country TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_page_path ON analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 4. Allow anonymous inserts (for tracking page views from the website)
CREATE POLICY "Allow anonymous inserts" ON analytics
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. Allow authenticated users to read (for admin dashboard)
CREATE POLICY "Allow authenticated reads" ON analytics
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. Also allow anon reads for the admin panel (using service role bypasses RLS anyway)
CREATE POLICY "Allow anon reads" ON analytics
  FOR SELECT
  TO anon
  USING (true);

-- ===========================================
-- OPTIONAL: Newsletter subscribers table
-- ===========================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous subscribe" ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- ===========================================
-- DONE! Your Supabase database is ready.
-- ===========================================
