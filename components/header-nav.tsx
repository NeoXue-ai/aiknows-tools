"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/UserMenu";
import { MobileNav } from "@/components/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/categories", label: "Category" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function HeaderNav({
  isAuthenticated,
  user,
  toolCount,
}: {
  isAuthenticated: boolean;
  user: { email: string; isAdmin: boolean } | null;
  toolCount?: number;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex flex-1 items-center">
      {/* Nav links — immediately after logo */}
      <nav className="ml-6 hidden items-center gap-5 lg:flex" aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "border-b px-0 py-2 text-sm transition-colors",
              isActive(link.href)
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {link.label}
            {link.href === "/categories" && toolCount !== undefined && (
              <span className="ml-1.5 font-mono text-[10px] tabular-nums text-muted-foreground/50">
                {toolCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Actions — pushed far right */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />

        <Link
          href="/submit"
          className={cn(
            buttonVariants({ size: "sm" }),
            "hidden sm:inline-flex items-center gap-1.5",
          )}
        >
          Submit
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>

        {isAuthenticated && user ? (
          <UserMenu email={user.email} isAdmin={user.isAdmin} />
        ) : (
          <Link
            href="/login?next=/"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Sign in
          </Link>
        )}

        <MobileNav isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}
