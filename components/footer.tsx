import Link from "next/link";
import { Logo } from "@/components/logo";
const COLUMNS = [
  { title: "Discover", links: [{ label: "All tools", href: "/tools" }, { label: "Categories", href: "/categories" }, { label: "Collections", href: "/collections" }] },
  { title: "Resources", links: [{ label: "About us", href: "/about" }, { label: "From the blog", href: "/blog" }, { label: "Common questions", href: "/faq" }] },
  { title: "Contribute", links: [{ label: "Submit a tool", href: "/submit" }, { label: "Get in touch", href: "/contact" }, { label: "Listing information", href: "/pricing" }] },
];
export function Footer() {
  return <footer className="border-t border-border bg-card/30">
    <div className="site-shell py-12 sm:py-16">
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1.7fr_1fr_1fr_1fr]">
        <div className="sm:col-span-3 lg:col-span-1"><Logo /><p className="mt-4 max-w-[250px] text-[13px] leading-6 text-muted-foreground">A little discovery.<br />A lot of possibility.</p></div>
        {COLUMNS.map((column) => <nav key={column.title} aria-label={column.title}><p className="mb-5 text-[13px] font-medium text-foreground">{column.title}</p><ul className="space-y-3">{column.links.map((link) => <li key={link.href}><Link href={link.href} className="text-[13px] text-muted-foreground transition-colors hover:text-accent">{link.label}</Link></li>)}</ul></nav>)}
      </div>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground"><p>© {new Date().getFullYear()} AIknows. Made for curious minds.</p><p>An independent AI tools directory.</p></div>
    </div>
  </footer>;
}
