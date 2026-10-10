"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { cn } from "@/lib/utils";
export const NAV_LINKS = [
  { href: "/tools", label: "Discover" },
  { href: "/categories", label: "Categories" },
  { href: "/collections", label: "Collections" },
  { href: "/blog", label: "Blog" },
];
export function HeaderNav() {
  const pathname = usePathname();
  return (
    <div className="flex min-w-0 flex-1 items-center">
      <nav
        aria-label="Primary"
        className="ml-8 hidden items-center gap-7 lg:flex"
      >
        {NAV_LINKS.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "py-3 text-[13px] transition-colors hover:text-accent",
                active ? "font-medium text-accent" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
        <ThemeToggle />

        <Link
          href="/submit"
          className="action-primary hidden min-h-10 whitespace-nowrap px-4 text-[13px] lg:inline-flex"
        >
          <Plus aria-hidden className="h-3.5 w-3.5" />
          Submit a tool
        </Link>
        <MobileNav />
      </div>
    </div>
  );
}
