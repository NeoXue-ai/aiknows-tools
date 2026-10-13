import { pageMetadata, siteUrl } from "@/lib/seo/metadata";
import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";
import { correctionsUrl } from "@/features/submissions/config";

const CONTACT_EMAIL = "hello@aiknows.tools";

export const metadata = pageMetadata({
  title: "Contact Our AI Tools Directory Team",
  description:
    "Contact AIKnows about an AI tool listing, suggest a correction or ask about a submission. Include the relevant page and official sources to help us review it.",
  path: "/contact",
});

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact AIKnows",
    description:
      "Contact AIKnows about tool listings, corrections, submissions and general directory questions.",
    url: `${siteUrl}/contact`,
    email: CONTACT_EMAIL,
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
        <p className="text-sm font-medium text-accent">
          Contact / get in touch
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Help us keep AIKnows useful.
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          Found an outdated listing or have a question about the directory?
          Include the relevant page and a short explanation so the team can
          check the details.
        </p>
      </header>

      <section className="space-y-12">
        <article className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/8 text-accent">
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-lg font-medium text-foreground transition-colors [overflow-wrap:anywhere] hover:text-accent sm:text-xl"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("aiknows.tools — ")}`}
            className="action-primary mt-6"
          >
            Open mail composer
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </article>

        <article>
          <p className="text-sm font-medium text-accent">When to write</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            What each email should cover.
          </h2>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            {[
              {
                label: "Corrections",
                detail:
                  "Include the AIKnows listing URL, the detail that needs changing and an official source supporting the update.",
              },
              {
                label: "Submission status",
                detail:
                  "Include the submission link or reference so we can find your suggestion in the review queue.",
              },
              {
                label: "Tool or directory suggestions",
                detail:
                  "Use the Submit page to suggest a product. Include its official website and describe the task it helps people complete.",
              },
              {
                label: "Verification requests",
                detail:
                  "If you maintain a listed tool, share official information that helps us check or update its listing.",
              },
              {
                label: "Press or partnership",
                detail:
                  "Describe your proposal, the intended audience and what you would like to discuss with the team.",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
              >
                <dt className="text-sm font-medium text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="text-sm leading-6 text-foreground/85">
                  {row.detail}
                </dd>
              </div>
            ))}
          </dl>
        </article>

        <article>
          <p className="text-sm font-medium text-accent">Suggest an update</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            Keep supporting details in one place.
          </h2>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            For listing corrections, use the public review channel to share the
            page, proposed change and supporting links. Suggestions are reviewed
            before publication, and the timing varies by request.
          </p>
          <Link href={correctionsUrl} className="action-primary mt-6">
            Suggest a correction
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </article>
      </section>
    </div>
  );
}
