import type { Metadata } from "next";
import { ToolDiscovery } from "@/components/tool-discovery";
import { CATEGORIES, categoryName } from "@/lib/seo/tool-schema";
import {
  TASKS,
  PRICING_OPTIONS,
  USER_TYPES,
  type Task,
  type PricingOption,
  type UserTypeFilter,
} from "@/lib/tool-score";
import { getPublicTools } from "@/lib/public-catalog";

type Props = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    task?: string;
    pricing?: string;
    userType?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, q } = await searchParams;
  const selected = category ? CATEGORIES.find((c) => c.slug === category) : null;

  if (q) {
    return {
      title: `Search "${q}" — AI tools`,
      description: `Search results for "${q}" across the aiknows.tools directory.`,
    };
  }
  if (selected) {
    return {
      title: `AI Tools — ${selected.name}`,
      description: `Recorded AI tool entries in ${selected.name}.`,
    };
  }
  return {
    title: "All AI Tools",
    description: "Search and compare recorded AI tool entries by category, price, and evidence fields.",
  };
}

function pickTask(v: string | undefined): Task | null {
  return (TASKS as readonly string[]).includes(v ?? "")
    ? (v as Task)
    : null;
}
function pickPricing(v: string | undefined): PricingOption | null {
  return (PRICING_OPTIONS as readonly string[]).includes(v ?? "")
    ? (v as PricingOption)
    : null;
}
function pickUserType(v: string | undefined): UserTypeFilter | null {
  return (USER_TYPES as readonly string[]).includes(v ?? "")
    ? (v as UserTypeFilter)
    : null;
}

export default async function ToolsIndexPage({ searchParams }: Props) {
  const { category, q, task, pricing, userType } = await searchParams;

  const allTools = await getPublicTools();
  const tools = category
    ? allTools.filter((tool) => tool.primary_category === category)
    : allTools;

  const selected = category ? CATEGORIES.find((c) => c.slug === category) : null;
  const heading = selected
    ? `AI Tools — ${selected.name}`
    : "All AI Tools";
  const sub = selected
    ? `${tools.length} recorded tool entr${tools.length === 1 ? "y" : "ies"} in ${categoryName(selected.slug)}.`
    : `${tools.length} recorded AI tool entries. Compare the fields available for each record.`;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <header className="mb-8 max-w-3xl border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Tool index / {String(tools.length).padStart(4, "0")} records
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {q ? `Results for "${q}"` : heading}
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">{sub}</p>
      </header>

      <ToolDiscovery
        tools={tools}
        initialQ={q ?? ""}
        initialTask={pickTask(task)}
        initialPricing={pickPricing(pricing)}
        initialUserType={pickUserType(userType)}
      />
    </div>
  );
}