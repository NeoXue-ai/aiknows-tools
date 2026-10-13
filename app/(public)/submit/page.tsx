import { pageMetadata, siteUrl } from "@/lib/seo/metadata";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCheck,
  CircleCheck,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  submissionUrl,
  correctionsUrl,
  submissionAction,
} from "@/features/submissions/config";

export const metadata = pageMetadata({
  title: "Submit an AI Tool to Our Directory",
  description:
    "Suggest an AI tool for the AIKnows directory. Share your product's official website, category and description through our public submission channel.",
  path: "/submit",
});

export default async function SubmitPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Submit your AI tool",
    description:
      "Suggest an AI tool for the AIKnows directory. Share your product's official website, category and description through our public submission channel.",
    url: `${siteUrl}/submit`,
  };
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* HERO ======================================================== */}
      <section className="rounded-2xl border border-border bg-card px-6 py-10 md:px-10 md:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Send className="h-3.5 w-3.5 text-accent" />
            Free to submit
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
            Submit your AI tool
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
            Help people discover your AI tool for writing, design, coding,
            research or everyday work. Share its official website and a clear
            description through our submission channel. The team reviews
            suggestions before adding them to the directory.
          </p>
        </div>

        {/* Trust signals */}
        <div className="relative mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
          <TrustItem icon={CalendarClock} label="Editorial review" />
          <TrustItem icon={ShieldCheck} label="Free submission" />
          <TrustItem icon={CheckCheck} label="Track your suggestion" />
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <div className="min-w-0">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Tell us about your product
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Have your product name, official website, category, and a short
              description ready. You can track the review through the submission
              channel. Submission does not guarantee inclusion.
            </p>
            <a
              href={submissionUrl}
              className="action-primary mt-6"
              target="_blank"
              rel="noopener noreferrer"
            >
              {submissionAction} <ArrowRight aria-hidden className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Sidebar: process + criteria */}
        <aside className="space-y-4 md:sticky md:top-24 md:self-start">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="mb-4 text-sm font-semibold text-foreground">
              What we look for
            </p>
            <ul className="space-y-3 text-sm">
              <Criterion>
                A real product or live beta — no waitlist-only launches.
              </Criterion>
              <Criterion>
                Clear who-it&apos;s-for and what problem it solves in the first
                two lines of the description.
              </Criterion>
              <Criterion>
                A clear access story (public sign-up, free tier, or trial).
              </Criterion>
              <Criterion>
                A working official homepage with clear product information.
              </Criterion>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="mb-4 text-sm font-semibold text-foreground">
              How it works
            </p>
            <ol className="space-y-3 text-sm text-foreground/80">
              <Step n={1}>You submit your product and supporting details.</Step>
              <Step n={2}>An editor checks the details and category.</Step>
              <Step n={3}>
                Approved records appear after the next site publication.
              </Step>
            </ol>
          </div>

          <p className="px-1 text-xs text-muted-foreground/80">
            Need to update an existing listing?{" "}
            <Link
              href={correctionsUrl}
              className="text-foreground underline-offset-2 hover:underline"
            >
              Suggest a correction
            </Link>{" "}
            through the review channel.
          </p>
        </aside>
      </div>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-3 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-accent" />
      <span>{label}</span>
    </div>
  );
}

function Criterion({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-muted-foreground">
      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/8 text-xs font-medium text-accent">
        {n}
      </span>
      <span className="text-sm leading-relaxed">{children}</span>
    </li>
  );
}
