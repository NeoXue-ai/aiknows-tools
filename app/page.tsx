import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  FolderTree,
  Compass,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/ToolCard";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/seo/tool-schema";
import type { Tool, Directory } from "@/lib/supabase/types";
import { toolsData } from "@/lib/tools-data";
import directoriesData from "@/data/directories.json";

const TOOLS_SEED = toolsData as Array<Omit<Tool, "id" | "tags" | "is_featured" | "is_verified" | "status" | "submitted_at" | "published_at" | "created_at" | "updated_at"> & {
  tags: string[];
  is_featured: boolean;
  is_verified: boolean;
}>;
const DIRECTORIES_SEED = directoriesData as Array<Omit<Directory, "id" | "status" | "last_checked" | "last_verified" | "created_at"> & {
  status: "active" | "dead" | "unknown";
}>;

export default function Home() {
  // Featured = is_featured = true. Fall back to top verified if nothing flagged.
  const featured =
    TOOLS_SEED.filter((t) => t.is_featured).slice(0, 8) ??
    TOOLS_SEED.slice(0, 8);

  // Latest: just take the first N (JSON has no timestamps; in prod, query by published_at)
  const latest = TOOLS_SEED.slice(0, 8);

  // Top directories: by DR
  const topDirectories = [...DIRECTORIES_SEED]
    .sort((a, b) => (b.dr ?? 0) - (a.dr ?? 0))
    .slice(0, 8);

  // Count tools per category
  const categoryCounts = CATEGORIES.map((c) => ({
    ...c,
    count: TOOLS_SEED.filter((t) => t.primary_category === c.slug).length,
  }));

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      {/* Hero */}
      <section className="mb-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Discover AI Tools.
          <br />
          Find AI Directories.
          <br />
          <span className="text-primary">Grow Your SaaS.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          A curated directory of {TOOLS_SEED.length} AI tools and{" "}
          {DIRECTORIES_SEED.length} high-DR submission directories, built for
          indie hackers, AI founders, and solo SaaS builders.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/tools" className={cn(buttonVariants({ size: "lg" }))}>
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

      {/* What we cover */}
      <section className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={Sparkles}
          title="Curated AI Tools"
          description={`${TOOLS_SEED.length} hand-picked AI products across writing, SEO, image, code, and more. Updated weekly.`}
          href="/tools"
        />
        <FeatureCard
          icon={FolderTree}
          title="AI Directories Database"
          description={`${DIRECTORIES_SEED.length} high-DR directories with submission type, link type, and listing speed. The flagship page.`}
          href="/directories"
        />
        <FeatureCard
          icon={Compass}
          title="Discover What's New"
          description="See what other builders are launching. Spot gaps and opportunities before the crowd."
          href="/latest"
        />
      </section>

      {/* Featured Tools */}
      <SectionHeader
        eyebrow="Featured"
        title="Hand-picked AI tools"
        description="Editor's picks — the tools we'd recommend first."
        cta={{ label: "See all tools", href: "/tools" }}
      />
      <section className="mb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((t) => (
            <ToolCard key={t.slug} tool={t as unknown as Tool} />
          ))}
        </div>
      </section>

      {/* Popular Categories */}
      <SectionHeader
        eyebrow="Browse"
        title="Find tools by category"
        description="Eight categories, from writing to research. Every tool tagged by what it actually does."
        cta={{ label: "All categories", href: "/categories" }}
      />
      <section className="mb-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categoryCounts.map((c) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-card/80"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{c.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {c.count}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground group-hover:text-foreground/80">
              Browse →
            </p>
          </Link>
        ))}
      </section>

      {/* Featured Directories */}
      <SectionHeader
        eyebrow="Directories"
        title="Top-DR submission targets"
        description="The highest-authority directories for backlinks and visibility. Click any name to submit."
        cta={{ label: "View all directories", href: "/directories" }}
      />
      <section className="mb-20 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">DR</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Link</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {topDirectories.map((d) => (
              <tr
                key={d.slug}
                className="border-b border-border/40 last:border-0 transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-3">
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-primary"
                  >
                    {d.name}
                  </a>
                  {d.niche_focus ? (
                    <p className="text-xs text-muted-foreground">
                      {d.niche_focus}
                    </p>
                  ) : null}
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs sm:table-cell">
                  {d.dr ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs">
                    {d.submission_type ?? "—"}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Badge
                    variant={d.link_type === "dofollow" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {d.link_type ?? "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {d.submit_url ? (
                    <a
                      href={d.submit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Submit →
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Latest */}
      <SectionHeader
        eyebrow="Latest"
        title="Recently added"
        description="The newest tools added to the directory."
        cta={{ label: "See all new", href: "/latest" }}
      />
      <section className="mb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((t) => (
            <ToolCard key={t.slug} tool={t as unknown as Tool} />
          ))}
        </div>
      </section>

      {/* Submit CTA */}
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-8 text-center sm:p-12">
        <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
          Built an AI tool?
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
          Get it in front of {TOOLS_SEED.length.toLocaleString()} monthly
          visitors and a curated list of {DIRECTORIES_SEED.length} directories to
          submit to. Submissions reviewed within 2 business days.
        </p>
        <Link
          href="/submit"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Submit Your Tool <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 hover:bg-card/80"
    >
      <div className="mb-3 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <ArrowRight className="mt-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
        <h2 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {cta ? (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {cta.label} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
