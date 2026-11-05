![deck-builder-main: who the hell wants to download a PDF?](docs/images/banner.png)

# deck-builder-main

**A deck that's a link, not a file.**

**Try it live: <https://deck-builder-main.vercel.app/deck-builder>**

Short version: [ESSENCE.md](ESSENCE.md). How it got built: [EVOLUTION.md](EVOLUTION.md).

You send one URL. It opens as a slide deck on a laptop and a long scroll on a phone, and whoever's looking can flip between the two. When you change something and push, the update lands on every open tab without a reload, on the slide it was on. That includes the tab you're sharing on a call.

## Why I made it

I think decks are archaic and dumb. I'd rather send people a link, because who the hell wants to download a PDF?

A PDF is dead the second you hit send. There's a typo on slide 9, the numbers moved, and now there's a `final_v3_ACTUAL.pdf` going around while the old one lives forever in somebody's inbox. I wanted a deck I can push updates to, even while I'm presenting to a client. They say "can you change that?" and I change it, and it changes in front of them.

## How to use it

It's a Next.js app and your content is code. There's no editor UI: you (or your agent) edit files and push. Every step below is written so an agent can follow it.

**1. Clone it and run it**

You need Node 20.9 or newer. Fork the repo on GitHub if you want to keep your deck there, and clone your fork.

```bash
git clone https://github.com/fidgetcoding/deck-builder-main.git my-deck
cd my-deck
npm install
npm run dev
```

Open <http://localhost:3000/deck-builder>.

**2. Make it yours (don't skip this)**

Open `src/lib/brand.ts`. The sample ships wired to Lorecraft's name, email and booking link, so until you change them your clients will be booking calls with a stranger. Set `name`, `tagline`, `accent` (any CSS color), `contactEmail`, `bookingUrl`, `signerName`, `signerTitle`, `client`, `coverHeadline` and `coverSubtitle`. No scheduling page? Leave `bookingUrl` empty and Contact emails you instead.

Then swap your logo into `public/wmark.svg`, plus `public/favicon.png`, `public/favicon.ico`, `public/apple-touch-icon.png` and `public/social.png`. The logo sits on a dark background.

**3. Write the deck**

The two views are written separately, so edit both:

| View | Where the copy lives |
|---|---|
| Deck | `src/components/deck-template/slides/` |
| Scroll | `src/components/proposal/brands.ts` |

Each slide is its own `.tsx` file, not a template fill-in, so a slide can look like whatever it needs to. To add, remove or reorder slides, edit `src/components/deck-template/slidesRegistry.tsx`. Keep your words in the slides and in `brands.ts`, because those are what can swap in without the page loading again. A slide that needs a click handler or state should pull in a small `"use client"` component for that part, the way `SlideCover` uses `CoverArrow`. In the scroll view, any section you leave empty doesn't render. To drop the striped placeholder boxes, set `placeholderMode: false`.

The easiest way to add a slide is to copy one that's close, then add a line for it in `slidesRegistry.tsx`. Give it a `section` and it shows up in the top bar, or use `null` to leave it out. Start from an existing slide's outer `<section>`, because its classes are what let a long slide scroll on a phone. The section labels in the scroll view are in `brands.ts` too, under `sectionTitles`.

The tests and CI come along with your copy. They check the product rather than the sample words, so rewriting everything and changing the slide count won't turn them red.

**4. Deploy it**

Push your copy to your own GitHub repo, then import that repo at [vercel.com/new](https://vercel.com/new). No environment variables needed. From then on, every push to `main` deploys.

Vercel's the path I'd take, but anything that can run `npm run build && npm start` will do. Off Vercel, set `NEXT_PUBLIC_SITE_URL` to your address so link previews point at the right place.

**5. Lock it, if you want**

The lock is off by default. Add a `DECK_PASSCODE` environment variable in your Vercel project and redeploy, and everyone gets a passcode screen first. Tabs that are already open go to it too, and come back to the same slide after the code. To turn it off, delete the variable and redeploy. To try it locally, run `DECK_PASSCODE=something npm start` after a build.

**6. Send the link**

```
https://your-project.vercel.app/deck-builder
```

Use your production URL, not a one-off deployment URL. Those are frozen in time, so they'd never update.

You can also point people straight at a spot: `?view=scroll` opens the scroll view and `?view=deck#4` opens slide 4.

**7. Push updates, even mid-call**

```bash
git commit -am "fix the number on slide 4"
git push
```

Vercel builds it, and the update lands on every open tab without a reload, right where the viewer is. Nobody has to refresh anything.

I timed this on the live demo: 3 pushes, 6 tabs open each time, across Chromium, Firefox and WebKit at desktop and phone sizes, with one of them sitting on an open booking modal. From `git push` to the edit on screen took 19 to 32 seconds, with a median of 23, and most of that is Vercel building. None of the 18 tabs reloaded, and the modal stayed open. So it's "give me half a minute," and a bigger deck will take longer.

An edit to your words, slides, brand values or styles swaps in where the viewer already is. The page doesn't load again, so they keep their slide and scroll position, and an open booking modal or half-typed text stays exactly as it was.

The one exception is a push that changes code running in the browser, like an interactive component or a dependency. An open tab can't swap its own code, so that one does load the page again. It waits until nobody's in the booking modal or watching a video with the sound on, and the server renders the new page already on the right slide, so it doesn't flash.

## What's in it

- **Two views, one URL.** Laptops open on the deck, phones open on the scroll, and a toggle flips between them.
- **Live updates.** Open tabs check for a new build every 3 seconds and swap new content in where the viewer is, with nothing else on the page changing. Hidden tabs stop checking until they're looked at again. If a check fails mid-deploy, or the server's still handing out the old page, nothing happens and they try again.
- **An optional passcode.** Checked on the server for every request, so nothing of your deck leaves without the code.
- **Deck navigation.** Arrow keys, Page Up and Down, Home and End, trackpad or mouse wheel, swipe, a numbered section bar, and a slide tray (press the up arrow). The on-screen arrows on desktop advance when you hover over them, no click needed. On a small screen, a long slide scrolls inside itself.
- **Twelve starter slides.** Cover, ten layouts (text and image, three pillars, a big statement, pricing tiers, full bleed and so on) and a next steps slide.
- **A scroll view with some manners.** Contents list, a letter up top, video and image sections, and a call to action at the bottom.
- **A booking modal.** Your scheduling link opens inside the deck, so nobody has to leave it.
- **Shareable spots.** The current slide and view live in the URL.
- **Stays out of search.** `robots.txt` and `noindex` tags ask search engines and AI crawlers to leave it alone.
- **Works from the keyboard.** Every control is reachable and visible when focused, the booking modal holds focus, slide changes are announced to screen readers, and reduced-motion settings turn the fades off.
- **Copes with bad connections.** The link paints straight away on a slow connection and is readable with no JavaScript at all. Open tabs ride out a dropped connection and catch up when it's back.

## Good to know

- **Without a passcode, the link is the only lock.** Anyone who has the URL can read the deck, and "Confidential" on a slide is just a word. With one, it's still a single shared code, with no accounts, no lockout and no real limit on guessing, so make it long and random. See [SECURITY.md](SECURITY.md).
- **Phones start on the scroll view.** It reads better on a small screen, but deck view works too, and nothing gets cut off.
- **Printing:** if somebody really needs a PDF, either view gives you the whole thing. The deck view prints every slide, one to a page, wherever you were. With the app running, `npm run pdf:export -- --url "http://localhost:3000/deck-builder?view=deck"` writes `out/deck.pdf` (run `npx playwright install chromium` once first). On a locked deck, set `DECK_PASSCODE` when you run it. Pages are 1920 by 1080, so a slide taller than that gets cut off on paper. I've only checked the PDF output in Chromium.
- **Light theme:** set `theme: "light"` in `brands.ts` for a light scroll view, along with light `bg`, dark `fg` and dark `muted`. Only the scroll view changes: the deck view, the top bar and the view toggle stay dark. It uses `public/wmark-dark.svg` for the logo.
- **Analytics:** Vercel Analytics is wired in. Turn it on in your Vercel project, or delete `<Analytics />` from `src/app/layout.tsx`. Until then you'll see a harmless 404 for its script in the console.
- **Polling:** each open tab makes one tiny request every 3 seconds. The CDN answers it from a file made at build time, so it doesn't wake a function, but it still counts as a request: about 29,000 a day for a tab left open and visible all day. To change the pace, edit `POLL_MS` in `src/components/DeckUpdateWatcher.tsx`.
- **Types aren't checked on Vercel:** the typecheck is the one slow build step I could cut, so Vercel skips it and CI runs it on every push. A push with a type error can still go live, so watch CI if you're changing code rather than copy.
- **Vercel Skew Protection:** it's on by default for new projects on Vercel's Pro plan, and all my timings ran with it on. It would normally tie a tab's refreshes to the deployment it loaded from, so for a content swap the deck deliberately asks for the newest one.
- **What I haven't tried:** real phones, Safari itself, and a real screen reader. The tests use Playwright's browser engines and an automated accessibility scan, which can't tell you how it actually sounds.

## Tests

```bash
npm run lint
npx playwright install chromium   # once
npm run test:e2e                  # builds first, then tests the real build
```

Ports 3000 and 3001 taken? Run `PORT=3457 npm run test:e2e`. To run them in Firefox and WebKit too, install those browsers and set `ALL_BROWSERS=1`.

## More

- [ESSENCE.md](ESSENCE.md)
- [EVOLUTION.md](EVOLUTION.md)
- [SECURITY.md](SECURITY.md)
- [LICENSE](LICENSE) (MIT)
