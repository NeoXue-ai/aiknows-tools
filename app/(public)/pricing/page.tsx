import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Pricing",
  description:
    "Submission and visibility plans for tools indexed in the aiknows catalog. Free listings remain supported.",
  path: "/pricing",
});

const PLANS = [
  {
    code: "free",
    name: "Free listing",
    price: "$0",
    cadence: "forever",
    description: "A standard index record with the same fields and ledger as every other entry.",
    features: [
      "Standard record page",
      "Category and pricing state captured",
      "Recorded source when filed",
      "Public dossier with Evidence Ledger",
    ],
    cta: { label: "Submit a tool", href: "/submit" },
    accent: false,
  },
  {
    code: "verified",
    name: "Verified record",
    price: "—",
    cadence: "by review",
    description: "Editorial verification step. Verification is recorded as a field, not a quality claim.",
    features: [
      "All Free listing fields",
      "Recorded verification on the dossier",
      "Editor-led recheck on file edits",
      "Same Evidence Ledger, with verification populated",
    ],
    cta: { label: "Request review", href: "/submit" },
    accent: true,
  },
] as const;

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Pricing",
    description:
      "Submission and visibility plans for tools indexed in the aiknows catalog. Free listings remain supported.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/pricing`,
  };
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mb-10 max-w-3xl border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Pricing / 02 plans
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Submission plans
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-7 text-muted-foreground">
          The aiknows index is free to read. The plans below describe how a tool record is
          submitted, what gets captured, and what an editorial verification step adds.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.code}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-7 transition-colors",
              plan.accent
                ? "border-accent"
                : "border-border hover:border-foreground/25",
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {plan.code}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {plan.cadence}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
              {plan.name}
            </h2>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-serif text-4xl font-normal tracking-[-0.025em] text-foreground">
                {plan.price}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {plan.description}
            </p>
            <ul className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-foreground/85">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-7">
              <Link
                href={plan.cta.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full justify-center px-5 text-sm font-medium",
                  plan.accent && "shadow-none",
                )}
              >
                {plan.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-10 border-t border-border pt-8">
        <dl className="divide-y divide-border border-y border-border">
          {[
            {
              label: "What we do not claim",
              detail:
                "No popularity ranking, no quality rating, no launch feed. The AIknows Score is an evidence summary, never an endorsement.",
            },
            {
              label: "Field coverage",
              detail:
                "Every record carries the same fields regardless of plan. Verified records populate one additional field (verification status).",
            },
            {
              label: "Updates",
              detail:
                "Editor-initiated edits recheck the dossier. Bulk re-imports do not overwrite verification, featured state, or recorded timestamps.",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="text-sm leading-6 text-foreground/85">{row.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}