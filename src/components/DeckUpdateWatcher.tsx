"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const POLL_MS = 3_000;
const WARM_TIMEOUT_MS = 3_000;
// Nothing a tab asks for gets to hang forever, or one stuck request stops all updates.
const REQUEST_TIMEOUT_MS = 20_000;
// How long a slow connection gets to deliver a swap before we ask again.
const REFRESH_PATIENCE_MS = 30_000;
// A refresh that hasn't landed after this many goes falls back to a reload.
const MAX_REFRESH_TRIES = 5;
const SETTLE_MS = 1_000;
const RETRY_MS = 3_000;

/** Don't yank the page out from under someone booking a call or watching a film. */
function viewerIsBusy() {
  if (document.querySelector('[role="dialog"]')) return true;
  return Array.from(document.querySelectorAll("video")).some(
    (video) => !video.paused && !video.muted,
  );
}

/** Pick up where a reload left off, then clean the URL back up. */
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

const scriptPaths = (root: Document) =>
  Array.from(root.querySelectorAll("script[src]"), (el) =>
    new URL(el.getAttribute("src")!, window.location.href).pathname,
  );

/** Fetch the new page. Mid-deploy a server can still hand back the old one, so check. */
async function fetchNewPage(version: string) {
  const res = await fetch(resumeUrl(), { cache: "no-store", signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (res.redirected && new URL(res.url).pathname === "/unlock") {
    // The deck got locked, or its passcode changed. Show this viewer the form.
    window.location.reload();
    return null;
  }
  if (!res.ok) return null;
  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  return doc.documentElement.dataset.deckBuild === version ? doc : null;
}

/** Load what the new page needs before leaving this one, so the reload has nothing to wait for. */
async function warm(doc: Document) {
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
}

/**
 * Keeps an open deck current. Every page is stamped with the build that rendered
 * it, and this compares that stamp to the live build.
 *
 * Slide copy and brand values are rendered on the server and aren't in any JS
 * chunk. So when the new page needs no script this tab hasn't already loaded, only
 * content changed, and it swaps in with no reload: same slide, same scroll, modals
 * and typing untouched.
 *
 * When the new page does need new scripts, this tab's code is out of date and only
 * a reload can fix that. That one waits for the viewer, and the server renders the
 * new page already in place so it doesn't flash.
 */
export default function DeckUpdateWatcher() {
  const router = useRouter();

  useEffect(() => {
    finishResume();

    document.documentElement.dataset.deckReady = "";

    // Next pins its refreshes to the deployment this tab loaded from, and reloads
    // the page if the answer comes from any other. For a content swap we want the
    // newest deployment and no reload, so for those requests we drop the pin and
    // vouch for the answer ourselves. If this ever stops matching how Next works,
    // the worst case is that Next falls back to a reload.
    //
    // Next also navigates away if the request can't connect, which offline means a
    // browser error page in front of whoever's watching. So a dropped connection
    // just waits here and tries again.
    const realFetch = window.fetch;
    let swapping = false;
    let refreshedAt = 0;
    let waitingOnNetwork = false;
    window.fetch = async (input, init) => {
      const headers = new Headers(init?.headers);
      if (!swapping || !headers.has("RSC")) return realFetch(input, init);
      const pin = headers.get("x-deployment-id");
      headers.delete("x-deployment-id");
      for (;;) {
        try {
          const signal = AbortSignal.timeout(REFRESH_PATIENCE_MS);
          const res = await realFetch(input, {
            ...init,
            headers,
            signal: init?.signal ? AbortSignal.any([init.signal, signal]) : signal,
          });
          waitingOnNetwork = false;
          if (!res.ok) refreshedAt = 0;
          // Patience is for a request that's still coming. Once it's all here and the
          // page didn't change, it came from a server that hasn't caught up: ask again.
          res
            .clone()
            .arrayBuffer()
            .then(() => setTimeout(() => (refreshedAt = 0), SETTLE_MS))
            .catch(() => {});
          if (!pin) return res;
          const vouched = new Response(res.body, res);
          vouched.headers.set("x-nextjs-deployment-id", pin);
          Object.defineProperty(vouched, "url", { value: res.url });
          Object.defineProperty(vouched, "redirected", { value: res.redirected });
          return vouched;
        } catch {
          if (init?.signal?.aborted) throw new DOMException("Aborted", "AbortError");
          waitingOnNetwork = true;
          await new Promise((resolve) => setTimeout(resolve, RETRY_MS));
        }
      }
    };

    let checking = false;
    let seenStamp = document.documentElement.dataset.deckBuild;
    let tries = 0;
    let needsReloadFor: string | null = null;

    const check = async () => {
      if (checking || document.visibilityState === "hidden") return;
      checking = true;
      try {
        const res = await fetch("/api/deck-version", {
          cache: "no-store",
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (!res.ok) return;
        const { version } = (await res.json()) as { version: string };
        const stamp = document.documentElement.dataset.deckBuild;
        if (stamp !== seenStamp) {
          seenStamp = stamp;
          tries = 0;
          refreshedAt = 0;
        }
        if (version === stamp) {
          swapping = false;
          return;
        }
        // A swap is on its way, however slowly. Don't pile on.
        if (waitingOnNetwork || Date.now() - refreshedAt < REFRESH_PATIENCE_MS) return;
        // New code, and someone's busy: no need to fetch the page again every tick.
        if (needsReloadFor === version && viewerIsBusy()) return;

        const doc = await fetchNewPage(version);
        if (!doc) return;

        const loaded = new Set(scriptPaths(document));
        const sameCode = scriptPaths(doc).every((path) => loaded.has(path));
        if (sameCode && tries < MAX_REFRESH_TRIES) {
          tries++;
          swapping = true;
          refreshedAt = Date.now();
          router.refresh();
          return;
        }

        swapping = false;
        needsReloadFor = version;
        if (viewerIsBusy()) return;
        await warm(doc);
        if (viewerIsBusy()) return;
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
    window.addEventListener("online", check);
    return () => {
      window.fetch = realFetch;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("online", check);
    };
  }, [router]);

  return null;
}
