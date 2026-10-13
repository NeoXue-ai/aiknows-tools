import Link from "next/link";
import type { Tool } from "../types";
export function ToolGuideSections({
  tool,
  tools,
}: {
  tool: Tool;
  tools: Tool[];
}) {
  const guide = tool.editorial?.guide;
  if (!guide) return null;
  return (
    <>
      {[
        {
          id: "sec-features",
          heading: `What can ${tool.name} do?`,
          items: guide.features,
        },
        {
          id: "sec-use-cases",
          heading: "Who is it for?",
          items: guide.useCases,
        },
      ].map((section) => (
        <section id={section.id} key={section.id} className="scroll-mt-24">
          <h2 className="text-xl font-semibold tracking-tight">
            {section.heading}
          </h2>
          <dl className="mt-4 grid gap-5 sm:grid-cols-2">
            {section.items.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-card p-4"
              >
                <dt className="font-medium">{item.label}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <section id="sec-pricing" className="scroll-mt-24">
        <h2 className="text-xl font-semibold tracking-tight">
          Pricing and access
        </h2>
        <p className="mt-4 leading-7">{guide.pricingNote}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Platforms: {guide.platforms.join(" · ")}
        </p>
        <a
          href={guide.pricingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-sm font-medium text-accent underline underline-offset-4"
        >
          Check official plans and limits ↗
        </a>
      </section>
      <section id="sec-limitations" className="scroll-mt-24">
        <h2 className="text-xl font-semibold tracking-tight">
          Things to consider
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
          {guide.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section id="sec-alternatives" className="scroll-mt-24">
        <h2 className="text-xl font-semibold tracking-tight">
          Alternatives to {tool.name}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Compare the workflow and limits that matter for your task.
        </p>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {guide.alternatives.map((item) => {
            const candidate = tools.find((t) => t.slug === item.slug);
            return candidate ? (
              <li key={item.slug} className="py-4">
                <Link
                  href={`/tools/${candidate.slug}`}
                  className="font-medium text-accent hover:underline"
                >
                  {candidate.name} →
                </Link>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.reason}
                </p>
              </li>
            ) : null;
          })}
        </ul>
      </section>
      <section className="border-t border-border pt-6">
        <h2 className="text-base font-semibold">Sources and fact check</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Official product information checked on{" "}
          <time dateTime={guide.checkedAt}>{guide.checkedAt}</time>. This guide
          is based on published documentation; plans and features may change.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-4"
              >
                {source.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
