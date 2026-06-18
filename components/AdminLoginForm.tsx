"use client";

import { OAuthButton } from "./OAuthButton";

interface AdminLoginFormProps {
  next?: string;
}

export function AdminLoginForm({ next = "/admin" }: AdminLoginFormProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Continue with Google or GitHub. No password needed.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <OAuthButton provider="google" next={next} />
        <OAuthButton provider="github" next={next} />
      </div>
    </div>
  );
}
