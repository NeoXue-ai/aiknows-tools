"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category, PricingType } from "@/lib/supabase/types";

type FormState = {
  tool_name: string;
  tool_url: string;
  description: string;
  category: string;
  pricing_type: PricingType;
  submitter_email: string;
  logo_url: string;
  screenshot_url: string;
};

const INITIAL_STATE: FormState = {
  tool_name: "",
  tool_url: "",
  description: "",
  category: "",
  pricing_type: "freemium",
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
          pricing_type: form.pricing_type,
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
    <form onSubmit={onSubmit} className="space-y-6">
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
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" required>
          <Select
            value={form.category}
            onValueChange={(value) => update("category", value ?? "")}
          >
            <SelectTrigger id="category" className="w-full">
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

        <Field label="Pricing" htmlFor="pricing_type" required>
          <Select
            value={form.pricing_type}
            onValueChange={(value) =>
              update("pricing_type", (value as PricingType) ?? "freemium")
            }
          >
            <SelectTrigger id="pricing_type" className="w-full">
              <SelectValue placeholder="Pick pricing model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="freemium">Freemium</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

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
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
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
          />
        </Field>
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
      >
        {submitting ? "Submitting…" : "Submit tool"}
      </button>
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
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {help ? <p className="text-xs text-muted-foreground">{help}</p> : null}
    </div>
  );
}

function NextSteps({ onReset }: { onReset: () => void }) {
  return (
    <div className="space-y-6 rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Submission received
        </h2>
        <p className="text-muted-foreground">
          Thanks for the submission. We review every entry by hand, so expect a
          reply within 2 business days.
        </p>
      </div>

      <div>
        <h3 className="mb-2 font-medium">What happens next</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>We skim the description and check the product page.</li>
          <li>If it fits, we publish it under the right category.</li>
          <li>You get an email with a link to your live listing.</li>
        </ol>
      </div>

      <button
        type="button"
        onClick={onReset}
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Submit another tool
      </button>
    </div>
  );
}
