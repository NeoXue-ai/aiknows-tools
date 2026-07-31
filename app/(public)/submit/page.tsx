import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CheckCheck,
  CircleCheck,
  Send,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/session";
import { SubmitForm } from "@/components/SubmitForm";
import type { Category } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Submit Your AI Tool",
  description:
    "Submit your AI tool to aiknows.tools. Get featured in our curated directory of AI products and SaaS tools.",
};

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/submit");
  }

  const supabase = await createClient();
  let categories: Category[] = [];
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("slug, name, description, display_order, created_at")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[submit] failed to load categories:", error);
    } else {
      categories = (data ?? []) as Category[];
    }
  } catch (err) {
    console.error("[submit] categories fetch threw:", err);
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      {/* HERO ======================================================== */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card/60 to-card/20 px-6 py-12 md:px-10 md:py-14">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Send className="h-3.5 w-3.5 text-accent" />
            Free to submit
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Submit your AI tool
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            We curate the best AI tools for SaaS builders, indie hackers, and
            founders. Tell us about your product and we&apos;ll review it within
            2 business days.
          </p>
        </div>

        {/* Trust signals */}
        <div className="relative mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
          <TrustItem icon={CalendarClock} label="Reviewed in 2 business days" />
          <TrustItem icon={ShieldCheck} label="No payment, ever" />
          <TrustItem icon={CheckCheck} label="Human-reviewed by editors" />
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <div className="min-w-0">
          <SubmitForm categories={categories} />
        </div>

        {/* Sidebar: process + criteria */}
        <aside className="space-y-4 md:sticky md:top-24 md:self-start">
          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
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
                Public pricing or a credible free / freemium tier.
              </Criterion>
              <Criterion>
                A working homepage — broken links get auto-rejected.
              </Criterion>
            </ul>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/40 p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              How it works
            </p>
            <ol className="space-y-3 text-sm text-foreground/80">
              <Step n={1}>You submit. We email you a confirmation.</Step>
              <Step n={2}>An editor reviews the listing within 2 business days.</Step>
              <Step n={3}>
                If approved, you&apos;ll get a live link and a share badge.
              </Step>
            </ol>
          </div>

          <p className="px-1 text-xs text-muted-foreground/80">
            Need to update an existing listing?{" "}
            <Link
              href="/login"
              className="text-foreground underline-offset-2 hover:underline"
            >
              Sign in
            </Link>{" "}
            and reach out.
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
    <div className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-xs text-foreground/80">
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

function Step({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border/60 bg-secondary/40 font-mono text-[10px] text-foreground/80">
        {n}
      </span>
      <span className="text-sm leading-relaxed">{children}</span>
    </li>
  );
}