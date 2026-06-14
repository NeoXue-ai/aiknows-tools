import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="container mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
      <p className="mb-2 text-sm font-medium text-primary">404</p>
      <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        We couldn&apos;t find the page you were looking for. It may have been
        moved, renamed, or never existed.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
        Back to home
      </Link>

      <div className="mt-12 w-full border-t border-border pt-6">
        <p className="mb-3 text-sm text-muted-foreground">Or browse:</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/tools" className="hover:text-foreground/80">
            Tools
          </Link>
          <Link href="/directories" className="hover:text-foreground/80">
            Directories
          </Link>
          <Link href="/categories" className="hover:text-foreground/80">
            Categories
          </Link>
          <Link href="/latest" className="hover:text-foreground/80">
            Latest
          </Link>
          <Link href="/submit" className="hover:text-foreground/80">
            Submit
          </Link>
        </nav>
      </div>
    </div>
  );
}
