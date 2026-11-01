"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const SCROLL_KEY = "deck_scroll_";

export default function ViewTransitionHandler() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const navigatingAway = useRef(false);

  // Continuously save scroll position for current page
  // but skip saving if we're in the middle of navigating away
  useEffect(() => {
    navigatingAway.current = false;
    const save = () => {
      if (navigatingAway.current) return;
      const y = window.scrollY;
      if (y > 0) {
        sessionStorage.setItem(SCROLL_KEY + pathname, String(y));
      }
    };
    window.addEventListener("scroll", save, { passive: true });
    // Save immediately on mount too
    save();
    return () => window.removeEventListener("scroll", save);
  }, [pathname]);

  // Restore scroll when pathname changes (back/forward)
  const handleRouteChange = useCallback(() => {
    const saved = sessionStorage.getItem(SCROLL_KEY + pathname);
    if (saved && parseInt(saved) > 0) {
      const scrollY = parseInt(saved);
      // Keep trying to restore scroll until the page is tall enough
      let attempts = 0;
      const tryRestore = () => {
        if (document.documentElement.scrollHeight > scrollY + window.innerHeight * 0.5 || attempts > 20) {
          window.scrollTo(0, scrollY);
        } else {
          attempts++;
          requestAnimationFrame(tryRestore);
        }
      };
      // Wait for view transition to finish before restoring
      setTimeout(tryRestore, 200);
    }
  }, [pathname]);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    handleRouteChange();
  }, [pathname, handleRouteChange]);

  // Intercept popstate for view transition
  useEffect(() => {
    if (!document.startViewTransition) return;

    let pending = false;
    const handlePopState = () => {
      if (pending) return;
      pending = true;
      document.startViewTransition!(() => {
        pending = false;
        return Promise.resolve();
      });
    };

    window.addEventListener("popstate", handlePopState, true);
    return () => window.removeEventListener("popstate", handlePopState, true);
  }, []);

  return null;
}
