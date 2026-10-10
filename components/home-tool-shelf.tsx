"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolCard } from "@/components/ToolCard";
import type { ToolSummary } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

export interface HomeToolSection {
  slug: string;
  label: string;
  count: number;
  tools: ToolSummary[];
}

export function HomeToolShelf({ sections }: { sections: HomeToolSection[] }) {
  const [selected, setSelected] = useState(sections[0]?.slug ?? "all");
  const active = sections.find((section) => section.slug === selected) ?? sections[0];
  if (!active) return null;

  function onTabKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    let next = index;
    if (direction) next = (index + direction + sections.length) % sections.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = sections.length - 1;
    else return;
    event.preventDefault();
    setSelected(sections[next].slug);
    document.getElementById(`home-tab-${sections[next].slug}`)?.focus();
  }

  return (
    <section className="site-shell pb-16 sm:pb-20" aria-labelledby="home-discover-title">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="section-label mb-3">The discovery shelf</p>
          <h2 id="home-discover-title" className="text-2xl font-medium tracking-[-0.045em] sm:text-[32px]">A few good places to start.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Thoughtful tools for whatever comes next.</p>
        </div>
        <Link href="/tools" className="text-link mb-1">Explore all tools <ArrowRight aria-hidden className="h-4 w-4" /></Link>
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-2 border-b border-border pb-5" role="tablist" aria-label="Discover tools by category">
        {sections.map((section, index) => <button key={section.slug} type="button" role="tab" id={`home-tab-${section.slug}`} aria-selected={selected === section.slug} aria-controls="home-tool-panel" tabIndex={selected === section.slug ? 0 : -1} onKeyDown={(event) => onTabKey(event, index)} onClick={() => setSelected(section.slug)} className={cn("min-h-10 rounded-full px-4 text-[13px] transition-colors", selected === section.slug ? "bg-primary font-medium text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>{section.label}</button>)}
      </div>
      <div id="home-tool-panel" role="tabpanel" aria-labelledby={`home-tab-${active.slug}`} tabIndex={0} className="mt-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {active.tools.map((tool) => <ToolCard key={tool.slug} tool={tool} compact />)}
        </div>
        {active.tools.length === 0 && <p className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground">No tools in this category yet. Explore the full directory for more ideas.</p>}
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>{active.tools.length} selected tools · {active.count.toLocaleString()} in the {active.slug === "all" ? "directory" : "category"}</p>
        <Link href={active.slug === "all" ? "/tools" : `/categories/${active.slug}`} className="inline-flex items-center gap-2 font-medium text-accent">Keep exploring <ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link>
      </div>
    </section>
  );
}
