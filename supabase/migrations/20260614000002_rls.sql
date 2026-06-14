-- aiknows.tools admin RLS policies
-- Admin is identified by being listed in app_metadata.admin = true
-- (set via Supabase Auth admin API on the user)

-- =========================================================================
-- Helper: is_admin() — checks if current auth user is admin
-- =========================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'admin')::boolean,
    false
  );
$$ LANGUAGE sql STABLE;

-- =========================================================================
-- tools: admins get full CRUD
-- =========================================================================
CREATE POLICY "tools_admin_all" ON tools
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =========================================================================
-- directories: admins get full CRUD
-- =========================================================================
CREATE POLICY "directories_admin_all" ON directories
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =========================================================================
-- categories: admins get full CRUD
-- =========================================================================
CREATE POLICY "categories_admin_all" ON categories
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- =========================================================================
-- submissions: admins can SELECT/UPDATE/DELETE
-- =========================================================================
CREATE POLICY "submissions_admin_select" ON submissions
  FOR SELECT
  USING (is_admin());

CREATE POLICY "submissions_admin_update" ON submissions
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "submissions_admin_delete" ON submissions
  FOR DELETE
  USING (is_admin());