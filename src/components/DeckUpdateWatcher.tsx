"use client";

import { useEffect } from "react";

const POLL_MS = 5_000;
const WARM_TIMEOUT_MS = 3_000;

/** Don't yank the page out from under someone booking a call or watching a film. */
function viewerIsBusy() {
  if (document.querySelector('[role="dialog"]')) return true;
  return Array.from(document.querySelectorAll("video")).some(
    (video) => !video.paused && !video.muted,
  );
}

/** Pick up where a live update left off, then clean the URL back up. */
function finishResume() {
  const url = new URL(window.location.href);
  const resume = url.searchParams.get("resume");
  if (resume === null) return;
  url.searchParams.delete("resume");
  window.history.replaceState(window.history.state, "", url);

  const y = url.searchParams.get("view") === "scroll" ? parseInt(resume, 10) : 0;
  if (!y) return;
  // Normally the browser has already put us there. This covers the ones that don't.
  let attempts = 0;
  const tryRestore = () => {
    const tallEnough = document.documentElement.scrollHeight >= y + window.innerHeight;
    if (tallEnough || attempts > 120) {
      if (Math.abs(window.scrollY - y) > 1) window.scrollTo({ top: y, behavior: "instant" });
    } else {
      attempts++;
      requestAnimationFrame(tryRestore);
    }
  };
  tryRestore();
}

/** The URL that makes the server render this exact spot, already in place. */
function resumeUrl() {
  const url = new URL(window.location.href);
  const view = document.documentElement.dataset.deckView;
  if (view === "deck") {
    const slide = window.location.hash.match(/^#(\d+)$/)?.[1] ?? "1";
    url.searchParams.set("view", "deck");
    url.searchParams.set("resume", slide);
  } else if (view === "scroll") {
    url.searchParams.set("view", "scroll");
    url.searchParams.set("resume", String(Math.round(window.scrollY)));
  }
  return url;
}

/**
 * Load the new build before leaving the old one, so the reload has nothing to
 * wait for. Mid-deploy, a server can say there's a new build and still hand back
 * the old page, so this returns false until the page itself is the new one.
 */
async function warm(url: URL, version: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return false;
  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  if (doc.documentElement.dataset.deckBuild !== version) return false;
  const assets = Array.from(
    doc.querySelectorAll<HTMLScriptElement | HTMLLinkElement>(
      'script[src], link[rel="stylesheet"], link[rel="preload"]',
    ),
    (el) => el.getAttribute("src") ?? el.getAttribute("href"),
  ).filter((asset): asset is string => !!asset?.startsWith("/"));
  await Promise.race([
    Promise.allSettled(assets.map((asset) => fetch(asset))),
    new Promise((resolve) => setTimeout(resolve, WARM_TIMEOUT_MS)),
  ]);
  return true;
}

/**
 * Keeps an open deck current. A push builds a new deployment, but a tab that's
 * already open is still running the old bundle, so it would never see the edit.
 *
 * Every page is stamped with the build that rendered it, and this compares that
 * stamp to the live build. A page that came back stale still reads as stale, so
 * it tries again rather than sitting on old copy forever.
 *
 * It's still a reload, because a new build means new code, but the server renders
 * the new page already on the right slide or scroll position and the browser holds
 * the old frame until it's ready, so only the edit changes.
 */
export default function DeckUpdateWatcher() {
  useEffect(() => {
    finishResume();

    const rendered = document.documentElement.dataset.deckBuild;
    let checking = false;

    const check = async () => {
      if (checking || document.visibilityState === "hidden") return;
      checking = true;
      try {
        const res = await fetch("/api/deck-version", { cache: "no-store" });
        if (!res.ok) return;
        const { version } = (await res.json()) as { version: string };
        if (version === rendered || viewerIsBusy()) return;
        if (!(await warm(resumeUrl(), version)) || viewerIsBusy()) return;

        // Read the spot again: they may have moved on while the new build warmed up.
        window.history.replaceState(window.history.state, "", resumeUrl());
        window.location.reload();
      } catch {
        // Offline or mid-deploy. The next tick tries again.
      } finally {
        checking = false;
      }
    };

    check();
    const interval = window.setInterval(check, POLL_MS);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return null;
}
