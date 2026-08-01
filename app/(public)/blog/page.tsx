import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Field notes from the index",
  description:
    "Editorial notes on what the index records, how it evolves, and where evidence-led reading differs from the launch feed.",
  path: "/blog",
});

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Field notes from the index",
    description:
      "Editorial notes on what the index records, how it evolves, and where evidence-led reading differs from the launch feed.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/blog`,
  };
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
        Blog / 00 entries
      </p>

      <div className="border-y border-border py-10">
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Field notes from the index
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-7 text-muted-foreground">
          Editorial observations on what is recorded, what is missing, and how the AI tool landscape is shifting across categories and pricing bands.
        </p>

        <dl className="mt-8 grid gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Status</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-foreground">
              <FileText className="h-3.5 w-3.5 text-accent" />
              No posts published yet
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Focus</dt>
            <dd className="mt-1 text-foreground">
              What the data shows, not on launches or rankings. Editorial entries will appear as the index matures.
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/tools" className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
            Browse the index
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Editorial observations appear here once the catalog has enough coverage across categories to support comparative notes.
      </p>
    </div>
  );
}