import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryPill } from "@/components/CategoryPill";
import { categoryName } from "@/lib/seo/tool-schema";
import type { Tool } from "@/lib/supabase/types";

const PRICING_LABEL: Record<NonNullable<Tool["pricing_type"]>, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  enterprise: "Enterprise",
};

function LogoPlaceholder({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-base font-semibold text-primary"
    >
      {letter}
    </div>
  );
}

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
        <CardHeader>
          <div className="flex items-start gap-3">
            <LogoPlaceholder name={tool.name} />
            <div className="min-w-0 flex-1">
              <CardTitle className="flex items-center gap-1.5">
                <span className="truncate">{tool.name}</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
              </CardTitle>
              {tool.tagline ? (
                <CardDescription className="mt-1 line-clamp-2">
                  {tool.tagline}
                </CardDescription>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
          <CategoryPill
            category={{ slug: tool.primary_category, name: categoryName(tool.primary_category) }}
            asLink={false}
          />
          {tool.pricing_type ? (
            <Badge variant="outline" className="text-xs font-normal">
              {PRICING_LABEL[tool.pricing_type]}
            </Badge>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}