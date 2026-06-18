import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Inbox, Wrench, FolderTree } from "lucide-react";
import { AuthError, requireAdmin } from "@/lib/auth/session";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/SignOutButton";

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
    <div className="bg-muted/30 min-h-[calc(100vh-3.5rem)]">
      <div className="container mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[200px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-4 text-card-foreground">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Signed in as
            </p>
            <p className="truncate text-sm font-medium">
              {user.email ?? "(no email)"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Administrator</p>
          </div>

          <nav className="space-y-1 rounded-lg border bg-card p-2 text-card-foreground">
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
        "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-medium",
        "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
