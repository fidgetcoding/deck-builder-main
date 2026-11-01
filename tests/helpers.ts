import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

/**
 * These tests check the product, not the sample copy, so they keep passing after
 * you rewrite every word and change the number of slides.
 */
export const SLIDES = readFileSync("src/components/deck-template/slidesRegistry.tsx", "utf8").match(
  /\{ id: "/g,
)!.length;

/** Slide n, or the last slide if the deck is shorter than that. */
export const at = (n: number) => Math.min(n, SLIDES);

export const pad = (n: number) => String(n).padStart(2, "0");

export const activeSlide = (page: Page) => page.locator('[aria-hidden="false"] section');

/** Text on the current slide that's safe to find-and-replace in what the server sends. */
export const plainTextOnSlide = (page: Page) =>
  activeSlide(page).evaluate((slide) => {
    const leaves = Array.from(slide.querySelectorAll<HTMLElement>("h2,h3,h4,p,li"))
      .filter((el) => el.children.length === 0 && /^[\w [\]:.,-]{6,}$/.test(el.textContent?.trim() ?? ""));
    return leaves[0]?.textContent?.trim() ?? null;
  });

/** How solid an element really looks, counting every parent's opacity. */
export const realOpacity = (page: Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => {
    let total = 1;
    for (let node: Element | null = el; node; node = node.parentElement) {
      total *= Number(getComputedStyle(node).opacity);
    }
    return total;
  });
