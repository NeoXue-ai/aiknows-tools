"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/categories", label: "Category" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function MobileNav({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close drawer whenever route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted && open &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              aria-hidden
              onClick={() => setOpen(false)}
              className={cn(
                "fixed inset-0 z-50 bg-black/45 transition-opacity duration-200",
                open ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />

            {/* Drawer */}
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className={cn(
                "fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col border-l border-border bg-background transition-transform duration-200 ease-out",
                open ? "translate-x-0" : "translate-x-full",
              )}
            >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-5 py-6">
          <ul className="border-y border-border">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-border last:border-b-0">
                <Link
                  href={link.href}
                  className={cn(
                    "flex h-12 items-center border-l-2 px-3 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Add a record
            </p>
            <Link
              href="/submit"
              className="flex h-11 items-center gap-2 border-b border-foreground px-1 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <ArrowRight className="h-4 w-4" />
              Submit
            </Link>
          </div>
        </nav>

        <div className="border-t border-border p-5">
          {isAuthenticated ? (
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              You&apos;re signed in
            </Link>
          ) : (
            <Link
              href="/login?next=/"
              className="inline-flex border-b border-transparent py-1 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              Sign in
            </Link>
          )}
        </div>
            </aside>
          </>,
          document.body,
        )}
    </div>
  );
}
