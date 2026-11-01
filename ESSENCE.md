# deck-builder-main: the essence

**Try it live: <https://deck-builder-main.vercel.app/deck-builder>**

**What it is.** A deck that's a link. One URL opens as slides on a laptop and as a long scroll on a phone. When you push a change, every open tab picks it up by itself and stays on the slide it was on.

**Who it's for.** Anyone who sends decks and would rather send a link, and who's fine with their deck being code. There's no editor. You or your agent edit files and push.

**Why it exists.** I think decks are archaic and dumb. Who the hell wants to download a PDF? A PDF is dead the second you hit send. I wanted a link I can push updates to, even while I'm presenting. They say "can you change that?" and I change it, and it changes in front of them.

**What's different.**

- One link, two views, and nobody has to pick. Laptops land on the deck, phones land on the scroll, and a toggle flips between them.
- The tab you're sharing on a call updates itself. An update shows up on open tabs about 24 seconds after you push, on the slide you're on, and the only thing that changes on screen is your edit.
- It has manners. It holds an update while someone's in the booking modal or watching a video with the sound on, and a failed check mid-deploy does nothing.
- There's an optional lock. Set `DECK_PASSCODE` and every response stays on the server until someone enters the code, including the JavaScript that holds your slide copy.
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

- Push to visible edit: median 23.7 seconds, range 21.8 to 29.8, on the live demo. 3 pushes, 6 tabs open each time, across Chromium, Firefox and WebKit at desktop and phone sizes. About 20 of those seconds are Vercel building.
- 34 of 34 Playwright tests pass in CI, along with lint and the build. They cover both views, updates landing in place, the passcode, phone layouts and printing.
- Long slides scroll inside themselves on a phone.
- The deck view prints every slide. The 12 starter slides make a 12-page PDF.
