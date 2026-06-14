import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CATEGORIES } from "@/lib/seo/tool-schema";
import toolsData from "@/data/tools.json";
import type { Tool } from "@/lib/supabase/types";

const TOOLS = toolsData as unknown as Tool[];

export const metadata: Metadata = {
  title: "Browse AI Tools by Category",
  description:
    "Explore AI tools by category — writing, SEO, image, code, productivity, and more.",
};

export default function CategoriesIndexPage() {
  const counts = new Map<string, number>();
  for (const tool of TOOLS) {
    counts.set(tool.primary_category, (counts.get(tool.primary_category) ?? 0) + 1);
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Browse AI Tools by Category
        </h1>
        <p className="mt-2 text-muted-foreground">
          {TOOLS.length} curated tools across {CATEGORIES.length} categories.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const count = counts.get(cat.slug) ?? 0;
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-md">
                <CardHeader>
                  <CardTitle>{cat.name}</CardTitle>
                  <CardDescription>
                    {count} tool{count === 1 ? "" : "s"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}