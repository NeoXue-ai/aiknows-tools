# Deploy runbook — aiknows.tools

The path from "code on main" to "site serving DB-backed content". Do these in order.

## Pre-flight

- [x] Code pushed to `NeoXue-ai/aiknows-tools` (private) — `main` branch
- [x] Vercel project created and linked to GitHub
- [x] Initial production deploy succeeded at `https://aiknows-tools.vercel.app`
- [x] Supabase Cloud project created (`sbvsvrjbzjuxgcsulkvn`)
- [x] Local `.env.local` populated with Supabase Cloud creds

## Step 1 — Apply DB migrations

You have two options. **Option A is faster** (no credentials to share).

### Option A — Supabase SQL Editor (recommended, 60s)

1. Open https://supabase.com/dashboard/project/sbvsvrjbzjuxgcsulkvn/sql/new
2. Open `supabase/migrations/20260614000001_init.sql` in your editor
3. Copy **entire file** → paste into SQL editor → click **Run**
4. Repeat for `supabase/migrations/20260614000002_rls.sql`
5. Verify: SQL editor → `SELECT count(*) FROM categories;` should return 8

### Option B — Connection string + psql (if you want to script it)

```bash
# From project root
export PGPASSWORD="<db-password-from-supabase-settings>"
psql "postgresql://postgres.sbvsvrjbzjuxgcsulkvn:${PGPASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20260614000001_init.sql
psql "$_ -d ..."  # ditto for the RLS file
```

DB password is in: Project Settings → Database → Database password. The session-mode pooler URI is in Connection string → URI.

## Step 2 — Seed the database

```bash
pnpm seed
```

Expected output:
```
[tools] loading data/tools.json
[tools] seeding 121 tools…
[tools] upserted 121 tools
[directories] loading data/directories.json
[directories] seeding 53 directories…
[directories] upserted 53 directories
[done] seeded 121 tools + 53 directories
```

## Step 3 — Set Vercel env vars

In Vercel dashboard (or via CLI if you have a token):

**Required:**

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sbvsvrjbzjuxgcsulkvn.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_TzV387Rczx-I4lSrtkXQUg_YOFo3Hf4` |
| `SUPABASE_SERVICE_ROLE_KEY` | `[REDACTED_SUPABASE_SECRET_KEY]` |
| `NEXT_PUBLIC_SITE_URL` | `https://aiknows-tools.vercel.app` (or your custom domain later) |

**Optional but recommended:**

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `aiknows.tools` (after custom domain is set) |
| `RESEND_FROM_EMAIL` | `noreply@aiknows.tools` |
| `RESEND_TO_ADMIN` | `lonnie@aiknows.tools` |
| `RESEND_API_KEY` | (sign up at resend.com) |

Set them as **Production** environment in Vercel (Settings → Environment Variables).

CLI version (if you have a token):
```bash
export VERCEL_TOKEN="<token>"
export VERCEL_SCOPE="lonnies-projects-92526e9c"

vercel env add NEXT_PUBLIC_SUPABASE_URL production --value "https://sbvsvrjbzjuxgcsulkvn.supabase.co" --yes --token "$VERCEL_TOKEN" --scope "$VERCEL_SCOPE"
# ... repeat for each var
```

## Step 4 — Trigger redeploy

In Vercel: Deployments → click the latest → "..." menu → "Redeploy" (uncheck "use existing build cache").

Or via CLI:
```bash
vercel deploy --prod --yes --token "$VERCEL_TOKEN" --scope "$VERCEL_SCOPE"
```

## Step 5 — Verify

```bash
# Should return 200 (homepage uses static data)
curl -I https://aiknows-tools.vercel.app/

# Should return 200 (now backed by Supabase)
curl -I https://aiknows-tools.vercel.app/tools
curl -I https://aiknows-tools.vercel.app/directories
curl -I https://aiknows-tools.vercel.app/tools/jasper
curl -I https://aiknows-tools.vercel.app/sitemap.xml
```

## Step 6 — Custom domain (later)

See `launch/dns-plan.md`. Cloudflare → Vercel DNS switch.

## Step 7 — Google Search Console

After custom domain is live:

1. https://search.google.com/search-console → Add property → Domain
2. Verify via DNS TXT record in Cloudflare
3. Submit sitemap: `https://aiknows.tools/sitemap.xml`

## Step 8 — Launch posts

See `launch/README.md` for timing. All drafts in `launch/`.
