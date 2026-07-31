import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Crumb = { label: string; href?: string };

export function BreadcrumbNav({ segments }: { segments: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={seg.label} className="inline-flex items-center gap-1.5">
            {i === 0 && <ArrowLeft className="h-3.5 w-3.5" />}
            {i > 0 && <span aria-hidden className="text-muted-foreground/40">/</span>}
            {seg.href && !isLast ? (
              <Link href={seg.href} className="transition-colors hover:text-accent">
                {seg.label}
              </Link>
            ) : (
              <span className={isLast ? "truncate text-foreground" : ""}>{seg.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
