import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { LOCKED_URL, TEST_PASSCODE } from "../playwright.config";
import { brand } from "../src/lib/brand";
import { proposalTemplate } from "../src/components/proposal/brands";
import { SLIDES, activeSlide, at, pad } from "./helpers";

/** Words from this deck, wherever they are, so these keep working after you rewrite it. */
const COPY = [brand.coverHeadline, proposalTemplate.letterParagraphs[0], brand.contactEmail].filter(Boolean);
const unescapeHtml = (text: string) =>
  text.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const leaked = (body: string) => COPY.filter((text) => unescapeHtml(body).includes(text));
const COOKIE = "deck_unlock";

test.describe("with DECK_PASSCODE set", () => {
  test.use({ baseURL: LOCKED_URL });

  test("no page gives up any content", async ({ request }) => {
    for (const path of ["/", "/deck-builder", "/deck-builder?view=deck", "/deck-builder?view=scroll", "/deck-template"]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(307);
      expect(res.headers().location, path).toContain("/unlock");
      expect(leaked(await res.text()), path).toEqual([]);
    }
  });

  test("following the redirect lands on a form with nothing behind it", async ({ request }) => {
    const res = await request.get("/deck-builder?view=deck");
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain("This deck is locked");
    expect(leaked(html)).toEqual([]);
    expect(html).not.toContain("/_next/static");
  });

  test("the JS chunks are locked too", async ({ request }) => {
    // Take the list from the open server, since the locked one won't give it up.
    const open = test.info().project.use.baseURL!;
    const html = await (await request.get(`${open}/deck-builder?view=deck`)).text();
    const chunks = [...new Set(html.match(/\/_next\/static\/[^"\\?]+\.js/g))];
    expect(chunks.length).toBeGreaterThan(0);

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
    expect(leaked(await rsc.text())).toEqual([]);

    for (const path of ["/wmark.svg", "/social.png"]) {
      expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(307);
    }
    expect((await request.get("/_next/image?url=%2Fsocial.png&w=640&q=75")).status()).toBe(401);
  });

  test("the wrong code stays locked and sets no cookie", async ({ request }) => {
    const res = await request.post("/unlock", { form: { passcode: "nope", next: "/deck-builder" } });
    expect(res.status()).toBe(401);
    expect(res.headers()["set-cookie"]).toBeUndefined();
    expect(leaked(await res.text())).toEqual([]);
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
    expect(leaked(await deck.text()).length).toBeGreaterThan(0);
  });

  test("it can't be used to bounce someone to another site", async ({ request }) => {
    for (const next of ["//evil.example", "https://evil.example", "/\\evil.example"]) {
      const res = await request.post("/unlock", { form: { passcode: TEST_PASSCODE, next }, maxRedirects: 0 });
      expect(new URL(res.headers().location, LOCKED_URL).origin, next).toBe(LOCKED_URL);
    }
  });

  test("in a browser, a shared link opens on its slide after the code", async ({ page }) => {
    await page.goto(`/deck-builder?view=deck#${at(4)}`);
    await expect(page).toHaveURL(/\/unlock/);
    await page.getByLabel("Passcode").fill(TEST_PASSCODE);
    await page.getByRole("button", { name: "Open" }).click();
    await expect(page).toHaveURL(new RegExp(`/deck-builder\\?view=deck#${at(4)}$`));
    await expect(activeSlide(page)).toBeVisible();
    await expect(page.getByText(`${pad(at(4))} / ${pad(SLIDES)}`).locator("visible=true").first()).toBeVisible();
  });

  test("an unlocked viewer still gets live updates", async ({ page, context }) => {
    await page.goto(`/deck-builder?view=deck#${at(4)}`);
    await page.getByLabel("Passcode").fill(TEST_PASSCODE);
    await page.getByRole("button", { name: "Open" }).click();
    await expect(page).toHaveURL(new RegExp(`#${at(4)}$`));

    let version = "build-1";
    let polls = 0;
    await context.route("**/api/deck-version", (route) => {
      polls++;
      return route.fulfill({ json: { version } });
    });
    await context.route(/\/deck-builder(\?|#|$)/, async (route) => {
      const res = await route.fetch();
      const body = (await res.text())
        .replace(/data-deck-build="[^"]*"/, `data-deck-build="${version}"`)
        .replace(/(\\?"data-deck-build\\?":\\?")[^"\\]*/g, `$1${version}`);
      return route.fulfill({ response: res, body });
    });
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-1");
    await expect.poll(() => polls).toBeGreaterThan(0);
    version = "build-2";
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-2");
    await expect(page).toHaveURL(new RegExp(`\\?view=deck#${at(4)}$`));
    await expect(activeSlide(page)).toBeVisible();
    await expect(page.getByText(`${pad(at(4))} / ${pad(SLIDES)}`).locator("visible=true").first()).toBeVisible();
  });
});

test.describe("with DECK_PASSCODE set, part two", () => {
  test.use({ baseURL: LOCKED_URL });

  test("a tab already open goes to the form when the lock changes under it", async ({ page, context }) => {
    await page.goto(`/deck-builder?view=deck#${at(4)}`);
    await page.getByLabel("Passcode").fill(TEST_PASSCODE);
    await page.getByRole("button", { name: "Open" }).click();
    await expect(page).toHaveURL(new RegExp(`#${at(4)}$`));
    // Scripts need the cookie too, so let the page finish starting up first.
    await expect(page.locator("html")).toHaveAttribute("data-deck-view", "deck");

    // Same as someone changing the passcode: this tab's cookie is no good any more.
    await context.clearCookies();
    await context.route("**/api/deck-version", (route) => route.fulfill({ json: { version: "new-build" } }));
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));

    await expect(page).toHaveURL(/\/unlock/);
    await expect(page.getByLabel("Passcode")).toBeVisible();
  });

  const exportPdf = (out: string, env: Record<string, string> = {}) =>
    execFileSync(
      "node",
      ["scripts/export-deck-pdf.mjs", "--url", `${LOCKED_URL}/deck-builder?view=deck`, "--out", out],
      { env: { ...process.env, DECK_PASSCODE: "", ...env }, stdio: "pipe", encoding: "utf8" },
    );

  test("the PDF export won't hand you a PDF of the lock screen", () => {
    const out = test.info().outputPath("locked.pdf");
    rmSync(out, { force: true });
    expect(() => exportPdf(out)).toThrow(/locked/);
    expect(existsSync(out)).toBe(false);
  });

  test("with the code, the PDF export gives you the whole deck", () => {
    const out = test.info().outputPath("deck.pdf");
    exportPdf(out, { DECK_PASSCODE: TEST_PASSCODE });
    const pdf = readFileSync(out).toString("latin1");
    expect(pdf.match(/\/Type\s*\/Page[^s]/g)?.length).toBe(SLIDES);
  });
});

test("with no passcode there's no lock at all", async ({ request }) => {
  const deck = await request.get("/deck-builder?view=deck", { maxRedirects: 0 });
  expect(deck.status()).toBe(200);
  const unlock = await request.get("/unlock", { maxRedirects: 0 });
  expect(unlock.status()).toBe(303);
  expect(unlock.headers()["set-cookie"]).toBeUndefined();
});
