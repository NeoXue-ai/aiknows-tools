import { ToolCard } from "@/components/ToolCard";
import type { Tool } from "@/lib/supabase/types";

export function ToolGrid({
  tools,
  emptyMessage = "No tools to show yet.",
}: {
  tools: Tool[];
  emptyMessage?: string;
}) {
  if (tools.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id || tool.slug} tool={tool} />
      ))}
    </div>
  );
}