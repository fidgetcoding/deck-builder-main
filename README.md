<!-- banner goes here -->

# deck-builder-main

**A deck that's a link, not a file.**

You send one URL. It opens as a slide deck on a laptop and a long scroll on a phone, and whoever's looking can flip between the two. When you change something and push, every open tab picks it up on its own and stays on the slide it was on. That includes the tab you're sharing on a call.

## Why I made it

I think decks are archaic and dumb. I'd rather send people a link, because who the hell wants to download a PDF?

A PDF is dead the second you hit send. There's a typo on slide 9, the numbers moved, and now there's a `final_v3_ACTUAL.pdf` going around while the old one lives forever in somebody's inbox. I wanted a deck I can push updates to, even while I'm presenting to a client. They say "can you change that?" and I change it, and it changes in front of them.

## How to use it

It's a Next.js app and your content is code. There's no editor UI: you (or your agent) edit files and push. Every step below is written so an agent can follow it.

**1. Clone it and run it**

```bash
git clone <this repo> my-deck
cd my-deck
npm install
npm run dev
```

Open <http://localhost:3000/deck-builder>.

**2. Make it yours (don't skip this)**

Open `src/lib/brand.ts`. The sample ships wired to Lorecraft's name, email and booking link, so until you change them your clients will be booking calls with a stranger. Set `name`, `tagline`, `accent`, `contactEmail`, `bookingUrl`, `signerName`, `signerTitle`, `client`, `coverHeadline` and `coverSubtitle`.

Then swap your logo into `public/wmark.svg`, plus `public/favicon.png`, `public/favicon.ico`, `public/apple-touch-icon.png` and `public/social.png`.

**3. Write the deck**

The two views are written separately, so edit both:

| View | Where the copy lives |
|---|---|
| Deck | `src/components/deck-template/slides/` |
| Scroll | `src/components/proposal/brands.ts` |

Each slide is its own `.tsx` file, not a template fill-in, so a slide can look like whatever it needs to. To add, remove or reorder slides, edit `src/components/deck-template/slidesRegistry.tsx`. In the scroll view, any section you leave empty doesn't render. To drop the striped placeholder boxes, set `placeholderMode: false`.

**4. Deploy it**

Push your copy to your own GitHub repo, then import that repo at [vercel.com/new](https://vercel.com/new). No environment variables needed. From then on, every push to `main` deploys.

Vercel's the path I'd take, but anything that can run `npm run build && npm start` will do.

**5. Send the link**

```
https://your-project.vercel.app/deck-builder
```

Use your production URL, not a one-off deployment URL. Those are frozen in time, so they'd never update.

You can also point people straight at a spot: `?view=scroll` opens the scroll view and `?view=deck#4` opens slide 4.

**6. Push updates, even mid-call**

```bash
git commit -am "fix the number on slide 4"
git push
```

Vercel builds it. Once the new version's live, every open tab notices within about 15 seconds, reloads itself, and lands back on the same slide or scroll position. Nobody has to refresh anything.

Be honest with yourself about the timing: the update takes your build time plus up to 15 seconds, so it's "give me a minute," not instant. It's also a real page reload, so viewers see a quick flash and the slide fades back in.

## What's in it

- **Two views, one URL.** Laptops open on the deck, phones open on the scroll, and a toggle flips between them.
- **Live updates.** Open tabs check for a new build every 15 seconds and reload in place. They won't do it while someone's in the booking modal or watching a video with the sound on, and they try again once that's done. Hidden tabs stop checking until they're looked at again. If a check fails mid-deploy, nothing happens and it tries again.
- **Deck navigation.** Arrow keys, Page Up and Down, Home and End, trackpad or mouse wheel, swipe, a numbered section bar, and a slide tray (press the up arrow). The on-screen arrows on desktop advance when you hover over them, no click needed.
- **Twelve starter slides.** Cover, ten layouts (text and image, three pillars, a big statement, pricing tiers, full bleed and so on) and a next steps slide.
- **A scroll view with some manners.** Contents list, a letter up top, video and image sections, and a call to action at the bottom.
- **A booking modal.** Your scheduling link opens inside the deck, so nobody has to leave it.
- **Shareable spots.** The current slide and view live in the URL.
- **Stays out of search.** `robots.txt` and `noindex` tags ask search engines and AI crawlers to leave it alone.

## Good to know

- **The link is the only lock.** No password, no login. Anyone who has the URL can read the deck, and "Confidential" on a slide is just a word. See [SECURITY.md](SECURITY.md).
- **Phones want the scroll view.** That's why it's the default. Deck view on a phone cuts off the longer slides.
- **Printing:** if somebody really needs a PDF, the scroll view prints the whole thing. With the app running, `npm run pdf:export -- --url "http://localhost:3000/deck-builder?view=scroll"` writes `out/deck.pdf` (run `npx playwright install chromium` once first). The deck view only prints the slide you're on. Sorry, not sorry.
- **Analytics:** Vercel Analytics is wired in. Turn it on in your Vercel project, or delete `<Analytics />` from `src/app/layout.tsx`. Until then you'll see a harmless 404 for its script in the console.
- **Polling:** each open tab makes one tiny request every 15 seconds, so a deck someone leaves open all day does count against your host's usage. To change the pace, edit `POLL_MS` in `src/components/DeckUpdateWatcher.tsx`.
- **Vercel Skew Protection:** it's off by default, and I haven't tested live updates with it on. It pins open tabs to the deployment they loaded from, so try it before you trust it mid-call.

## Tests

```bash
npm run lint
npm run build
npx playwright install chromium   # once
npm run test:e2e
```

Port 3000 taken? Run `PORT=3457 npm run test:e2e`.

## More

- [ESSENCE.md](ESSENCE.md)
- [EVOLUTION.md](EVOLUTION.md)
- [SECURITY.md](SECURITY.md)
- [LICENSE](LICENSE) (MIT)
