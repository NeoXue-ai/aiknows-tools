import { siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export const metadata = pageMetadata({
  title: "AI Tool Guides & Directory Updates",
  description:
    "The AIKnows blog is being prepared. Explore our AI tools directory and the source-based guides available on selected product pages while you wait.",
  path: "/blog",
  noIndex: true,
});

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Tool Guides & Directory Updates",
    description:
      "The AIKnows blog is being prepared. Explore our AI tools directory and the source-based guides available on selected product pages while you wait.",
    url: `${siteUrl}/blog`,
  };
  return (
    <div className="mx-auto w-full max-w-[768px] px-5 py-12 sm:px-8 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <p className="mb-3 text-sm font-medium text-accent">Blog / 00 entries</p>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-9">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          AI tool guides and directory updates
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-7 text-muted-foreground">
          Our blog is being prepared. In the meantime, explore the directory and
          read the guides available on selected tool pages.
        </p>

        <dl className="mt-8 grid gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-foreground">
              <FileText className="h-3.5 w-3.5 text-accent" />
              No posts published yet
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Focus</dt>
            <dd className="mt-1 text-foreground">
              Practical explanations of AI tool features, tasks and workflow
              choices.
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/tools" className="action-primary">
            Browse AI tools
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        New articles will appear here after they have been prepared and
        reviewed.
      </p>
    </div>
  );
}
