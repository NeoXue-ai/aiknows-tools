import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ToolGrid } from "@/components/ToolGrid";
import { CATEGORIES, categoryName } from "@/lib/seo/tool-schema";
import { cn } from "@/lib/utils";
import toolsData from "@/data/tools.json";
import type { Tool } from "@/lib/supabase/types";

const TOOLS = toolsData as unknown as Tool[];

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category } = await searchParams;
  const selected = category ? CATEGORIES.find((c) => c.slug === category) : null;
  if (selected) {
    return {
      title: `AI Tools — ${selected.name}`,
      description: `Curated AI tools in ${selected.name}.`,
    };
  }
  return {
    title: "All AI Tools",
    description:
      "Browse the full aiknows.tools directory of curated AI tools for SaaS builders, marketers, and creators.",
  };
}

export default async function ToolsIndexPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const selected = category ? CATEGORIES.find((c) => c.slug === category) : null;

  const tools = selected
    ? TOOLS.filter((t) => t.primary_category === selected.slug)
    : TOOLS;

  const heading = selected
    ? `AI Tools — ${selected.name}`
    : "All AI Tools";
  const sub = selected
    ? `${tools.length} curated tool${tools.length === 1 ? "" : "s"} in ${selected.name}.`
    : `${tools.length} curated AI tools for SaaS builders, marketers, and creators.`;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h1>
        <p className="mt-2 text-muted-foreground">{sub}</p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/tools"
          className={cn(
            buttonVariants({
              size: "sm",
              variant: selected ? "ghost" : "secondary",
            })
          )}
        >
          All
        </Link>
        {CATEGORIES.map((c) => {
          const isActive = selected?.slug === c.slug;
          return (
            <Link
              key={c.slug}
              href={`/tools?category=${c.slug}`}
              className={cn(
                buttonVariants({
                  size: "sm",
                  variant: isActive ? "secondary" : "ghost",
                })
              )}
            >
              {c.name}
            </Link>
          );
        })}
      </nav>

      <ToolGrid
        tools={tools}
        emptyMessage={
          selected
            ? `No tools in ${categoryName(selected.slug)} yet.`
            : "No tools yet."
        }
      />
    </div>
  );
}