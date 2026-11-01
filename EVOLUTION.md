# deck-builder-main: how it got here

## Short version

A deck should be a link, and the link should be able to change while people are looking at it. That's the whole idea. This repo started with fresh history on 2026-11-01, so what's here is the product's story from that day on, commit by commit. I built those rounds with Claude Code. The first public version checked for updates every 15 seconds, flashed when one landed, cut off long slides on a phone and printed one slide at a time. Then I timed it on a real deploy, which turned up a bug the tests couldn't see. By the end of the day an update showed up about 24 seconds after a push, on the slide you were already on.

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

## Test log

| Check | Result |
|---|---|
| `67892a0`: Playwright | 10 of 10 |
| Fixed build: push to visible edit, 3 pushes, 6 tabs each | Median 23.7 s, range 21.8 to 29.8 s |
| Browsers in the timing runs | Chromium, Firefox, WebKit, at desktop and phone sizes |
| `25994dc`: Playwright | 34 of 34 |
| Deck view PDF, 12 starter slides | 12 pages |

About 20 of the seconds in that median are Vercel building, so a bigger deck takes longer. CI on `main` runs lint, the build and the full Playwright suite on every push. You can read the runs on the repo's Actions tab, and you can try the update yourself by deploying your own copy.

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
