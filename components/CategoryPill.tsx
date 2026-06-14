import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PillCategory = { slug: string; name: string };

export function CategoryPill({
  category,
  asLink = true,
  className,
}: {
  category: PillCategory;
  asLink?: boolean;
  className?: string;
}) {
  if (!asLink) {
    return (
      <Badge variant="secondary" className={cn("font-normal", className)}>
        {category.name}
      </Badge>
    );
  }
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
    >
      <Badge variant="secondary" className={cn("font-normal hover:bg-secondary/80", className)}>
        {category.name}
      </Badge>
    </Link>
  );
}