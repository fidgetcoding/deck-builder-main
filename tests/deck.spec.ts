import { expect, test, type Page } from "@playwright/test";

/** Serve a version we control, and report how many times the page has asked. */
async function fakeDeployments(page: Page) {
  const state = { version: "build-1", polls: 0 };
  await page.route("**/api/deck-version", (route) => {
    state.polls++;
    return route.fulfill({ json: { version: state.version } });
  });
  return state;
}

/** Same check the 15 second timer runs, without waiting 15 seconds. */
const pollNow = (page: Page) =>
  page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));

test.describe("two views, one link", () => {
  test("desktop opens on the deck, arrow keys move slides", async ({ page }) => {
    await page.goto("/deck-builder");
    await expect(page.getByRole("button", { name: "Deck view" })).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/#1$/); // the deck has mounted and is listening
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/#2$/);
    await page.keyboard.press("End");
    await expect(page).toHaveURL(/#12$/);
  });

  test("phones open on scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/deck-builder");
    await expect(page.getByRole("button", { name: "Scroll view" })).toHaveAttribute("aria-pressed", "true");
  });

  test("the toggle switches views and the URL remembers", async ({ page }) => {
    await page.goto("/deck-builder");
    await page.getByRole("button", { name: "Scroll view" }).click();
    await expect(page).toHaveURL(/\?view=scroll/);
    await expect(page.locator("#letter")).toBeAttached();
    await page.getByRole("button", { name: "Deck view" }).click();
    await expect(page).toHaveURL(/\?view=deck/);
    await expect(page.locator("#letter")).toHaveCount(0);
  });

  test("the contact modal opens from the deck's top bar", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#3");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0); // hydrated: the burger has its click handler
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Contact" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box?.height).toBe(page.viewportSize()?.height);
  });
});

test.describe("on a phone", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("tapping the menu in the scroll view reaches Contact", async ({ page }) => {
    await page.goto("/deck-builder");
    const burger = page.getByRole("button", { name: "Open menu" });
    await expect(burger).toBeVisible();
    await expect(page.locator("#letter")).toBeAttached();
    await burger.tap();
    await expect(page.getByRole("button", { name: "Contact", exact: true })).toBeVisible();
  });

  test("the view toggle doesn't sit on the deck's back button", async ({ page }) => {
    await page.goto("/deck-builder?view=deck#4");
    await expect(page).toHaveURL(/#4$/);
    await page.getByRole("button", { name: "Previous slide" }).last().tap();
    await expect(page).toHaveURL(/#3$/);
  });
});

test.describe("pushing while someone's watching", () => {
  test("an open deck reloads on a new build and stays on its slide", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#4");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);

    await pollNow(page);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => performance.getEntriesByType("navigation")[0].toJSON().type)).toBe("navigate");

    deploy.version = "build-2";
    const reloaded = page.waitForEvent("load");
    await pollNow(page);
    await reloaded;

    expect(await page.evaluate(() => performance.getEntriesByType("navigation")[0].toJSON().type)).toBe("reload");
    await expect(page).toHaveURL(/#4$/);
    await expect(page.getByText("HEADER 03: Section Eyebrow")).toBeVisible();
  });

  test("the scroll view keeps its view and its place", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder");
    await page.getByRole("button", { name: "Scroll view" }).click();
    await expect(page.locator("#letter")).toBeAttached();
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1500);

    deploy.version = "build-2";
    const reloaded = page.waitForEvent("load");
    await pollNow(page);
    await reloaded;

    await expect(page).toHaveURL(/\?view=scroll/);
    await expect(page.locator("#letter")).toBeAttached();
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(1500);
  });

  test("it waits until the booking modal closes", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#3");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Contact" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    deploy.version = "build-2";
    await pollNow(page);
    await page.waitForTimeout(500);
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    const reloaded = page.waitForEvent("load");
    await pollNow(page);
    await reloaded;
    await expect(page).toHaveURL(/#3$/);
  });

  test("a failed check during a deploy doesn't reload anything", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#5");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);

    await page.unroute("**/api/deck-version");
    await page.route("**/api/deck-version", (route) => route.abort());
    await pollNow(page);
    await page.waitForTimeout(300);

    expect(await page.evaluate(() => performance.getEntriesByType("navigation")[0].toJSON().type)).toBe("navigate");
    await expect(page).toHaveURL(/#5$/);
  });
});
