-- Application-owned auth tables.
-- Supabase remains the database; Supabase Auth no longer owns login state.

CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app_oauth_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github')),
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  provider_email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX app_oauth_identities_user_id_idx ON app_oauth_identities(user_id);
CREATE INDEX app_sessions_token_hash_idx ON app_sessions(token_hash);
CREATE INDEX app_sessions_user_id_idx ON app_sessions(user_id);
CREATE INDEX app_sessions_expires_at_idx ON app_sessions(expires_at);

CREATE TRIGGER app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER app_oauth_identities_updated_at
  BEFORE UPDATE ON app_oauth_identities
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_oauth_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_sessions ENABLE ROW LEVEL SECURITY;

INSERT INTO app_users (id, email, email_verified, is_admin, created_at, updated_at)
SELECT
  id,
  email,
  email_confirmed_at IS NOT NULL,
  COALESCE((raw_app_meta_data ->> 'admin')::boolean, false),
  created_at,
  now()
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
  email_verified = EXCLUDED.email_verified,
  is_admin = app_users.is_admin OR EXCLUDED.is_admin,
  updated_at = now();

DROP POLICY IF EXISTS "submissions_auth_insert" ON submissions;
DROP POLICY IF EXISTS "submissions_owner_select" ON submissions;
DROP POLICY IF EXISTS "submissions_admin_select" ON submissions;
DROP POLICY IF EXISTS "submissions_admin_update" ON submissions;
DROP POLICY IF EXISTS "submissions_admin_delete" ON submissions;
DROP POLICY IF EXISTS "tools_admin_all" ON tools;
DROP POLICY IF EXISTS "directories_admin_all" ON directories;
DROP POLICY IF EXISTS "categories_admin_all" ON categories;

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;
ALTER TABLE submissions
  ADD CONSTRAINT submissions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE SET NULL;

DROP FUNCTION IF EXISTS is_admin();
