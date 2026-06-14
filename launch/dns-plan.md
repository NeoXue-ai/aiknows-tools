# Cloudflare DNS — aiknows.tools → Vercel

## Current state (before this change)

- Domain registered at: Cloudflare Registrar (or pointing to Cloudflare DNS)
- Apex `aiknows.tools` records: TBD (user to check)
- `www.aiknows.tools` records: TBD

## Target state

- `aiknows.tools` → Vercel (apex)
- `www.aiknows.tools` → Vercel (www subdomain)

## Vercel-side setup

In the Vercel dashboard for `aiknows-tools`:

1. **Project → Settings → Domains → Add**
2. Add `aiknows.tools` (apex)
3. Add `www.aiknows.tools`
4. Vercel will give us the target values:
   - Apex: `cname.vercel-dns.com` (A record) or use ALIAS/ANAME
   - www: `cname.vercel-dns.com` (CNAME)

## Cloudflare DNS changes

| Type | Name | Target | Proxy | Notes |
| --- | --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | **DNS only** (grey cloud) | Vercel anycast IP |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only** (grey cloud) | Vercel edge |

### Why "DNS only" (grey cloud, not orange)

Cloudflare's orange-cloud proxy **will not work with Vercel's domain validation**. Vercel needs to see the live A/CNAME record pointing at their infrastructure. If Cloudflare proxies, the request goes through Cloudflare first, and Vercel can't validate ownership.

**Steps in Cloudflare:**

1. Go to https://dash.cloudflare.com → select `aiknows.tools`
2. DNS → Records
3. Delete any existing A record for `@` and CNAME for `www` (if they exist)
4. Add:
   - Type: `A`, Name: `@`, IPv4: `76.76.21.21`, Proxy: **DNS only**
   - Type: `CNAME`, Name: `www`, Target: `cname.vercel-dns.com`, Proxy: **DNS only**
5. Wait for Vercel to detect (~30 sec) and issue SSL (1-2 min)

### If the user already has the domain on Cloudflare with orange-cloud proxy

They can keep the orange cloud **after** the initial setup, but the **first** verification has to be DNS-only. The pragmatic sequence:

1. Add records as DNS-only
2. Wait for Vercel to validate
3. Optionally re-enable orange cloud — but you'll need to configure Cloudflare SSL/TLS to "Full (Strict)" so it doesn't break.

## SSL

Vercel auto-provisions a Let's Encrypt cert once DNS resolves. No action needed.

## Verify

```bash
# Should resolve to 76.76.21.21
dig aiknows.tools +short

# Should resolve to cname.vercel-dns.com → Vercel
dig www.aiknows.tools +short

# Should return 200 (or 308 redirect to apex)
curl -I https://aiknows.tools

# Should serve the site
curl -I https://www.aiknows.tools
```

## Once verified

1. In Vercel → Domains → set `aiknows.tools` as the **primary** (defaults www to redirect to apex, or vice versa)
2. Update `NEXT_PUBLIC_SITE_URL` env var in Vercel to `https://aiknows.tools`
3. Redeploy
4. Update launch posts to use the apex (not the vercel.app URL)

## Re-running this

If you ever move off Vercel, just delete the Cloudflare records and add the new provider's targets. Vercel will release the domain automatically.
