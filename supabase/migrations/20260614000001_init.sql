-- aiknows.tools initial schema
-- Tables: categories, tools, directories, submissions

-- =========================================================================
-- categories
-- =========================================================================
CREATE TABLE categories (
  slug         TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  display_order INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- =========================================================================
-- tools (curated AI tools / SaaS products)
-- =========================================================================
CREATE TABLE tools (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  tagline          TEXT,
  description      TEXT,                              -- markdown
  url              TEXT NOT NULL,
  logo_url         TEXT,
  screenshot_url   TEXT,
  primary_category TEXT NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE,
  tags             TEXT[] DEFAULT '{}',
  pricing_type     TEXT,                              -- free | freemium | paid | enterprise
  pricing_detail   TEXT,
  is_featured      BOOLEAN DEFAULT false,
  is_verified      BOOLEAN DEFAULT false,
  status           TEXT DEFAULT 'pending',            -- pending | approved | rejected
  submitter_email  TEXT,
  submitted_at     TIMESTAMPTZ DEFAULT now(),
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX tools_status_idx        ON tools(status);
CREATE INDEX tools_category_idx      ON tools(primary_category);
CREATE INDEX tools_published_at_idx  ON tools(published_at DESC NULLS LAST);
CREATE INDEX tools_featured_idx      ON tools(is_featured) WHERE is_featured = true;

-- =========================================================================
-- directories (curated submission targets)
-- =========================================================================
CREATE TABLE directories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  url             TEXT NOT NULL,
  dr              INT,
  submission_type TEXT,                               -- free | paid | both
  paid_price      TEXT,
  link_type       TEXT,                               -- dofollow | nofollow
  listing_speed   TEXT,
  niche_focus     TEXT,
  submit_url      TEXT,
  notes           TEXT,
  status          TEXT DEFAULT 'active',              -- active | dead | unknown
  last_checked    TIMESTAMPTZ,
  last_verified   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX directories_status_idx ON directories(status);
CREATE INDEX directories_dr_idx     ON directories(dr DESC NULLS LAST);

-- =========================================================================
-- submissions (public submission queue, before approval)
-- =========================================================================
CREATE TABLE submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name        TEXT NOT NULL,
  tool_url         TEXT NOT NULL,
  description      TEXT,
  category         TEXT,
  pricing_type     TEXT,
  submitter_email  TEXT NOT NULL,
  logo_url         TEXT,
  screenshot_url   TEXT,
  status           TEXT DEFAULT 'pending',            -- pending | approved | rejected
  rejection_reason TEXT,
  reviewed_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX submissions_status_idx ON submissions(status);
CREATE INDEX submissions_created_at_idx ON submissions(created_at DESC);

-- =========================================================================
-- updated_at trigger
-- =========================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =========================================================================
-- RLS
-- =========================================================================
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools       ENABLE ROW LEVEL SECURITY;
ALTER TABLE directories ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- categories: public read
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);

-- tools: public read approved only
CREATE POLICY "tools_public_read" ON tools
  FOR SELECT USING (status = 'approved');

-- directories: public read active only
CREATE POLICY "directories_public_read" ON directories
  FOR SELECT USING (status = 'active');

-- submissions: anyone can INSERT (submit a tool); no public SELECT/UPDATE/DELETE
CREATE POLICY "submissions_public_insert" ON submissions
  FOR INSERT WITH CHECK (true);

-- =========================================================================
-- Seed: 8 categories from spec v0.4
-- =========================================================================
INSERT INTO categories (slug, name, description, display_order) VALUES
  ('writing-content',   'Writing & Content',     'AI writing assistants, copy generators, content editors',           1),
  ('seo-marketing',     'SEO & Marketing',       'SEO tools, growth marketing, analytics, ad optimization',          2),
  ('image-video',       'Image & Video',         'AI image generation, video editing, creative tools',               3),
  ('code-development',  'Code & Development',    'AI code assistants, dev tools, code review',                       4),
  ('productivity',      'Productivity & Automation','Workflow automation, task managers, AI agents',                 5),
  ('business-analytics','Business & Analytics',  'Business intelligence, dashboards, AI for ops',                    6),
  ('ecommerce-sales',   'E-commerce & Sales',    'AI sales tools, e-commerce platforms, conversion optimization',     7),
  ('research-data',     'Research & Data',       'AI research assistants, data analysis, knowledge management',     8);