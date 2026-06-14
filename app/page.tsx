import Link from "next/link";
import { ArrowRight, Sparkles, Search, FolderTree } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Discover AI Tools.
          <br />
          Find AI Directories.
          <br />
          <span className="text-primary">Grow Your SaaS.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          A curated directory of AI tools and high-DR submission directories,
          built for indie hackers, AI founders, and solo SaaS builders.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tools"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Browse Tools <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href="/directories"
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
          >
            Browse Directories
          </Link>
          <Link
            href="/submit"
            className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
          >
            Submit Your Tool
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<Sparkles className="h-6 w-6" />}
          title="Curated AI Tools"
          description="Hand-picked AI products across writing, SEO, image, code, and more. Updated weekly."
          href="/tools"
        />
        <FeatureCard
          icon={<FolderTree className="h-6 w-6" />}
          title="AI Directories Database"
          description="50+ high-DR directories with submission type, link type, and listing speed. The flagship page."
          href="/directories"
        />
        <FeatureCard
          icon={<Search className="h-6 w-6" />}
          title="Find Competitors"
          description="See what other builders are launching. Spot gaps and opportunities before the crowd."
          href="/latest"
        />
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-card/80"
    >
      <div className="mb-3 text-primary">{icon}</div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <ArrowRight className="mt-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
    </Link>
  );
}