"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/supabase/types";

type FormState = {
  tool_name: string;
  tool_url: string;
  description: string;
  category: string;
  submitter_email: string;
  logo_url: string;
  screenshot_url: string;
};

const INITIAL_STATE: FormState = {
  tool_name: "",
  tool_url: "",
  description: "",
  category: "",
  submitter_email: "",
  logo_url: "",
  screenshot_url: "",
};

const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 500;

interface SubmitFormProps {
  categories: Category[];
}

export function SubmitForm({ categories }: SubmitFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (form.description.length < DESCRIPTION_MIN) {
      setError(`Description must be at least ${DESCRIPTION_MIN} characters.`);
      return;
    }
    if (form.description.length > DESCRIPTION_MAX) {
      setError(`Description must be at most ${DESCRIPTION_MAX} characters.`);
      return;
    }
    try {
      new URL(form.tool_url);
    } catch {
      setError("Please enter a valid URL for your tool.");
      return;
    }
    if (!form.category) {
      setError("Please pick a category.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool_name: form.tool_name.trim(),
          tool_url: form.tool_url.trim(),
          description: form.description.trim(),
          category: form.category,
          submitter_email: form.submitter_email.trim(),
          logo_url: form.logo_url.trim() || null,
          screenshot_url: form.screenshot_url.trim() || null,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        id?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Submission failed. Please try again.");
        return;
      }

      setSuccess(true);
      setForm(INITIAL_STATE);
      toast.success("Thanks! We'll review your tool within 2 business days.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return <NextSteps onReset={() => setSuccess(false)} />;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-border/60 bg-card/40 p-6 md:p-8"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Tool details
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Required fields are marked with an asterisk.
        </p>
      </div>

      <div className="space-y-7">
        <Field
          label="Tool name"
          htmlFor="tool_name"
          required
          help="Max 100 characters."
        >
          <Input
            id="tool_name"
            name="tool_name"
            required
            maxLength={100}
            value={form.tool_name}
            onChange={(e) => update("tool_name", e.target.value)}
            placeholder="Acme AI Writer"
            className="h-10"
          />
        </Field>

        <Field
          label="Tool URL"
          htmlFor="tool_url"
          required
          help="The homepage for your product. Must be a valid URL."
        >
          <Input
            id="tool_url"
            name="tool_url"
            type="url"
            required
            value={form.tool_url}
            onChange={(e) => update("tool_url", e.target.value)}
            placeholder="https://acme.ai"
            className="h-10"
          />
        </Field>

        <Field
          label="Description"
          htmlFor="description"
          required
          help={`${DESCRIPTION_MIN}-${DESCRIPTION_MAX} characters. ${form.description.length}/${DESCRIPTION_MAX}`}
        >
          <Textarea
            id="description"
            name="description"
            required
            minLength={DESCRIPTION_MIN}
            maxLength={DESCRIPTION_MAX}
            rows={5}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What does it do, and who is it for? Be specific."
            className="resize-none"
          />
          <ProgressBar
            value={form.description.length}
            max={DESCRIPTION_MAX}
            min={DESCRIPTION_MIN}
          />
        </Field>

        <Field label="Category" htmlFor="category" required>
          <Select
            value={form.category}
            onValueChange={(value) => update("category", value ?? "")}
          >
            <SelectTrigger id="category" className="h-10 w-full">
              <SelectValue placeholder="Pick a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Your email"
          htmlFor="submitter_email"
          required
          help="We'll reach out if we have questions or to let you know your tool went live."
        >
          <Input
            id="submitter_email"
            name="submitter_email"
            type="email"
            required
            value={form.submitter_email}
            onChange={(e) => update("submitter_email", e.target.value)}
            placeholder="you@company.com"
            className="h-10"
          />
        </Field>

        <div className="grid gap-7 sm:grid-cols-2">
          <Field
            label="Logo URL"
            htmlFor="logo_url"
            help="Optional. A direct link to a square logo (PNG/SVG)."
          >
            <Input
              id="logo_url"
              name="logo_url"
              type="url"
              value={form.logo_url}
              onChange={(e) => update("logo_url", e.target.value)}
              placeholder="https://acme.ai/logo.png"
              className="h-10"
            />
          </Field>

          <Field
            label="Screenshot URL"
            htmlFor="screenshot_url"
            help="Optional. A direct link to a hero screenshot of the product."
          >
            <Input
              id="screenshot_url"
              name="screenshot_url"
              type="url"
              value={form.screenshot_url}
              onChange={(e) => update("screenshot_url", e.target.value)}
              placeholder="https://acme.ai/hero.png"
              className="h-10"
            />
          </Field>
        </div>
      </div>

      {error ? (
        <div className="mt-7 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-6">
        <p className="text-xs text-muted-foreground">
          By submitting, you confirm the product is live and the description is
          accurate.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            buttonVariants({ size: "lg" }),
            "min-w-[180px] gap-2",
          )}
        >
          {submitting ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit tool
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  help,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
      {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
    </div>
  );
}

function ProgressBar({
  value,
  max,
  min,
}: {
  value: number;
  max: number;
  min: number;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const meetsMin = value >= min;
  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className={cn(
          "h-full transition-all",
          meetsMin ? "bg-accent" : "bg-muted-foreground/40",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function NextSteps({ onReset }: { onReset: () => void }) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-b from-accent/5 to-card/40 p-8 md:p-10">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
      />
      <div className="relative">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Submission received
        </h2>
        <p className="mt-2 max-w-prose text-pretty text-muted-foreground">
          Thanks for the submission. We review every entry by hand, so expect a
          reply within 2 business days.
        </p>

        <div className="mt-8 max-w-prose">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            What happens next
          </p>
          <ol className="space-y-3 text-sm text-foreground/80">
            <NextStep n={1} label="Editor skim">
              We check the description and the product page within 2 business
              days.
            </NextStep>
            <NextStep n={2} label="Categorise + publish">
              If it fits the directory, we publish it under the right category.
            </NextStep>
            <NextStep n={3} label="You get a link">
              We email you the live listing and a share badge for your site.
            </NextStep>
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onReset}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Submit another tool
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </button>
          <a
            href="/tools"
            className={cn(
              buttonVariants({ size: "sm", variant: "ghost" }),
              "text-muted-foreground hover:text-foreground",
            )}
          >
            Browse the directory
          </a>
        </div>
      </div>
    </div>
  );
}

function NextStep({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-mono text-[10px] text-accent">
        {n}
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}