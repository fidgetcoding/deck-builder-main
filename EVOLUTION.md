# deck-builder-main: how it got here

## Short version

A deck should be a link, and the link should be able to change while people are looking at it. That's the whole idea. This repo started with fresh history on 2026-11-01, so what's here is the product's story from that day on, commit by commit. I built those rounds with Claude Code. The first public version checked for updates every 15 seconds, flashed when one landed, cut off long slides on a phone and printed one slide at a time. Then I timed it on a real deploy, which turned up a bug the tests couldn't see. The last round got me what I wanted: by the end of the day an update landed on open tabs without a reload, about 22 seconds after a push, right where the viewer was. The one exception is a push that changes code running in the browser, which still loads the page again. Then I forked it fresh and rewrote every word, to find what a stranger would trip over.

## Origin, in my words

"I think decks are archaic and dumb. I'd rather send people a link, because who the hell wants to download a PDF?"

"A PDF is dead the second you hit send."

"I wanted a deck I can push updates to, even while I'm presenting to a client. They say 'can you change that?' and I change it, and it changes in front of them."

All three are from the README.

## Timeline

Every date is 2026-11-01. Times are Gulf Standard Time.

| Time | Commit | What happened |
|---|---|---|
| 12:18 | `67892a0` | Fresh public history: "a deck that's a link, not a file" |
| 13:14 | `a140902` | CI runs on Ubuntu 26.04, Playwright bumped to 1.64 |
| 16:35 | `beae36d` | Updates land without a flash, optional lock, phones fit, deck view prints |
| 16:40 | `f7b66b4` | Two timing-sensitive tests stop racing the browser |
| 16:47 | `2a11e88` | Touch scrolling tested with raw touch events |
| 16:50 | `43f0f1b` | First timed run on the live Vercel deploy |
| 17:12 | `38cbe97` | An open tab can't get stuck on an old build |
| 17:15 | `68301f3` | Timed again on the fixed build |
| 17:32 | `25994dc` | README documents the lock, the measured time and the live demo |
| 17:39 | `f2f9e0e` | Playwright stays silent and headless in every browser |
| 17:46 | `850cee6` | Content updates swap in place, with no reload |
| 17:54 | `24af99d` | Vercel builds skip the typecheck, and a removed slide can't break an open tab |
| 17:58 | `0b8583b` | README says which pushes land in place and which one loads the page |
| 18:03 | `1c38b17` | Menu hover responds to a real mouse only |
| 18:08 | `96e9918` | Timed in-place updates on the live demo |
| 18:12 | `fa9a19a` | README gets the measured in-place time |
| 18:38 | `3098732` | Fixes for what a fresh fork trips over |
| 18:41 | `f632e7c` | Leftover dark accent token removed |

## Round by round

**Round 1: one link, two views (`67892a0`).**
Built: a deck view and a scroll view on one route, with the view in `?view=` and the slide in the URL hash. `DeckUpdateWatcher` and `/api/deck-version`: a build stamps an ID, and open tabs ask for it every 15 seconds. `viewerIsBusy()` holds an update while someone's in the booking modal or watching a video with the sound on.
Tested: 10 Playwright tests, which fake a deployment by answering the version check in the browser.
Broke: `ubuntu-latest` moved to 26.04 and Playwright 1.59 couldn't install its browser there.
Fixed: `a140902`.
What came next: the things the first README had to admit. A flash when an update landed, long slides cut off on a phone, and printing only the current slide.

**Round 2: land it clean (`beae36d`).**
Built: tabs now move to a URL the server can paint already in place, with the new build warmed first, so nothing fades or blanks. `DECK_PASSCODE` locks every response, including the JavaScript chunks that hold slide copy. Long slides scroll on small screens. The deck view prints every slide. The version check is prerendered, so checking every 5 seconds never wakes a function.
Tested: the suite grew, with a new `tests/lock.spec.ts`.
Broke: two timing-sensitive tests raced the browser, and the synthetic touch gesture didn't scroll anything on Linux.
Fixed: `f7b66b4`, `2a11e88`.
What came next: timing it for real.

**Round 3: push to a real deploy (`43f0f1b`, `268412f`).**
Tested: real pushes to the live demo, with tabs open and watching. This is the test the fake deployments can't do.
Broke: one tab landed back on the old page and stayed there, because it trusted the first version it was told.
Fixed: `38cbe97`. Pages now carry the build that rendered them, a tab compares that to the live build, and it only moves once the server is really serving the new page.
Then: timed again on the fixed build (`68301f3`, `083e2b5`), and put the sample copy back (`5e59250`).
What came next: the update still loaded the page. I wanted it to land without a reload.

**Round 4: no reload (`850cee6`).**
Built: slide copy and brand values now render on the server, so a copy edit changes no browser JavaScript. An open tab fetches the new page and, if it needs no script the tab hasn't already loaded, swaps the content in where the viewer is. Tabs check every 3 seconds. Slides are now Server Components, and a slide that needs a click pulls in a small client component. The swap relies on Next internals, rewriting one request header and one response header. If Next changes those, it falls back to loading the page again.
The exception: a push that changes browser JavaScript still loads the page again, because an open tab can't swap its own code. It waits until nobody's in the booking modal or watching a video with the sound on, and it keeps your place. `0b8583b` says so in the README.
Broke: the typecheck was slowing Vercel builds, and a removed slide could trip up an open tab. Fixed in `24af99d`, with CI still running the typecheck on every push. A tap's fake hover events raced the click and closed the phone menu about 10% of the time on Linux. That's what failed CI at `f2f9e0e`. Fixed in `1c38b17`, then 120 of 120 runs passed in a Linux container with the test unchanged.
Tested: real pushes to the live demo (`96e9918`, `a8abeac`), then the sample copy put back (`b49b86b`). 18 of 18 tabs got the update, 0 reloaded, and an open modal and scroll position survived.

**Round 5: be a stranger (`3098732`, `f632e7c`).**
Tested: a clean clone turned into a throwaway fork, with every word rewritten, deployed to Vercel.
Broke, all of it stuff a stranger would have hit:
- Editing the sample copy turned the fork's CI red, because the tests checked my words.
- Deep links jumped to slide 1 in dev.
- Pink brands kept green stripes, and the light theme ignored the accent.
- Contact opened an empty modal when there was no booking link.
- The README said empty sections don't render, and that was false.
- Section labels couldn't be edited from `brands.ts`.
- The PDF export printed the lock screen and reported success.
- Open tabs sat stale when the lock changed.
Fixed: tests now check the product, so a fork stays green. `accent` takes any CSS color and reaches everything. An empty `bookingUrl` means Contact emails you. Empty sections really don't render, including Letter and Capabilities. Labels live in `brands.ts` under `sectionTitles`. `pdf:export` on a locked deck needs the passcode and fails without one. Turning the lock on or changing the code sends open tabs to the form, and they come back to the same slide.

## Test log

| Check | Result |
|---|---|
| `67892a0`: Playwright | 10 of 10 |
| `38cbe97` build: push to visible edit, 3 pushes, 6 tabs each | Median 23.7 s, range 21.8 to 29.8 s, page loaded again |
| `25994dc`: Playwright | 34 of 34 |
| In-place build: push to visible edit, 3 pushes, 6 tabs each | Median 21.7 s, range 18.3 to 27.7 s |
| In-place build: live to visible | Median 2.6 s, down from 3.4 s |
| In-place build: tabs that got the update | 18 of 18, 0 reloads |
| In-place build: open modal and scroll position | Survived |
| Browsers in the timing runs | Chromium, Firefox, WebKit, at desktop and phone sizes |
| `fa9a19a`: Playwright | 39 of 39 |
| `f632e7c`: Playwright | 49 of 49 |
| Fresh fork, every word rewritten: Playwright | 46 passed, 3 skipped (modal tests with no booking link) |
| Fresh fork on Vercel, `vercel deploy`: copy edit | Landed in 26 s, an interactive slide kept its state |
| Fresh fork on Vercel, `vercel deploy`: added slide | Landed in place in 22 s |
| Fresh fork on Vercel: passcode on and off through a real env var | Worked |
| Fresh fork: deck view PDF | 11 pages |
| Deck view PDF, 12 starter slides | 12 pages |

Most of that time is Vercel building, so a bigger deck takes longer. The fresh fork numbers came from `vercel deploy` on the CLI, not `git push`, so they aren't part of the 21.7 s median. CI on `main` runs lint, the build and the full Playwright suite on every push. You can read the runs on the repo's Actions tab, and you can try the update yourself by deploying your own copy.

## Roads not taken

- **An editor UI.** Content is code, so you or your agent do the editing.
- **Websockets or a server pushing updates.** Tabs poll a file made at build time. It's a tiny request that never wakes a function.
- **Accounts.** The lock is one shared passcode, and it's off by default. There's no database. The one API route returns a build ID and takes no input.
- **Killing the PDF outright.** `npm run pdf:export` writes one from either view for whoever really needs it.

## What's next

Real phones and Safari itself. The tests and timings so far use Playwright's browser engines.

## Sources

- The commits named above, on `fidgetcoding/deck-builder-main`.
- `README.md`, `SECURITY.md`, `src/components/DeckUpdateWatcher.tsx`, `src/proxy.ts`, `tests/deck.spec.ts`, `tests/lock.spec.ts`.
- Live demo: <https://deck-builder-main.vercel.app/deck-builder>
