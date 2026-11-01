#!/usr/bin/env node
/**
 * Deck to PDF, for the person who insists.
 *
 * Point it at either view. The deck view gives every slide, one to a page, and
 * the scroll view gives the whole long page.
 *
 * Usage:
 *   node scripts/export-deck-pdf.mjs --url "http://localhost:3000/deck-builder?view=deck" --out out/deck.pdf
 *
 * CLI args (all optional except --url):
 *   --url      <string>  Deck URL                                        (required)
 *   --out      <path>    Output PDF path     (default: out/deck.pdf)
 *   --width    <px>      Page width in px    (default: 1920)
 *   --height   <px>      Page height in px   (default: 1080)
 *   --wait     <ms>      Settle delay        (default: 1500)
 *   --passcode <code>    For a locked deck. DECK_PASSCODE works too.
 *   --start-server       Auto-start `next dev` if no server is running   (flag)
 *
 * Requirements: `playwright` installed. The script does not bundle the
 * Chromium binary, so run `npx playwright install chromium` once.
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}

async function isServerUp(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok || res.status === 200 || res.status === 304;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerUp(url)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const url = args.url;
  if (!url) {
    console.error("error: --url is required");
    console.error("example: node scripts/export-deck-pdf.mjs --url 'http://localhost:3000/deck-builder?view=deck' --out out/deck.pdf");
    process.exit(1);
  }

  const outPath = resolve(args.out ?? "out/deck.pdf");
  const width = parseInt(args.width ?? "1920", 10);
  const height = parseInt(args.height ?? "1080", 10);
  const settleMs = parseInt(args.wait ?? "1500", 10);

  await mkdir(dirname(outPath), { recursive: true });

  // Optionally bring up `next dev` if no server is responding
  let devProc = null;
  if (args["start-server"]) {
    const baseUrl = new URL(url).origin;
    if (!(await isServerUp(baseUrl))) {
      console.log(`→ starting next dev (no server at ${baseUrl})`);
      devProc = spawn("npm", ["run", "dev"], {
        cwd: process.cwd(),
        stdio: ["ignore", "pipe", "pipe"],
        detached: false,
      });
      const ok = await waitForServer(baseUrl, 60000);
      if (!ok) {
        devProc.kill();
        console.error(`error: dev server did not come up at ${baseUrl} within 60s`);
        process.exit(1);
      }
      console.log(`✓ dev server up at ${baseUrl}`);
    }
  }

  console.log(`→ launching headless chromium`);
  const browser = await chromium.launch({ headless: true, args: ["--mute-audio"] });
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();

  try {
    console.log(`→ loading ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // A locked deck answers with the passcode form, and that isn't what you want a PDF of.
    if (new URL(page.url()).pathname === "/unlock") {
      const passcode = args.passcode ?? process.env.DECK_PASSCODE;
      if (!passcode) throw new Error("this deck is locked. Set DECK_PASSCODE or pass --passcode <code>.");
      await page.getByLabel("Passcode").fill(passcode);
      await page.getByRole("button", { name: "Open" }).click();
      await page.waitForLoadState("networkidle");
      if (new URL(page.url()).pathname === "/unlock") throw new Error("that passcode didn't work.");
    }

    // Settle: wait for fonts + any straggler animations
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await page.waitForTimeout(settleMs);

    console.log(`→ rendering pdf at ${width}×${height}`);
    await page.pdf({
      path: outPath,
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    console.log(`✓ wrote ${outPath}`);
  } catch (err) {
    console.error(`error: pdf export failed : `, err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
    if (devProc) {
      console.log(`→ stopping dev server`);
      devProc.kill();
    }
  }
}

main();
