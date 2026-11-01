import { expect, test, type Page } from "@playwright/test";

/**
 * Pretend to deploy, by rewriting what the server sends.
 *
 * `live` is what the version check says, `served` is the build the server's pages
 * are stamped with, and setting `version` moves both, like a clean deploy. `subhead`
 * is a copy edit. `newCode` makes the new page ask for a script this tab hasn't
 * loaded, which is what a deploy with new JS looks like.
 */
async function fakeDeployments(page: Page) {
  const state = {
    polls: 0,
    live: "build-1",
    served: "build-1",
    subhead: "[Subheadline: sed do eiusmod.]",
    newCode: false,
    set version(next: string) {
      state.live = next;
      state.served = next;
    },
  };
  await page.route("**/api/deck-version", (route) => {
    state.polls++;
    return route.fulfill({ json: { version: state.live } });
  });
  await page.route("**/_next/static/fake-new-code.js", (route) =>
    route.fulfill({ contentType: "text/javascript", body: "" }),
  );
  await page.route(/\/deck-(builder|template)(\?|#|$)/, async (route) => {
    const res = await route.fetch();
    let body = (await res.text())
      .replaceAll("[Subheadline: sed do eiusmod.]", state.subhead)
      .replace(/data-deck-build="[^"]*"/, `data-deck-build="${state.served}"`)
      .replace(/(\\?"data-deck-build\\?":\\?")[^"\\]*/g, `$1${state.served}`);
    if (state.newCode) {
      body = body.replace("</head>", '<script src="/_next/static/fake-new-code.js" async></script></head>');
    }
    return route.fulfill({ response: res, body });
  });
  return state;
}

/** Same check the 5 second timer runs, without waiting. */
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

test.describe("a copy edit lands in place", () => {
  const navType = (page: Page) =>
    page.evaluate(() => performance.getEntriesByType("navigation")[0].toJSON().type);

  test("no reload: same page, same slide, new words", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#4");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);
    await page.evaluate(() => {
      (window as unknown as { marker: string }).marker = "still here";
    });
    const slide = page.locator('[aria-hidden="false"] section');
    await slide.evaluate((el) => {
      el.setAttribute("data-same-node", "yes");
    });

    deploy.subhead = "New words, no reload.";
    deploy.version = "build-2";
    await pollNow(page);

    await expect(page.getByRole("heading", { name: "New words, no reload." }).first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-2");
    expect(await navType(page)).toBe("navigate");
    expect(await page.evaluate(() => (window as unknown as { marker: string }).marker)).toBe("still here");
    await expect(slide).toHaveAttribute("data-same-node", "yes");
    await expect(page).toHaveURL(/\/deck-builder\?view=deck#4$/);
  });

  test("an open booking modal and half-typed text survive it", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#4");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Contact", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.evaluate(() => {
      const w = window as unknown as { frameNode: Element | null };
      w.frameNode = document.querySelector('[role="dialog"] iframe');
      const input = document.createElement("input");
      input.id = "half-typed";
      document.querySelector('[aria-hidden="false"] section')!.append(input);
      input.value = "half a sentence";
    });

    deploy.subhead = "Landed under the modal.";
    deploy.version = "build-2";
    await pollNow(page);

    await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-2");
    await expect(page.getByRole("heading", { name: "Landed under the modal." }).first()).toBeAttached();
    await expect(dialog).toBeVisible();
    expect(
      await page.evaluate(() => {
        const w = window as unknown as { frameNode: Element };
        return w.frameNode.isConnected && w.frameNode === document.querySelector('[role="dialog"] iframe');
      }),
    ).toBe(true);
    await expect(page.locator("#half-typed")).toHaveValue("half a sentence");
    expect(await navType(page)).toBe("navigate");
  });

  test("the scroll view keeps its exact position", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=scroll");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);
    await expect(async () => {
      await page.evaluate(() => window.scrollTo({ top: 1500, behavior: "instant" }));
      await page.evaluate(() => new Promise(requestAnimationFrame));
      expect(await page.evaluate(() => window.scrollY)).toBe(1500);
    }).toPass();

    deploy.version = "build-2";
    await pollNow(page);

    await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-2");
    expect(await page.evaluate(() => window.scrollY)).toBe(1500);
    expect(await navType(page)).toBe("navigate");
  });

  test("a refresh that never lands falls back to a reload instead of staying stale", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#4");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);

    // The version check and the page agree on build-2, but refreshes never deliver it.
    await page.route(
      /\/deck-builder\?.*_rsc=/,
      (route) => route.fulfill({ status: 500, body: "" }),
    );
    deploy.version = "build-2";
    await expect(async () => {
      await pollNow(page);
      expect(await navType(page)).toBe("reload");
    }).toPass({ timeout: 15_000 });
    await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-2");
    await expect(page).toHaveURL(/#4$/);
  });

  test("slide and brand copy isn't in any JS chunk, which is what makes this possible", async ({ page, request }) => {
    await page.goto("/deck-builder?view=deck");
    const html = await (await request.get("/deck-builder?view=deck")).text();
    const chunks = [...new Set(html.match(/\/_next\/static\/[^"\\?]+\.js/g))];
    expect(chunks.length).toBeGreaterThan(0);
    expect(html).toContain("Section Eyebrow");
    for (const chunk of chunks) {
      const body = await (await request.get(chunk)).text();
      expect(body, chunk).not.toMatch(/Section Eyebrow|Lorem ipsum|Cover headline|Your one-line tagline/);
    }
  });
});

test.describe("pushing while someone's watching", () => {
  test("new JS reloads an open deck and it stays on its slide", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#4");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);

    await pollNow(page);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => performance.getEntriesByType("navigation")[0].toJSON().type)).toBe("navigate");

    deploy.newCode = true;
    deploy.version = "build-2";
    const reloaded = page.waitForEvent("load");
    await pollNow(page);
    await reloaded;

    expect(await page.evaluate(() => performance.getEntriesByType("navigation")[0].toJSON().type)).toBe("reload");
    await expect(page).toHaveURL(/#4$/);
    await expect(page.getByText("HEADER 03: Section Eyebrow").first()).toBeVisible();
  });

  test("new JS reloads the scroll view and it keeps its view and its place", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder");
    await page.getByRole("button", { name: "Scroll view" }).click();
    await expect(page.locator("#letter")).toBeAttached();
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);
    // The toggle lands on the cover a frame later, so keep at it until it sticks.
    await expect(async () => {
      await page.evaluate(() => window.scrollTo({ top: 1500, behavior: "instant" }));
      await page.evaluate(() => new Promise(requestAnimationFrame));
      expect(await page.evaluate(() => window.scrollY)).toBe(1500);
    }).toPass();

    deploy.newCode = true;
    deploy.version = "build-2";
    const reloaded = page.waitForEvent("load");
    await pollNow(page);
    await reloaded;

    await expect(page).toHaveURL(/\?view=scroll/);
    await expect(page.locator("#letter")).toBeAttached();
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(1500);
  });

  test("new JS waits until the booking modal closes", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#3");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Contact" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    deploy.newCode = true;
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

  test("it won't reload until the server really serves the new page", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#5");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);

    // Mid-deploy: the version check says new, the page is still the old one.
    deploy.newCode = true;
    deploy.live = "build-2";
    await pollNow(page);
    await page.waitForTimeout(400);
    const navType = () => page.evaluate(() => performance.getEntriesByType("navigation")[0].toJSON().type);
    expect(await navType()).toBe("navigate");

    deploy.served = "build-2";
    const reloaded = page.waitForEvent("load");
    await pollNow(page);
    await reloaded;
    expect(await navType()).toBe("reload");
    await expect(page).toHaveURL(/#5$/);
  });

  test("a tab that still lands on the old page tries again instead of staying stale", async ({ page }) => {
    const deploy = await fakeDeployments(page);
    await page.goto("/deck-builder?view=deck#5");
    await expect.poll(() => deploy.polls).toBeGreaterThan(0);

    // The page load itself gets old HTML, while the version check already says new.
    deploy.live = "build-2";
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-1");

    deploy.served = "build-2";
    await expect(async () => {
      await pollNow(page);
      await expect(page.locator("html")).toHaveAttribute("data-deck-build", "build-2", { timeout: 500 });
    }).toPass();
    await expect(page).toHaveURL(/#5$/);
  });

  test("a page's stamp matches the version check, so a clean deck never reloads", async ({ page }) => {
    let polls = 0;
    page.on("response", (res) => {
      if (res.url().endsWith("/api/deck-version")) polls++;
    });
    await page.goto("/deck-builder?view=deck#2");
    await expect.poll(() => polls).toBeGreaterThan(0);
    const stamp = await page.locator("html").getAttribute("data-deck-build");
    const { version } = await (await page.request.get("/api/deck-version")).json();
    expect(stamp).toBe(version);
    await pollNow(page);
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => performance.getEntriesByType("navigation")[0].toJSON().type)).toBe("navigate");
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

test.describe("an update lands without a flash", () => {
  // No JavaScript means this is exactly what the first paint looks like.
  test.use({ javaScriptEnabled: false });

  test("the server paints the resumed slide in place, at full strength", async ({ page }) => {
    await page.goto("/deck-builder?view=deck&resume=4");
    const heading = page.getByText("HEADER 03: Section Eyebrow").first();
    await expect(heading).toBeVisible();
    const opacity = await heading.evaluate((el) => {
      let total = 1;
      for (let node: Element | null = el; node; node = node.parentElement) {
        total *= Number(getComputedStyle(node).opacity);
      }
      return total;
    });
    expect(opacity).toBe(1);
    await expect(page.getByText("04 / 12").first()).toBeAttached();
  });

  test("the server paints the scroll view too, chrome already past the cover", async ({ page }) => {
    await page.goto("/deck-builder?view=scroll&resume=1500");
    await expect(page.locator("#letter")).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to cover" })).toBeVisible();
    await expect(page.getByText("[Work headline: lorem ipsum dolor sit amet.]")).toHaveCSS("opacity", "1");
  });
});

test.describe("resuming", () => {
  test("the URL cleans itself up afterward", async ({ page }) => {
    await page.goto("/deck-builder?view=deck&resume=4#4");
    await expect(page).toHaveURL(/\/deck-builder\?view=deck#4$/);
  });

  test("a garbage resume value is ignored", async ({ page }) => {
    await page.goto("/deck-builder?view=deck&resume=<script>");
    await expect(page.getByRole("button", { name: "Deck view" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "[Headline" })).toHaveCount(0);
  });
});

test.describe("deck view on small screens", () => {
  const screens = [
    // bottom: what the nav bar and view toggle cover. The toggle sits up top on the cover.
    { name: "phone", width: 390, height: 844, top: 64, bottom: 94, coverBottom: 48 },
    { name: "small phone", width: 320, height: 568, top: 64, bottom: 94, coverBottom: 48 },
    { name: "phone on its side", width: 844, height: 390, top: 64, bottom: 54, coverBottom: 0 },
  ];

  for (const { name, width, height, top, bottom, coverBottom } of screens) {
    test(`nothing is cut off on a ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      for (let n = 1; n <= 12; n++) {
        await page.goto(`/deck-builder?view=deck&resume=${n}#${n}`);
        await expect(page.getByText(`${String(n).padStart(2, "0")} / 12`).first()).toBeAttached();
        const problems = await page.evaluate(
          ({ top, bottom }) => {
            const slide = document.querySelector<HTMLElement>('[aria-hidden="false"] section')!;
            const out: string[] = [];
            const texts = () =>
              Array.from(slide.querySelectorAll<HTMLElement>("h2,h3,h4,p,li,a,span"))
                .filter((el) => el.innerText?.trim() && el.getClientRects().length);
            slide.scrollTop = slide.scrollHeight;
            const lowest = Math.max(...texts().map((el) => el.getBoundingClientRect().bottom));
            if (lowest > innerHeight - bottom) out.push(`bottom ${Math.round(lowest)} of ${innerHeight - bottom}`);
            slide.scrollTop = 0;
            const highest = Math.min(...texts().map((el) => el.getBoundingClientRect().top));
            if (highest < top && slide.scrollHeight > slide.clientHeight) out.push(`top ${Math.round(highest)}`);
            for (const el of texts()) {
              const r = el.getBoundingClientRect();
              if (r.left < -1 || r.right > innerWidth + 1) out.push(`wide: ${el.innerText.slice(0, 24)}`);
            }
            return out;
          },
          { top, bottom: n === 1 ? coverBottom : bottom },
        );
        expect(problems, `slide ${n}`).toEqual([]);
      }
    });
  }

  test.describe("by touch", () => {
    test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

    test("a swipe scrolls a long slide and leaves the tray alone", async ({ page }) => {
      await page.goto("/deck-builder?view=deck&resume=4#4");
      const slide = page.locator('[aria-hidden="false"] section');
      await expect(slide).toBeVisible();
      const cdp = await page.context().newCDPSession(page);
      // Raw touch events, so the deck's own touchend handler sees the swipe too.
      const touch = (type: "touchStart" | "touchMove" | "touchEnd", y = 0) =>
        cdp.send("Input.dispatchTouchEvent", {
          type,
          touchPoints: type === "touchEnd" ? [] : [{ x: 195, y }],
        });
      await touch("touchStart", 600);
      for (let y = 590; y >= 200; y -= 10) {
        await touch("touchMove", y);
        await page.waitForTimeout(16);
      }
      await touch("touchEnd");
      await expect.poll(() => slide.evaluate((el) => el.scrollTop)).toBeGreaterThan(100);
      await expect(page.getByRole("button", { name: "Toggle slide tray" })).toHaveAttribute("aria-expanded", "false");
    });
  });
});

test.describe("printing the deck view", () => {
  test("gives every slide, one to a page, wherever you were", async ({ page }) => {
    await page.goto("/deck-builder?view=deck#7");
    await expect(page).toHaveURL(/#7$/);
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    expect(pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g)?.length).toBe(12);
  });

  test("cuts nothing off the page", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/deck-builder?view=deck");
    await page.emulateMedia({ media: "print" });
    const slides = page.locator(".deck-print-slide");
    await expect(slides).toHaveCount(12);
    const clipped = await slides.evaluateAll((all) =>
      all.flatMap((slide, i) => {
        const section = slide.querySelector("section")!;
        return section.scrollHeight > section.clientHeight + 1 || section.scrollWidth > section.clientWidth + 1
          ? [`slide ${i + 1}: ${section.scrollHeight} of ${section.clientHeight}`]
          : [];
      }),
    );
    expect(clipped).toEqual([]);
    await expect(page.getByRole("button", { name: "Deck view" })).toBeHidden();
  });
});
