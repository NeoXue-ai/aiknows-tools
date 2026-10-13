import { pageMetadata, siteUrl } from "@/lib/seo/metadata";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = pageMetadata({
  title: "About",
  description:
    "What aiknows.tools records, where the data comes from, and what this index does not claim.",
  path: "/about",
});

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About aiknows.tools",
    description:
      "What aiknows.tools records, where the data comes from, and what this index does not claim.",
    url: `${siteUrl}/about`,
  };

  return (
    <div className="mx-auto w-full max-w-[768px] px-5 py-12 sm:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mb-10">
        <p className="text-sm font-medium text-accent">
          About / what this index is
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          An evidence-led index, not a popularity ranking.
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          aiknows.tools is a public catalogue of recorded AI tools and the
          submission facts of directories that list them. Each entry lists what
          is captured, what is missing, and what is not measured.
        </p>
      </header>

      <section className="space-y-12">
        <article>
          <p className="text-sm font-medium text-accent">
            01 / Positioning
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            A reference, not a leaderboard.
          </h2>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            The index is built for people who want to compare what a tool
            actually publishes about itself, not how loudly it markets. We do
            not rank tools by traffic, popularity, or paid placement. The only
            ordering signals on the site are record time, name, and a domain
            rating that is shown as a field, not a score.
          </p>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            Every dossier is a snapshot. If the record is sparse, the dossier
            says so. If a tool has changed pricing, the previous state stays
            visible until the next recheck records the new one.
          </p>
        </article>

        <article>
          <p className="text-sm font-medium text-accent">
            02 / Data sources
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            Where the records come from.
          </h2>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            The catalogue has two contributing paths:
          </p>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="text-sm font-medium text-muted-foreground">
                Public submission
              </dt>
              <dd className="text-sm leading-6 text-foreground/85">
                Anyone can submit a tool or directory through{" "}
                <Link href="/submit" className="underline underline-offset-4 hover:text-accent">
                  the submission form
                </Link>
                . Records enter a review queue and are published once they pass
                the basic validity checks (working URL, non-placeholder content,
                matching category).
              </dd>
            </div>
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="text-sm font-medium text-muted-foreground">
                Editor import
              </dt>
              <dd className="text-sm leading-6 text-foreground/85">
                The maintainers periodically import new AI tool launches from
                public sources (Product Hunt launches, changelogs, public
                lists). Imports populate the same fields as a public submission
                and are marked with a recorded source when one is available.
              </dd>
            </div>
            <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <dt className="text-sm font-medium text-muted-foreground">
                Directory records
              </dt>
              <dd className="text-sm leading-6 text-foreground/85">
                Tool and resource directories are grouped with their recorded
                product details at{" "}
                <Link href="/categories/directories" className="underline underline-offset-4 hover:text-accent">
                  /categories/directories
                </Link>
                .
              </dd>
            </div>
          </dl>
        </article>

        <article>
          <p className="text-sm font-medium text-accent">
            03 / Limitations
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            What this index does not claim.
          </h2>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            {[
              {
                label: "Not a review",
                detail:
                  "We do not write editorial reviews. The index records what tools publish; it does not judge whether that publication is honest.",
              },
              {
                label: "Not a ranking",
                detail:
                  "There is no popularity score, no upvote count, no daily chart. Listings on /tools default to record time, which is closer to a changelog than a leaderboard.",
              },
              {
                label: "Not comprehensive",
                detail:
                  "Coverage is best for English-language AI products with a working homepage. Region-locked, invite-only, or pre-launch tools are usually missing until they ship.",
              },
              {
                label: "Not always current",
                detail:
                  "Recheck cadence varies by tool. A 'recorded' field is a snapshot, not a guarantee that the underlying product still operates.",
              },
              {
                label: "Not affiliated",
                detail:
                  "Listed tools do not pay to appear. Verification is an editorial step, not a paid promotion. Submissions are reviewed on the same criteria regardless of source.",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
              >
                <dt className="text-sm font-medium text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="text-sm leading-6 text-foreground/85">{row.detail}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="border-t border-border pt-8">
          <p className="text-sm font-medium text-accent">
            04 / Get involved
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            Help fill the gaps.
          </h2>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            The fastest way to improve the index is to submit missing tools or
            flag records that have drifted from reality. Corrections go through
            the same review queue and are credited on the dossier when filed.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/submit"
              className="action-primary"
            >
              Submit a tool or directory
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-1.5 px-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              Get in touch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}