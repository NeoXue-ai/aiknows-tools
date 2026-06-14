import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-8">
      <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} aiknows.tools</p>
        <nav className="flex gap-6">
          <Link href="/about" className="hover:text-foreground/80">
            About
          </Link>
          <Link href="/submit" className="hover:text-foreground/80">
            Submit
          </Link>
          <Link href="/admin" className="hover:text-foreground/80">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
}