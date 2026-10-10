"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[768px] flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
      <p className="mb-2 text-sm font-medium text-destructive">
        Something went wrong
      </p>
      <h1 className="mb-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        We hit a snag
      </h1>
      <p className="mb-8 max-w-md text-base leading-7 text-muted-foreground">
        An unexpected error occurred while loading this page. Please try again,
        or head back to the homepage.
      </p>
      {error.digest ? (
        <p className="mb-8 max-w-full break-all rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="action-primary"
        >
          Try again
        </button>
        <Link
          href="/"
          className="action-secondary"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
