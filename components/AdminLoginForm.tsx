"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { OAuthButton } from "./OAuthButton";

interface AdminLoginFormProps {
  next?: string;
}

export function AdminLoginForm({ next = "/admin" }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    try {
      const supabase = createClient();
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        console.error("[login] otp error:", error);
        toast.error(error.message || "Could not send login link");
        return;
      }
      setSent(true);
      toast.success("Check your email for the login link");
    } catch (err) {
      console.error("[login] unexpected:", err);
      toast.error("Could not send login link");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border bg-card p-6 text-card-foreground">
        <p className="font-medium">Check your email</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a magic link to <strong>{email}</strong>. Click it to sign in
          to aiknows.tools. The link expires in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <OAuthButton provider="google" next={next} />
        <OAuthButton provider="github" next={next} />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending}
          />
          <p className="text-xs text-muted-foreground">
            We&apos;ll email you a one-time sign-in link.
          </p>
        </div>
        <button
          type="submit"
          disabled={sending}
          className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
        >
          {sending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          {sending ? "Sending…" : "Send login link"}
        </button>
      </form>
    </div>
  );
}
