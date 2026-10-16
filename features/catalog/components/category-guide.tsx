import Link from "next/link";
import type { CategoryGuide } from "../category-guide-types";

export function CategoryGuideSection({
  slug,
  name,
  guide,
  availableSlugs,
}: {
  slug: string;
  name: string;
  guide: CategoryGuide;
  availableSlugs?: ReadonlySet<string>;
}) {
  const related = guide.related.filter(
    (item) => !availableSlugs || availableSlugs.has(item.slug),
  );
  return (
    <section
      id="category-guide"
      className="mb-10 space-y-10 border-t border-border pt-10"
      aria-labelledby="category-guide-title"
      data-category-guide={slug}
    >
      <div>
        <h2
          id="category-guide-title"
          className="text-2xl font-semibold tracking-tight"
        >
          About {name}
        </h2>
        <p className="mt-4 max-w-3xl text-[15px] leading-7 text-muted-foreground">
          {guide.introduction}
        </p>
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Capabilities to compare
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Availability varies by product and plan. Use these features to shape
          your shortlist.
        </p>
        <ul className="mt-4 grid list-disc gap-x-10 gap-y-3 pl-5 text-sm leading-7 text-muted-foreground md:grid-cols-2">
          {guide.capabilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Who these tools are for
        </h2>
        <dl className="mt-4 grid gap-6 md:grid-cols-2">
          {guide.audiences.map((item) => (
            <div key={item.label}>
              <dt className="font-medium">{item.label}</dt>
              <dd className="mt-2 text-sm leading-7 text-muted-foreground">
                {item.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          How to choose: {name}
        </h2>
        <dl className="mt-4 grid gap-6 md:grid-cols-3">
          {guide.criteria.map((item) => (
            <div key={item.label}>
              <dt className="font-medium">{item.label}</dt>
              <dd className="mt-2 text-sm leading-7 text-muted-foreground">
                {item.text}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          A practical workflow
        </h2>
        <ol className="mt-4 max-w-3xl list-decimal space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
          {guide.workflow.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          {name}: common questions
        </h2>
        <div className="mt-4 divide-y divide-border">
          {guide.faqs.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="cursor-pointer text-[15px] font-medium leading-6">
                <h3 className="inline font-medium">{item.question}</h3>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
      {related.length > 0 && (
        <nav
          aria-label="Related tool categories"
          className="border-t border-border pt-6"
        >
          <h2 className="text-lg font-semibold">Explore related categories</h2>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/categories/${item.slug}`}
                className="text-sm text-accent hover:underline"
              >
                {item.label} →
              </Link>
            ))}
          </div>
        </nav>
      )}
    </section>
  );
}
