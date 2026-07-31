import { getCurrentUser } from "@/lib/auth/session";
import { Logo } from "@/components/logo";
import { HeaderNav } from "@/components/header-nav";
import { getPublicCatalogSummary } from "@/lib/public-catalog";

export async function Header() {
  let user: { email: string; isAdmin: boolean } | null = null;
  try {
    const u = await getCurrentUser();
    if (u) user = { email: u.email, isAdmin: u.isAdmin };
  } catch {
    // auth lookup is optional in the header — fail silent
  }

  const { toolCount } = await getPublicCatalogSummary();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95">
      <div className="container mx-auto flex h-16 max-w-7xl items-center px-4">
        <Logo href="/" />
        <HeaderNav isAuthenticated={!!user} user={user} toolCount={toolCount} />
      </div>
    </header>
  );
}
