import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <section className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Submit your AI tool to aiknows.tools
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          We curate the best AI tools for SaaS builders, indie hackers, and
          founders. Tell us about your product and we&apos;ll review it within 2
          business days.
        </p>
      </section>

      <SubmitForm categories={categories} />
    </div>
  );
}
