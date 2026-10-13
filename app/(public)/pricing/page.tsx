import { siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Free AI Tool Listings & Editorial Review",
  description:
    "Browsing AIKnows and submitting an AI tool are free. Learn what a directory listing includes and how editorial review works before suggesting your product.",
  path: "/pricing",
});

const PLANS = [
  {
    code: "free",
    name: "Free listing",
    price: "$0",
    cadence: "free submission",
    description:
      "Suggest your product for a directory listing with its official website and product information.",
    features: [
      "Product description and official website",
      "Category and task information",
      "Pricing details where available",
      "Related tools to explore",
    ],
    cta: { label: "Submit a tool", href: "/submit" },
    accent: false,
  },
  {
    code: "verified",
    name: "Editorial review",
    price: "—",
    cadence: "by review",
    description:
      "Share supporting official information so the team can check or update a listing.",
    features: [
      "Official product sources",
      "Category and description review",
      "Corrections reviewed before publication",
      "Verification status where recorded",
    ],
    cta: { label: "Request review", href: "/submit" },
    accent: true,
  },
] as const;

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Free AI Tool Listings & Editorial Review",
    description:
      "Browsing AIKnows and submitting an AI tool are free. Learn what a directory listing includes and how editorial review works before suggesting your product.",
    url: `${siteUrl}/pricing`,
  };
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-medium text-accent">Listings & review</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Free to browse. Free to submit.
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-7 text-muted-foreground">
          Suggest an AI tool or help update an existing listing. The team
          reviews product information before publication. Submitting a tool or
          requesting a review does not guarantee acceptance or a particular
          position in the directory.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.code}
            className={cn(
              "flex flex-col rounded-2xl border bg-card p-7 transition-colors sm:p-8",
              plan.accent
                ? "border-accent/40"
                : "border-border hover:border-foreground/25",
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-accent">
                {plan.code}
              </span>
              <span className="text-sm font-medium text-accent">
                {plan.cadence}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
              {plan.name}
            </h2>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
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
                  plan.accent ? "action-primary" : "action-secondary",
                  "w-full",
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
              label: "Tool pricing",
              detail:
                "Listed products have their own plans and access rules. Check the official product website for current prices and limits.",
            },
            {
              label: "Review outcome",
              detail:
                "The team checks product details and category fit before publication. A review request does not guarantee acceptance or a Verified label.",
            },
            {
              label: "Updates",
              detail:
                "Guides show a check date and supporting sources where available. Send official information when suggesting an update to an existing listing.",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="grid gap-2 py-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6"
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
      </section>
    </div>
  );
}
