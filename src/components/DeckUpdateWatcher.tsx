"use client";

import { useEffect } from "react";

const POLL_MS = 15_000;
const RESTORE_KEY = "deck_restore_scroll";

/** Don't yank the page out from under someone booking a call or watching a film. */
function viewerIsBusy() {
  if (document.querySelector('[role="dialog"]')) return true;
  return Array.from(document.querySelectorAll("video")).some(
    (video) => !video.paused && !video.muted,
  );
}

function restoreScroll() {
  let saved: string | null = null;
  try {
    saved = sessionStorage.getItem(RESTORE_KEY);
    sessionStorage.removeItem(RESTORE_KEY);
  } catch {
    return;
  }
  const y = saved ? parseInt(saved, 10) : 0;
  if (!y) return;

  // The scroll view mounts a frame or two after this runs, so wait for height.
  let attempts = 0;
  const tryRestore = () => {
    const tallEnough = document.documentElement.scrollHeight >= y + window.innerHeight;
    if (tallEnough || attempts > 120) {
      window.scrollTo({ top: y, behavior: "instant" });
    } else {
      attempts++;
      requestAnimationFrame(tryRestore);
    }
  };
  requestAnimationFrame(tryRestore);
}

/**
 * Keeps an open deck current. A push builds a new deployment, but a tab that's
 * already open is still running the old bundle, so it would never see the edit.
 *
 * This remembers the version it first saw and reloads when that changes. The
 * slide lives in the URL hash and the view in ?view=, so a reload lands in the
 * same place. Comparing against the first answer (rather than a value baked into
 * the bundle) means a reload can't loop.
 */
export default function DeckUpdateWatcher() {
  useEffect(() => {
    restoreScroll();

    let baseline: string | null = null;
    let updateWaiting = false;
    let reloading = false;

    const check = async () => {
      if (reloading || document.visibilityState === "hidden") return;
      try {
        if (!updateWaiting) {
          const res = await fetch("/api/deck-version", { cache: "no-store" });
          if (!res.ok) return;
          const { version } = (await res.json()) as { version: string };
          if (baseline === null) baseline = version;
          else if (version !== baseline) updateWaiting = true;
        }
      } catch {
        // Offline or mid-deploy. The next tick tries again.
        return;
      }
      if (!updateWaiting || viewerIsBusy()) return;

      reloading = true;
      try {
        sessionStorage.setItem(RESTORE_KEY, String(Math.round(window.scrollY)));
      } catch {
        // Private mode: the reload still works, it just starts at the top.
      }
      window.location.reload();
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
