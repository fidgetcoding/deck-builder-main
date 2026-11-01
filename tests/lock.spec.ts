import { expect, test } from "@playwright/test";
import { LOCKED_URL, TEST_PASSCODE } from "../playwright.config";

const SLIDE_COPY = /Section Eyebrow|Lorem ipsum|Cover headline/;
const COOKIE = "deck_unlock";

test.describe("with DECK_PASSCODE set", () => {
  test.use({ baseURL: LOCKED_URL });

  test("no page gives up any content", async ({ request }) => {
    for (const path of ["/", "/deck-builder", "/deck-builder?view=deck", "/deck-builder?view=scroll", "/deck-template"]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(307);
      expect(res.headers().location, path).toContain("/unlock");
      expect(await res.text(), path).not.toMatch(SLIDE_COPY);
    }
  });

  test("following the redirect lands on a form with nothing behind it", async ({ request }) => {
    const res = await request.get("/deck-builder?view=deck");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain("This deck is locked");
    expect(html).not.toMatch(SLIDE_COPY);
    expect(html).not.toContain("/_next/static");
  });

  test("the JS chunks holding the slide copy are locked too", async ({ request }) => {
    // Find them on the open server, so this fails if the copy ever moves somewhere new.
    const open = test.info().project.use.baseURL!;
    const html = await (await request.get(`${open}/deck-builder?view=deck`)).text();
    const chunks = [...new Set(html.match(/\/_next\/static\/[^"\\?]+\.js/g))];
    expect(chunks.length).toBeGreaterThan(0);

    const withCopy: string[] = [];
    for (const chunk of chunks) {
      const body = await (await request.get(`${open}${chunk}`)).text();
      if (SLIDE_COPY.test(body)) withCopy.push(chunk);
    }
    expect(withCopy.length, "the copy really does ship in chunks").toBeGreaterThan(0);

    for (const chunk of chunks) {
      const res = await request.get(chunk);
      expect(res.status(), chunk).toBe(401);
      expect(await res.text(), chunk).toBe("");
    }
  });

  test("neither do React payloads, images or public files", async ({ request }) => {
    const rsc = await request.get("/deck-builder?view=deck", {
      headers: { RSC: "1", "Next-Router-State-Tree": "%5B%22%22%5D" },
      maxRedirects: 0,
    });
    expect(rsc.status()).toBe(307);
    expect(await rsc.text()).not.toMatch(SLIDE_COPY);

    for (const path of ["/wmark.svg", "/social.png"]) {
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(307);
    }
    expect((await request.get("/_next/image?url=%2Fsocial.png&w=640&q=75")).status()).toBe(401);
  });

  test("the wrong code stays locked and sets no cookie", async ({ request }) => {
    const res = await request.post("/unlock", { form: { passcode: "nope", next: "/deck-builder" } });
    expect(res.status()).toBe(401);
    expect(res.headers()["set-cookie"]).toBeUndefined();
    expect(await res.text()).not.toMatch(SLIDE_COPY);
  });

  test("a made-up cookie doesn't work", async ({ request }) => {
    const res = await request.get("/deck-builder?view=deck", {
      headers: { Cookie: `${COOKIE}=${"a".repeat(64)}` },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(307);
  });

  test("the right code opens it, and the cookie isn't the code", async ({ request }) => {
    const res = await request.post("/unlock", {
      form: { passcode: TEST_PASSCODE, next: "/deck-builder?view=deck" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(303);
    const cookie = res.headers()["set-cookie"];
    expect(cookie).toContain(`${COOKIE}=`);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).not.toContain(TEST_PASSCODE);

    const deck = await request.get("/deck-builder?view=deck", { maxRedirects: 0 });
    expect(deck.status()).toBe(200);
    expect(await deck.text()).toMatch(SLIDE_COPY);
  });

  test("it can't be used to bounce someone to another site", async ({ request }) => {
    for (const next of ["//evil.example", "https://evil.example", "/\\evil.example"]) {
      const res = await request.post("/unlock", { form: { passcode: TEST_PASSCODE, next }, maxRedirects: 0 });
      expect(new URL(res.headers().location, LOCKED_URL).origin, next).toBe(LOCKED_URL);
    }
  });

  test("in a browser, a shared link opens on its slide after the code", async ({ page }) => {
    await page.goto("/deck-builder?view=deck#4");
    await expect(page).toHaveURL(/\/unlock/);
    await page.getByLabel("Passcode").fill(TEST_PASSCODE);
    await page.getByRole("button", { name: "Open" }).click();
    await expect(page).toHaveURL(/\/deck-builder\?view=deck#4$/);
    await expect(page.getByText("HEADER 03: Section Eyebrow").first()).toBeVisible();
  });

  test("an unlocked viewer still gets live updates", async ({ page, context }) => {
    await page.goto("/deck-builder?view=deck#4");
    await page.getByLabel("Passcode").fill(TEST_PASSCODE);
    await page.getByRole("button", { name: "Open" }).click();
    await expect(page).toHaveURL(/#4$/);

    let version = "build-1";
    let polls = 0;
    await context.route("**/api/deck-version", (route) => {
      polls++;
      return route.fulfill({ json: { version } });
    });
    await context.route(/\/deck-builder(\?|#|$)/, async (route) => {
      const res = await route.fetch();
      const body = (await res.text()).replace(/data-deck-build="[^"]*"/, `data-deck-build="${version}"`);
      return route.fulfill({ response: res, body });
    });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-1");
    await expect.poll(() => polls).toBeGreaterThan(0);
    version = "build-2";
    const reloaded = page.waitForEvent("load");
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await reloaded;
    await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-2");
    await expect(page).toHaveURL(/\?view=deck#4$/);
    await expect(page.getByText("HEADER 03: Section Eyebrow").first()).toBeVisible();
  });
});

test("with no passcode there's no lock at all", async ({ request }) => {
  const deck = await request.get("/deck-builder?view=deck", { maxRedirects: 0 });
  expect(deck.status()).toBe(200);
  const unlock = await request.get("/unlock", { maxRedirects: 0 });
  expect(unlock.status()).toBe(303);
  expect(unlock.headers()["set-cookie"]).toBeUndefined();
});
