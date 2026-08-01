"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="mb-2 text-sm font-medium text-destructive">
        Something went wrong
      </p>
      <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        We hit a snag
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        An unexpected error occurred while loading this page. Please try again,
        or head back to the homepage.
      </p>
      {error.digest ? (
        <p className="mb-8 rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Try again
        </button>
        <Link
          href="/"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
