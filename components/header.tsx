import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>aiknows.tools</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/tools" className="hover:text-foreground/80">
            Tools
          </Link>
          <Link href="/directories" className="hover:text-foreground/80">
            Directories
          </Link>
          <Link href="/latest" className="hover:text-foreground/80">
            Latest
          </Link>
          <Link href="/submit" className="hover:text-foreground/80">
            Submit
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}