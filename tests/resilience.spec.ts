import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { brand } from "../src/lib/brand";
import { SLIDES, activeSlide, at, pad, realOpacity } from "./helpers";

const stamp = (page: Page) => page.locator("html");
const navType = (page: Page) =>
  page.evaluate(() => performance.getEntriesByType("navigation")[0].toJSON().type);
const pollNow = (page: Page) =>
  page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
const withStamp = (text: string, version: string) =>
  text
    .replace(/data-deck-build="[^"]*"/, `data-deck-build="${version}"`)
    .replace(/(\\?"data-deck-build\\?":\\?")[^"\\]*/g, `$1${version}`);

/** Fake deploys that also let a test hang or slow down what the server sends. */
async function fakeNetwork(target: Page | BrowserContext) {
  const state = {
    version: "build-1",
    hangVersionCheck: false,
    refreshDelayMs: 0,
    failRefresh: false,
    refreshes: 0,
    polls: 0,
    staleRefreshes: 0,
  };
  await target.route("**/api/deck-version", async (route) => {
    state.polls++;
    if (state.hangVersionCheck) return; // never answers
    await route.fulfill({ json: { version: state.version } });
  });
  await target.route(/\/deck-builder(\?|#|$)/, async (route) => {
    const isRefresh = !!route.request().headers()["rsc"];
    if (isRefresh) {
      state.refreshes++;
      if (state.failRefresh) return route.abort("internetdisconnected");
      if (state.refreshDelayMs) await new Promise((r) => setTimeout(r, state.refreshDelayMs));
    }
    const res = await route.fetch().catch(() => null);
    if (!res) return;
    const served = isRefresh && state.staleRefreshes-- > 0 ? "build-1" : state.version;
    await route.fulfill({ response: res, body: withStamp(await res.text(), served) }).catch(() => {});
  });
  return state;
}

test.describe("on a bad connection", () => {
  test("a version check that never answers doesn't stop updates for good", async ({ page }) => {
    test.setTimeout(45_000);
    const net = await fakeNetwork(page);
    await page.goto(`/deck-builder?view=deck#${at(4)}`);
    await expect.poll(() => net.polls).toBeGreaterThan(0);

    net.hangVersionCheck = true;
    await page.waitForTimeout(3_500); // the next check goes out, and hangs
    net.hangVersionCheck = false;
    net.version = "build-2";
    await expect(stamp(page)).toHaveAttribute("data-deck-build", "build-2", { timeout: 30_000 });
    expect(await navType(page)).toBe("navigate");
  });

  test("a slow refresh gets time to land, without a reload or duplicate requests", async ({ page }) => {
    test.setTimeout(45_000);
    const net = await fakeNetwork(page);
    await page.goto(`/deck-builder?view=deck#${at(4)}`);
    await expect.poll(() => net.polls).toBeGreaterThan(0);
    net.refreshDelayMs = 11_000;
    net.version = "build-2";
    await pollNow(page);
    await expect(stamp(page)).toHaveAttribute("data-deck-build", "build-2", { timeout: 20_000 });
    expect(await navType(page)).toBe("navigate");
    expect(net.refreshes).toBe(1);
  });

  test("a refresh answered by a server that hasn't caught up tries again soon", async ({ page }) => {
    const net = await fakeNetwork(page);
    await page.goto(`/deck-builder?view=deck#${at(4)}`);
    await expect.poll(() => net.polls).toBeGreaterThan(0);
    net.staleRefreshes = 1;
    net.version = "build-2";
    await pollNow(page);
    await expect(stamp(page)).toHaveAttribute("data-deck-build", "build-2", { timeout: 10_000 });
    expect(await navType(page)).toBe("navigate");
    expect(net.refreshes).toBe(2);
  });

  test("losing the connection mid-swap never navigates to an error page", async ({ page }) => {
    const net = await fakeNetwork(page);
    await page.goto(`/deck-builder?view=deck#${at(4)}`);
    await expect.poll(() => net.polls).toBeGreaterThan(0);
    const before = await activeSlide(page).textContent();

    net.failRefresh = true;
    net.version = "build-2";
    await pollNow(page);
    await expect.poll(() => net.refreshes).toBeGreaterThan(0);
    await page.waitForTimeout(4_000);
    expect(await navType(page)).toBe("navigate");
    expect(await activeSlide(page).textContent()).toBe(before);

    // The connection comes back, and the same swap finishes.
    net.failRefresh = false;
    await expect(stamp(page)).toHaveAttribute("data-deck-build", "build-2", { timeout: 10_000 });
    expect(await navType(page)).toBe("navigate");
  });

  test("really offline: the slide stays up, nothing errors, and it catches up after", async ({ page, context }) => {
    let live = "build-1";
    await context.route("**/api/deck-version", async (route) => {
      await route.fulfill({ json: { version: live } });
    });
    await page.goto(`/deck-builder?view=deck#${at(4)}`);
    await expect(page.locator("html")).toHaveAttribute("data-deck-view", "deck");
    const before = await activeSlide(page).textContent();
    await context.unroute("**/api/deck-version");
    await context.setOffline(true);
    await page.waitForTimeout(4_000);
    expect(await activeSlide(page).textContent()).toBe(before);
    expect(page.url()).toContain(`#${at(4)}`);
    await context.setOffline(false);
    live = "unused";
    await expect.poll(() => page.evaluate(() => navigator.onLine)).toBe(true);
    expect(await navType(page)).toBe("navigate");
  });
});

test.describe("first paint without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the link people get sent isn't blank", async ({ page }) => {
    await page.goto("/deck-builder");
    await expect(page.getByText(brand.coverHeadline).first()).toBeAttached();
  });

  test("copy shows up even if the scripts never come", async ({ page }) => {
    await page.goto("/deck-builder?view=scroll");
    await expect.poll(() => realOpacity(page, "#letter p"), { timeout: 4_000 }).toBeGreaterThan(0.95);
  });

  test("there's a way to read the whole deck", async ({ page }) => {
    await page.goto("/deck-builder?view=deck");
    await page.getByRole("link", { name: "Read the whole deck on one page" }).click();
    await expect(page).toHaveURL(/view=scroll/);
    await expect(page.locator("#letter")).toBeAttached();
  });
});

test("a phone gets the scroll view from the first byte", async ({ browser }) => {
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148",
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("/deck-builder");
  await expect(page.locator("#letter")).toBeAttached();
  await context.close();
});

test.describe("from the keyboard", () => {
  const ready = async (page: Page, path: string) => {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-deck-ready", "");
  };

  test("Enter on the next and previous arrows moves slides, once", async ({ page }) => {
    await ready(page, `/deck-builder?view=deck#${at(4)}`);
    await page.getByRole("button", { name: "Next slide" }).first().focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`#${at(5)}$`));
    await page.getByRole("button", { name: "Previous slide" }).first().focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`#${at(4)}$`));
  });

  test("Tab never lands on something invisible or hidden", async ({ page }) => {
    await ready(page, `/deck-builder?view=deck#${at(4)}`);
    const seen: string[] = [];
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const bad = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        if (!el || el === document.body) return null;
        let opacity = 1;
        for (let n: Element | null = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
        const r = el.getBoundingClientRect();
        const offscreen = r.bottom <= 0 || r.top >= innerHeight || r.width === 0;
        return opacity < 0.05 || offscreen || el.closest('[aria-hidden="true"]')
          ? el.getAttribute("aria-label") || el.innerText || el.tagName
          : null;
      });
      if (bad) seen.push(bad);
    }
    expect(seen).toEqual([]);
  });

  test("the keyboard always shows where it is", async ({ page }) => {
    await ready(page, `/deck-builder?view=deck#${at(4)}`);
    await page.keyboard.press("Tab"); // puts the browser in keyboard mode
    await page.getByRole("button", { name: "Open menu" }).first().focus();
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
    expect(outline).toBe("solid");
  });

  test("tabbing onto the view toggle doesn't change the view", async ({ page }) => {
    await ready(page, "/deck-builder?view=deck");
    await page.getByRole("button", { name: "Scroll view" }).focus();
    await page.waitForTimeout(200);
    await expect(page.getByRole("button", { name: "Deck view" })).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Scroll view" })).toHaveAttribute("aria-pressed", "true");
  });

  test("the menu opens from the keyboard and moves you into it", async ({ page }) => {
    await ready(page, `/deck-builder?view=deck#${at(4)}`);
    await page.getByRole("button", { name: "Open menu" }).first().focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-deck-menu]:not([inert]) :is(a, button)").first()).toBeFocused();
  });

  test("the booking modal holds focus and the keyboard, then gives them back", async ({ page }) => {
    test.skip(!brand.bookingUrl, "no booking link, so no modal");
    await ready(page, `/deck-builder?view=deck#${at(4)}`);
    await page.getByRole("button", { name: "Open menu" }).first().focus();
    await page.keyboard.press("Enter");
    const contact = page.locator("[data-deck-menu]:not([inert]) :is(a, button)").first();
    await expect(contact).toBeFocused();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const inDialog = () => page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
    expect(await inDialog()).toBe(true);
    await dialog.getByRole("link").focus();
    await page.keyboard.press("Tab");
    expect(await inDialog()).toBe(true);

    const url = page.url();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);
    expect(page.url()).toBe(url);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(contact).toBeFocused();
  });

  test("up and down read a slide that's taller than the screen", async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 420 });
    await ready(page, `/deck-builder?view=deck#${at(4)}`);
    const slide = activeSlide(page);
    test.skip(await slide.evaluate((el) => el.scrollHeight <= el.clientHeight), "this slide fits");
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => slide.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    await expect(page.getByRole("button", { name: "Close slide tray" }).first()).not.toBeInViewport();
  });

  test("slide changes get announced to screen readers", async ({ page }) => {
    await ready(page, `/deck-builder?view=deck#${at(2)}`);
    const live = page.locator('[aria-live="polite"]');
    await expect(live).toContainText(`Slide ${at(2)} of ${SLIDES}`);
    await page.keyboard.press("ArrowRight");
    await expect(live).toContainText(`Slide ${at(3)} of ${SLIDES}`);
    await expect(page.getByText(`${pad(at(3))} / ${pad(SLIDES)}`).locator("visible=true").first()).toBeVisible();
  });
});

test("reduced motion turns the fades off", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`/deck-builder?view=deck#${at(2)}`);
  await expect(page).toHaveURL(new RegExp(`#${at(2)}$`));
  await expect(page.locator("html")).toHaveAttribute("data-deck-ready", "");
  // The slide on screen can swap as the hash lands, so read it until it holds still.
  await expect
    .poll(() =>
      page
        .locator('[aria-hidden="false"] section .transition-all')
        .first()
        .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration))
        .catch(() => 99),
    )
    .toBeLessThan(0.01);
});

test.describe("accessibility scan", () => {
  for (const [name, path] of [
    ["cover", "/deck-builder?view=deck"],
    ["a slide", `/deck-builder?view=deck#${at(4)}`],
    ["scroll view", "/deck-builder?view=scroll"],
    ["landing page", "/"],
  ]) {
    test(`${name} has no violations`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(2_500);
      const { violations } = await new AxeBuilder({ page }).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`.slice(0, 200))).toEqual([]);
    });
  }
});
