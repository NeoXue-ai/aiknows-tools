# AIknows Design System

## Product direction

**Evidence-led Editorial Atlas — Map Legend**

AIknows is a calm, independent index for people choosing AI software. It should feel like a trustworthy map of an evolving landscape: editorial in voice, structured in layout, and explicit about what is known, inferred, or missing.

The intended lasting impression is: **“这是我能相信的 AI 工具地图。”**

Do not position the product as a launch feed, a generic marketplace, or a user-review platform.

## Principles

1. **Evidence over assertion.** Never imply a tool is human-reviewed, verified, popular, or recommended unless the displayed record supports it.
2. **Show information gaps.** Missing verification, pricing, category, or editorial fields are product facts, not UI defects to hide.
3. **Editorial entry, analytical depth.** Landing and collection pages set a clear point of view; tools and directories make comparison fast.
4. **Calm density.** Prefer an orderly index, tables, dossiers, and concise metadata over decorative card walls.
5. **Functional motion only.** Animation must clarify interaction or state change, not become ambient decoration.

## Visual language

### Composition

- Use an asymmetric editorial homepage: a left-aligned thesis and search entry, with a right-hand column of factual index records.
- Treat routes, collections, pages, and metadata like a map: route numbers, coordinate-like labels, hairline dividers, and clear hierarchy.
- Use cards only when they establish a meaningful bounded record. Prefer list rows and tables for comparison-heavy information.
- Keep the experience spacious, but allow dense evidence blocks and result lists where scan speed matters.

### Surfaces and colour

Use semantic tokens from `app/globals.css` rather than hardcoded colours in product components. The intended palette is:

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#F6F7F9` | `#0B1018` |
| Surface | `#FFFFFF` | `#121A26` |
| Ink | `#101725` | `#EDF2F7` |
| Muted text | `#667085` | `#8B96A7` |
| Active/link blue | `#2578F8` | `#2578F8` |
| Soft blue emphasis | `#E8F0FF` | `#1C3F78` |
| Confirmed data | green, reserved for factual positive states | green, reserved for factual positive states |
| Warning/missing | ochre, reserved for incomplete or pending data | ochre, reserved for incomplete or pending data |

- Blue is the navigational and active-state colour, not a broad surface treatment.
- Avoid gradients, purple branding, neon glows, and pure-white wordmarks in theme-aware UI.
- Rules and table separators should be subtle but readable. They are structural, not decorative.

### Typography

- **UI/body:** Geist.
- **Data, scores, timestamps, route labels:** Geist Mono.
- **Editorial display only:** Instrument Serif may be introduced for major homepage claims and collection titles after it is configured through `next/font`; do not use it for navigation, controls, tables, or the logo.
- **Logo:** Geist; the `AIknows` wordmark follows `text-foreground` and the blue mark follows the accent token.

Typography should feel precise and restrained. Use sentence case, direct labels, and no marketing superlatives without evidence.

### Spacing, borders, and interaction

- Use a stable page grid and 1px hairline rules to organize content.
- Prefer modest radii and surfaces with clear hierarchy; avoid pill-heavy or floating-card-heavy layouts.
- Interactive transitions: 150–220ms for colour, border, opacity, and small positional movement.
- Strong focus states are mandatory. Hover effects may use a subtle border change or 1–2px lift, never glow.
- Mobile filter controls may scroll horizontally but must preserve visible labels and active state.

## Information design

### Homepage

The homepage uses the Map Legend composition:

1. Index label and independent-index statement.
2. Clear editorial thesis: users can find the right AI tool and inspect why it belongs.
3. Prominent natural-language search entry.
4. Factual inventory counts only when derived from live data.
5. A right-side “field notes” record strip showing concise, realistic tool records and their evidence status.
6. A short score-basis note that states what the score is and is not.

Avoid centered, generic SaaS heroes and feature-card triptychs.

### Tool catalogue

- Default to an information-dense list or table-led index; cards remain an optional browsing mode.
- Search, task, pricing, and audience filters are visible and easy to reset.
- Show AIknows Score with a direct link or disclosure to its evidence basis.
- Use category, pricing, score, last-updated data, and explicit missing fields to support scanning.
- Never substitute invented popularity, ratings, review counts, freshness, or expert opinions.

### Tool detail dossiers

A detail page should read as an inspectable record:

- Product identity and concise description.
- Evidence Ledger: show each score contributor and its actual value.
- Clearly distinguish recorded evidence from absent evidence.
- Pricing and category information as facts, with an explicit absence state where applicable.
- Clear external-site action without obscuring the AIknows record.

The label **“AIknows Score”** describes an evidence summary, never a user rating or a quality guarantee.

### Collections and routes

Collections organize a builder’s real intent as a sequence of discovery steps, such as research, building, explaining, and distribution. They guide exploration but must not claim personalized recommendations.

### Directories

Directories should present their concrete properties separately: DR, submission type, link type, category, and last checked. Avoid collapsing heterogeneous facts into a vague “best” ranking.

### Trust language

Allowed when supported by data:

- “Recorded verification”
- “Editorial feature”
- “Pricing detail available”
- “Description completeness”
- “Information not yet recorded”

Disallowed unless independently substantiated:

- “Expert reviewed”
- “Most trusted”
- “Best tool”
- “Community favourite”
- Any implied user rating, popularity, or quality assurance

## Implementation guardrails

- Derive all trust UI from existing source fields. Do not add visual claims that the data model cannot support.
- Verify aggregate counts and field coverage before displaying them in production UI.
- Reuse established Tailwind tokens and shared components before creating page-specific visual systems.
- Keep dark and light themes equivalently legible.
- Test desktop and mobile browser states for every visible UI change.

## Review checklist

Before accepting a visual change, confirm:

- It reinforces AIknows as an evidence-led index rather than a generic directory.
- Every trust signal has a real data source.
- Missing data remains visible where it materially affects a decision.
- The hierarchy works in dark and light themes.
- Lists and tables are more useful than cards where comparison is the primary job.
- The result has no decorative gradients, purple brand treatment, continuous glow, or unnecessary animation.
