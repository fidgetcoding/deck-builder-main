# deck-builder-main: the essence

**Try it live: <https://deck-builder-main.vercel.app/deck-builder>**

**What it is.** A deck that's a link. One URL opens as slides on a laptop and as a long scroll on a phone. When you push a change, the update lands on every open tab without a reload, on the slide it was on.

**Who it's for.** Anyone who sends decks and would rather send a link, and who's fine with their deck being code. There's no editor. You or your agent edit files and push.

**Why it exists.** I think decks are archaic and dumb. Who the hell wants to download a PDF? A PDF is dead the second you hit send. I wanted a link I can push updates to, even while I'm presenting. They say "can you change that?" and I change it, and it changes in front of them.

**What's different.**

- One link, two views, and nobody has to pick. Laptops land on the deck, phones land on the scroll, and a toggle flips between them.
- The tab you're sharing on a call updates itself, without a reload. An update shows up about 22 seconds after you push, right where the viewer is, and the only thing that changes on screen is your edit. Slide words, brand values, styles and added or removed slides all swap in place.
- There's one exception. A push that changes code running in the browser does load the page again. It waits until nobody's in the booking modal or watching a video with the sound on, and it keeps your place.
- It has manners. Someone mid-booking keeps their open modal, a reader keeps their scroll position, and a failed check mid-deploy does nothing.
- There's an optional lock. Set `DECK_PASSCODE` and nothing of your deck leaves the server until someone enters the code. Turn it on while a tab's open and that tab goes to the form, then comes back to the same slide.
- It's built to be forked. Rewrite every word and change the slide count, and the tests still pass, because they check the product and not my sample copy. `accent` takes any CSS color. Leave `bookingUrl` empty and Contact emails you instead.
- Each slide is its own `.tsx` file, not a template fill-in, so a slide can look like whatever it needs to.

**How to try it.** Open the live link above. To make your own:

```bash
git clone https://github.com/fidgetcoding/deck-builder-main.git my-deck
cd my-deck
npm install
npm run dev
```

Open <http://localhost:3000/deck-builder>. To see updates land for real, put it on Vercel, open the link, push a change and watch the tab. The full steps are in the [README](README.md).

**What works today.** You can check all of this from the repo and the live demo:

- Push to visible edit on the live demo: median 21.7 seconds, range 18.3 to 27.7. 3 pushes, 6 tabs open each time, across Chromium, Firefox and WebKit at desktop and phone sizes. All 18 tabs got the update and none of them reloaded. An open modal and scroll position survived. Most of that time is Vercel building.
- 49 of 49 Playwright tests pass in CI, along with lint and the build. On a fresh fork with every word rewritten, 46 pass and 3 skip, the modal tests that need a booking link. They cover both views, updates landing in place, the passcode, phone layouts and printing.
- Long slides scroll inside themselves on a phone.
- The deck view prints every slide. The 12 starter slides make a 12-page PDF.
