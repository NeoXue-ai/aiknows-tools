-- Tie submissions to authenticated users.
-- Anonymous spam protection + per-user visibility.

ALTER TABLE submissions
  ADD COLUMN user_id UUID REFERENCES auth.users(id);

CREATE INDEX submissions_user_id_idx ON submissions(user_id) WHERE user_id IS NOT NULL;

-- Drop the previous "anyone can insert" policy.
DROP POLICY IF EXISTS "submissions_public_insert" ON submissions;

-- Authenticated users can insert their own submissions.
CREATE POLICY "submissions_auth_insert" ON submissions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can see their own submissions (in addition to admin's all-access).
CREATE POLICY "submissions_owner_select" ON submissions
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
