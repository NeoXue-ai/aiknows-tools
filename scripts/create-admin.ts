/**
 * Create the first admin user.
 *
 * Usage: pnpm tsx --env-file=.env.local scripts/create-admin.ts <email>
 *
 * What it does:
 *   1. Creates a user in Supabase Auth (with email_confirm = true, no verification step)
 *   2. Sets app_metadata.admin = true so is_admin() returns true
 *
 * If the user already exists, it just updates app_metadata.
 */

import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: pnpm tsx --env-file=.env.local scripts/create-admin.ts <email>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  // List existing users to check if this email is already there
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("listUsers error:", listErr);
    process.exit(1);
  }
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    console.log(`[admin] user ${email} already exists (id: ${existing.id})`);
    console.log("[admin] current app_metadata:", existing.app_metadata);
    if (existing.app_metadata?.admin) {
      console.log("[admin] already has admin flag. Done.");
      return;
    }
    console.log("[admin] updating app_metadata.admin = true...");
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      app_metadata: { ...existing.app_metadata, admin: true },
    });
    if (updateErr) {
      console.error("updateUserById error:", updateErr);
      process.exit(1);
    }
    console.log("[admin] done. user is now an admin.");
  } else {
    console.log(`[admin] creating user ${email} with email_confirm=true, app_metadata.admin=true`);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: { admin: true },
    });
    if (error) {
      console.error("createUser error:", error);
      process.exit(1);
    }
    console.log(`[admin] created user id: ${data.user.id}`);
    console.log(`[admin] ${email} is now an admin.`);
    console.log(`[admin] next: visit /admin/login, enter ${email}, receive magic link.`);
  }
}

main().catch((err) => {
  console.error("unexpected:", err);
  process.exit(1);
});
