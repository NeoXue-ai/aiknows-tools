#!/usr/bin/env node
// GSC CLI — auth + sitemap submit + URL inspection + analytics queries.
// One-time auth: `node scripts/gsc.mjs auth` (prints a URL, browser flow, token persisted to .gsc-token.json).
// Subcommands: list, submit-sitemap <url>, inspect <url>, query [--days N].

import { google } from "googleapis";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TOKEN_PATH = path.join(ROOT, ".gsc-token.json");
const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly", "https://www.googleapis.com/auth/webmasters"];

async function loadClient() {
  const clientId = process.env.GSC_CLIENT_ID;
  const clientSecret = process.env.GSC_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error("Missing GSC_CLIENT_ID / GSC_CLIENT_SECRET env vars.");
    console.error("Create a Desktop-app OAuth client in Google Cloud Console → APIs & Services → Credentials.");
    console.error("Enable the 'Google Search Console API' on the project first.");
    process.exit(1);
  }
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, "http://localhost:4317/oauth2callback");
  try {
    const raw = await fs.readFile(TOKEN_PATH, "utf8");
    oauth2.setCredentials(JSON.parse(raw));
  } catch {
    /* no token yet */
  }
  return oauth2;
}

async function auth() {
  const oauth2 = await loadClient();
  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  console.log("Open this URL in your browser, approve, then come back:\n");
  console.log(url, "\n");

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const u = new URL(req.url, "http://localhost:4317");
        if (u.pathname === "/oauth2callback") {
          const c = u.searchParams.get("code");
          res.end("Auth OK. You can close this tab.");
          server.close();
          c ? resolve(c) : reject(new Error("no code"));
        } else {
          res.end("ok");
        }
      } catch (e) {
        reject(e);
      }
    });
    server.listen(4317, "127.0.0.1", () => console.log("Listening on http://localhost:4317/oauth2callback"));
  });

  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log(`Token saved to ${TOKEN_PATH}`);
}

async function withClient(fn) {
  const oauth2 = await loadClient();
  // Persist refreshed tokens.
  oauth2.on("tokens", async (t) => {
    if (t.refresh_token || t.access_token) {
      try {
        const raw = await fs.readFile(TOKEN_PATH, "utf8");
        const cur = JSON.parse(raw);
        await fs.writeFile(TOKEN_PATH, JSON.stringify({ ...cur, ...t }, null, 2));
      } catch {
        /* ignore */
      }
    }
  });
  const searchconsole = google.searchconsole({ version: "v1", auth: oauth2 });
  return fn(searchconsole);
}

const cmd = process.argv[2];
const rest = process.argv.slice(3);

switch (cmd) {
  case "auth":
    await auth();
    break;

  case "list":
    await withClient(async (sc) => {
      const { siteEntry } = await sc.sites.list();
      for (const s of siteEntry ?? []) {
        console.log(`${s.siteUrl}  permission=${s.permissionLevel}`);
      }
    });
    break;

  case "submit-sitemap": {
    const siteUrl = rest[0];
    const feedpath = rest[1];
    if (!siteUrl || !feedpath) {
      console.error("Usage: gsc submit-sitemap <siteUrl> <sitemapUrl>");
      process.exit(1);
    }
    await withClient(async (sc) => {
      await sc.sitemaps.submit({ siteUrl, feedpath });
      console.log(`Submitted ${feedpath} for ${siteUrl}`);
    });
    break;
  }

  case "inspect": {
    const siteUrl = rest[0];
    const inspectionUrl = rest[1];
    if (!siteUrl || !inspectionUrl) {
      console.error("Usage: gsc inspect <siteUrl> <url>");
      process.exit(1);
    }
    await withClient(async (sc) => {
      const { inspectionResult } = await sc.urlInspection.index.inspect({
        requestBody: { siteUrl, inspectionUrl, languageCode: "en-US" },
      });
      console.log(JSON.stringify(inspectionResult, null, 2));
    });
    break;
  }

  case "query"): {
    const siteUrl = rest[0];
    if (!siteUrl) {
      console.error("Usage: gsc query <siteUrl> [--days N]");
      process.exit(1);
    }
    const days = Number(rest.includes("--days") ? rest[rest.indexOf("--days") + 1] : 28);
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 3600 * 1000);
    const fmt = (d) => d.toISOString().slice(0, 10);
    await withClient(async (sc) => {
      const { rows } = await sc.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: fmt(start),
          endDate: fmt(end),
          dimensions: ["query"],
          rowLimit: 25,
        },
      });
      for (const r of rows ?? []) {
        console.log(`${r.keys[0].padEnd(40)} clicks=${r.clicks}  impr=${r.impressions}  pos=${r.position?.toFixed(1)}`);
      }
    });
    break;
  }

  default:
    console.error(`Unknown command: ${cmd ?? "(none)"}\nUsage: gsc auth | list | submit-sitemap | inspect | query`);
    process.exit(1);
}