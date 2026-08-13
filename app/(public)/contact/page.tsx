import { pageMetadata } from "@/lib/seo/metadata";
import { ArrowUpRight, Mail } from "lucide-react";

const CONTACT_EMAIL = "hello@aiknows.tools";

export const metadata = pageMetadata({
  title: "Contact",
  description: "How to reach the aiknows.tools maintainers for corrections, submissions, or general questions.",
  path: "/contact",
});

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact aiknows.tools",
    description:
      "Email-based contact for corrections, submission status, and general questions about the aiknows.tools index.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/contact`,
    email: CONTACT_EMAIL,
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mb-10 border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Contact / get in touch
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Reach the maintainers.
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">
          The index is small and email is the fastest path. Pick the subject
          that fits, write in plain English, and we will reply from the same
          address.
        </p>
      </header>

      <section className="space-y-12">
        <article className="rounded-xl border border-border bg-card p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary/40 text-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Email
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-xl font-medium text-foreground transition-colors hover:text-accent"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("aiknows.tools — ")}`}
            className="mt-6 inline-flex h-11 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Open mail composer
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </article>

        <article>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            When to write
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            What each email should cover.
          </h2>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            {[
              {
                label: "Corrections",
                detail:
                  "A record that has drifted from reality — wrong category, missing tags, changed pricing, dead link. Send the URL of the dossier so we can locate the row.",
              },
              {
                label: "Submission status",
                detail:
                  "A pending submission that has not appeared after a few days. Include the submission reference if you have one.",
              },
              {
                label: "Tool or directory suggestions",
                detail:
                  "An AI tool or directory that should be in the index but is not. The fastest path is the submission form; email is fine if you want to discuss scope first.",
              },
              {
                label: "Verification requests",
                detail:
                  "If you maintain a listed tool and want to add the verification field to your dossier. Verification is editorial, not paid.",
              },
              {
                label: "Press or partnership",
                detail:
                  "Inclusion requests, syndication, dataset licensing. We respond when the answer is interesting; otherwise the index is small and we keep the bar high.",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {row.label}
                </dt>
                <dd className="text-sm leading-6 text-foreground/85">{row.detail}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            Response time
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
            What to expect.
          </h2>
          <p className="mt-3 text-pretty leading-7 text-muted-foreground">
            Most emails get a reply within a few days. Corrections are usually
            applied within a week. Submission and verification requests take
            longer because they require an editorial pass. There is no support
            inbox — the same address is read by the maintainers.
          </p>
        </article>
      </section>
    </div>
  );
}