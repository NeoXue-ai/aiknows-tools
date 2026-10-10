"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
const LINKS = [
  { href: "/tools", label: "Discover" },
  { href: "/categories", label: "Categories" },
  { href: "/collections", label: "Collections" },
  { href: "/blog", label: "Blog" },
];
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!mounted || !dialog || !open) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open, mounted]);
  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-site-navigation"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-secondary"
      >
        <Menu aria-hidden className="h-5 w-5" strokeWidth={1.6} />
      </button>
      {mounted &&
        createPortal(
          <dialog
            ref={dialogRef}
            id="mobile-site-navigation"
            aria-labelledby="mobile-menu-title"
            onCancel={() => setOpen(false)}
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
            className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-[min(360px,calc(100%-24px))] max-w-none border-0 border-l border-border bg-background p-0 text-foreground backdrop:bg-black/30"
          >
            <div className="flex h-full flex-col px-6">
              <div className="flex h-[88px] shrink-0 items-center justify-between gap-4">
                <Logo />
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
                >
                  <X aria-hidden className="h-5 w-5" />
                </button>
              </div>
              <h2
                id="mobile-menu-title"
                className="mt-7 text-xs font-medium text-muted-foreground"
              >
                Explore AIknows
              </h2>
              <nav aria-label="Mobile" className="mt-4 flex-1">
                <ul>
                  {LINKS.map((link) => {
                    const active =
                      pathname === link.href ||
                      pathname.startsWith(link.href + "/");
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-16 items-center justify-between border-b border-border text-xl tracking-[-0.03em]",
                            active ? "text-accent" : "text-foreground",
                          )}
                        >
                          {link.label}
                          <ArrowRight
                            aria-hidden
                            className="h-4 w-4 text-muted-foreground"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="space-y-5 border-t border-border py-7">
                <Link
                  href="/submit"
                  onClick={() => setOpen(false)}
                  className="action-primary w-full"
                >
                  Submit a tool
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </dialog>,
          document.body,
        )}
    </div>
  );
}
