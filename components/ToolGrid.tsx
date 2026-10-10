import { ToolCard } from "@/components/ToolCard";
import type { ToolSummary } from "@/features/catalog/types";

export function ToolGrid({
  tools,
  emptyMessage = "No tools to show yet.",
}: {
  tools: ToolSummary[];
  emptyMessage?: string;
}) {
  if (tools.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </div>
  );
}
