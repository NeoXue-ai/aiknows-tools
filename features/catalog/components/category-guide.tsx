import Link from "next/link";
import { CATEGORY_GUIDES } from "../category-guides";
export function CategoryGuideSection({ slug }: { slug: string }) {
  const guide = CATEGORY_GUIDES[slug];
  if (!guide) return null;
  return (
    <section
      className="mb-10 space-y-8 rounded-2xl border border-border bg-card p-6 sm:p-8"
      aria-labelledby="category-guide-title"
    >
      <div>
        <h2
          id="category-guide-title"
          className="text-2xl font-semibold tracking-tight"
        >
          How to choose
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
          {guide.introduction}
        </p>
      </div>
      <dl className="grid gap-6 md:grid-cols-3">
        {guide.criteria.map((item) => (
          <div key={item.label}>
            <dt className="font-medium">{item.label}</dt>
            <dd className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.text}
            </dd>
          </div>
        ))}
      </dl>
      <div>
        <h3 className="font-semibold">Common questions</h3>
        <div className="mt-3 divide-y divide-border">
          {guide.faqs.map((item) => (
            <details key={item.question} className="py-3">
              <summary className="cursor-pointer text-sm font-medium">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
      <nav
        aria-label="Related tool categories"
        className="flex flex-wrap gap-3"
      >
        {guide.related.map((item) => (
          <Link
            key={item.slug}
            href={`/categories/${item.slug}`}
            className="text-sm text-accent hover:underline"
          >
            {item.label} →
          </Link>
        ))}
      </nav>
    </section>
  );
}
