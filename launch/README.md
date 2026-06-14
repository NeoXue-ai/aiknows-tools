# Launch content for aiknows.tools

Pre-drafted launch posts. All content is hand-written, no AI fluff, tailored to each platform's culture.

## Files

| File | Platform | Format | Length |
| --- | --- | --- | --- |
| `x-thread.md` | X (Twitter) | 7-tweet thread | ~1,400 chars total |
| `indiehackers.md` | IndieHackers | Long-form post | ~600 words |
| `show-hn.md` | Hacker News | Show HN submission | ~400 words |
| `reddit.md` | r/SaaS, r/AItools, r/IndieHackers | 3 separate posts | ~100-200 words each |

## Post order (Day 1 → Day 3)

1. **Day 1, 9am PT** — X thread (T1 → T7, 5 min apart)
2. **Day 1, 12pm PT** — IndieHackers (post is timed for IH peak)
3. **Day 1, 6pm PT** — r/SaaS
4. **Day 2, 8am PT** — r/AItools
5. **Day 2, 12pm PT** — r/IndieHackers
6. **Day 2, 9pm PT** — Show HN (HN is most active US-PM)

## Tracking

- Use UTM params: `?utm_source=twitter`, `?utm_source=indiehackers`, etc.
- Add a single line to `app/page.tsx` header if you want to capture UTMs.
- (Not currently wired — see TODO in `lib/analytics.ts` if Plausible is set up.)

## Notes

- All posts link to `https://aiknows.tools` (set after custom domain is live).
- Before posting Show HN, double-check the title — HN is unforgiving of marketing-y titles.
- IndieHackers loves "here's what I learned" framing — keep the post humble.
- Reddit will downvote anything that smells like promotion. Each post leads with the **resource**, not the launch.
