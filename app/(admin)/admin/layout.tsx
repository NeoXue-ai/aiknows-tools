import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  FolderTree,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { AuthError, requireAdmin } from "@/lib/auth/session";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
  { href: "/admin/directories", label: "Directories", icon: FolderTree },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireAdmin();
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect("/admin/login?next=/admin");
    }
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-background to-background/40">
      <div className="container mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {/* Admin badge */}
          <div className="flex items-center gap-2 px-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Admin Console
            </p>
          </div>

          {/* User card */}
          <div className="rounded-xl border border-border/60 bg-card/40 p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Signed in as
            </p>
            <p className="mt-1 truncate text-sm font-medium text-foreground">
              {user.email ?? "(no email)"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Administrator</p>
          </div>

          {/* Nav */}
          <nav className="space-y-1 rounded-xl border border-border/60 bg-card/40 p-2">
            {NAV.map((item) => (
              <AdminNavLink key={item.href} {...item} />
            ))}
          </nav>

          <SignOutButton />
        </aside>

        <main className="min-w-0">
          <Separator className="mb-6 lg:hidden" />
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all",
        "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
    </Link>
  );
}