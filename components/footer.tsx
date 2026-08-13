import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS = [
  {
    title: "Index",
    links: [
      { label: "All tools", href: "/tools" },
      { label: "Categories", href: "/categories" },
      { label: "Routes", href: "/collections" },
    ],
  },
  {
    title: "Contribute",
    links: [
      { label: "Submit a tool", href: "/submit" },
      { label: "Blog", href: "/blog" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Logo />
            <p className="max-w-xs text-pretty text-sm leading-6 text-muted-foreground">
              An independent index of recorded AI tools and directory submission facts.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Record availability varies by entry.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {column.title}
              </p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} AIknows</p>
          <p className="font-mono uppercase tracking-[0.12em]">Independent AI software index</p>
        </div>
      </div>
    </footer>
  );
}
