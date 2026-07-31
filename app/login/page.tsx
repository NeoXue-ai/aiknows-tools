import Image from "next/image";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { sanitizeNext } from "@/lib/auth/oauth";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = sanitizeNext(params.next);

  return (
    <div className="bg-muted/30 flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3">
            <Image src="/logo.png" alt="aiknows" width={40} height={40} className="dark:invert" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sign in to aiknows</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save tools, track directories, and submit your own products to the
            catalog.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <AdminLoginForm next={next} />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By signing in you agree to our terms. We never post on your behalf.
        </p>
      </div>
    </div>
  );
}
