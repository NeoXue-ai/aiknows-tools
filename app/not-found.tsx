import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[768px] flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
      <p className="mb-2 text-sm font-medium text-primary">404</p>
      <h1 className="mb-4 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-base leading-7 text-muted-foreground">
        We couldn&apos;t find the page you were looking for. It may have been
        moved, renamed, or never existed.
      </p>
      <Link href="/" className="action-primary">
        Back to home
      </Link>

      <div className="mt-12 w-full border-t border-border pt-6">
        <p className="mb-3 text-sm text-muted-foreground">Or browse:</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/tools" className="hover:text-foreground/80">
            Tools
          </Link>
          <Link href="/collections" className="hover:text-foreground/80">
            Routes
          </Link>
          <Link href="/categories" className="hover:text-foreground/80">
            Categories
          </Link>
          <Link href="/submit" className="hover:text-foreground/80">
            Submit
          </Link>
        </nav>
      </div>
    </div>
  );
}
