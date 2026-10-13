import { pageMetadata, siteUrl } from "@/lib/seo/metadata";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const description =
  "Learn how AIKnows helps you discover AI tools, compare product information, and suggest new listings or corrections through our public review process.";

export const metadata = pageMetadata({
  title: "About Our AI Tools Directory",
  description,
  path: "/about",
});

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About AIKnows",
    description,
    url: `${siteUrl}/about`,
  };

  return (
    <div className="mx-auto w-full max-w-[768px] px-5 py-12 sm:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="mb-10">
        <p className="text-sm font-medium text-accent">About AIKnows</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Find AI tools that fit the way you work.
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          AIKnows brings tools for writing, design, coding, research and
          everyday work into one directory. Browse by task, explore alternatives
          and follow the official links when you are ready to learn more.
        </p>
      </header>

      <section className="space-y-12">
        <article>
          <p className="text-sm font-medium text-accent">01 / Explore</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            Start with the task you want to solve.
          </h2>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            Use categories and search to narrow down the directory. Each listing
            provides a product description and an official website link.
            Selected tools also have guides covering features, practical uses,
            pricing options, limitations and alternatives.
          </p>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            Guides cite supporting sources and show when their information was
            checked. They help you understand what a product offers before you
            decide whether it suits your workflow.
          </p>
        </article>

        <article>
          <p className="text-sm font-medium text-accent">
            02 / Our information
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            Product information with context.
          </h2>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            Listings draw on public product information and community
            submissions. The team reviews suggestions before publishing them.
            Where a guide is available, its sources link to official product
            pages and documentation.
          </p>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            Features, prices and access rules can change. Check the official
            website for current details. Our source-based guides do not imply
            that we have personally tested every product, and directory order is
            not a product quality score.
          </p>
        </article>

        <article className="border-t border-border pt-8">
          <p className="text-sm font-medium text-accent">03 / Contribute</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            Help keep the directory useful.
          </h2>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            Suggest a missing AI tool or report a changed feature, broken link
            or incorrect category. Include the official website and enough
            detail for us to check the suggestion. You can follow the review
            through our public submission channel.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/submit" className="action-primary">
              Submit an AI tool
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-1.5 px-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              Suggest a correction
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
