import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { ROUTES, ROUTE_VERSION, type Route } from "@/lib/routes";
import { cn } from "@/lib/utils";

const FILTERS_DESCRIPTION: Record<string, string> = {
  category: "category",
  pricing: "pricing",
  tags: "tags",
};

function summarizeFilters(filters: Route["steps"][number]["filters"]) {
  const parts: string[] = [];
  if (filters.category) parts.push(`category=${filters.category}`);
  if (filters.pricing) parts.push(`pricing=${filters.pricing}`);
  if (filters.tags && filters.tags.length > 0) {
    parts.push(`tags=${filters.tags.join(",")}`);
  }
  if (parts.length === 0) return "no filter";
  return parts.join(" · ");
}

export function ExploreByGoal({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-10", className)}>
      <ol className="border-y border-border">
        {ROUTES.map((route, routeIdx) => (
          <li key={route.slug} className="border-b border-border last:border-b-0">
            <header className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-3 py-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                Route / {String(routeIdx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h2 className="text-balance text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  {route.title}
                </h2>
                <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground">
                  {route.short}
                </p>
              </div>
            </header>

            <ol className="border-t border-border">
              {route.steps.map((step) => (
                <li key={step.index} className="border-b border-border last:border-b-0">
                  <Link
                    href={step.href}
                    className="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 px-1 py-4 transition-colors hover:bg-secondary/40"
                  >
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {String(step.index).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground group-hover:text-accent">
                        {step.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {step.description}
                      </span>
                      <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        {summarizeFilters(step.filters)}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </Link>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>

      <p className="text-xs leading-5 text-muted-foreground">
        Routes are version-controlled. Current config v{ROUTE_VERSION}. Each step links to a reproducible{" "}
        <code className="font-mono text-foreground">/tools</code> query that yields the same record set after refresh
        or share.
      </p>
    </div>
  );
}
