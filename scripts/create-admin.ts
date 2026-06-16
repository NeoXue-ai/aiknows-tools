import { createClient } from "@supabase/supabase-js";

const rawEmail = process.argv[2];
if (!rawEmail) {
  console.error("Usage: pnpm tsx --env-file=.env.local scripts/create-admin.ts <email>");
  process.exit(1);
}

const email = rawEmail.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Please provide a valid email address.");
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
  const { data, error } = await supabase
    .from("app_users")
    .upsert(
      {
        email,
        email_verified: true,
        is_admin: true,
      },
      { onConflict: "email" }
    )
    .select("id, email, is_admin")
    .single();

  if (error || !data) {
    console.error("upsert app_users error:", error);
    process.exit(1);
  }

  console.log(`[admin] ${data.email} is now an admin.`);
  console.log(`[admin] user id: ${data.id}`);
  console.log("[admin] next: sign in with Google or GitHub using that verified email.");
}

main().catch((err) => {
  console.error("unexpected:", err);
  process.exit(1);
});
