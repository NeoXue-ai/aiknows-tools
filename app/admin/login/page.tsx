import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { sanitizeNext } from "@/lib/auth/oauth";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const sanitizedNext = sanitizeNext(params.next);
  const next = sanitizedNext.startsWith("/admin") ? sanitizedNext : "/admin";

  return (
    <div className="bg-muted/30 flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use your admin account to continue. Admin access is required to
            publish, edit, or moderate content.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <AdminLoginForm next={next} />
        </div>
      </div>
    </div>
  );
}
