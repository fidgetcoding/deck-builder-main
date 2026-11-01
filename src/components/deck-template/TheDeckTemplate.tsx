"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import DeckChrome from "./DeckChrome";
import { slides } from "./slidesRegistry";

const TRANSITION_MS = 300;

/** The slide under this element, if its content is taller than the screen. */
function scrollingSlide(target: EventTarget | null): HTMLElement | null {
  const slide = target instanceof Element ? target.closest("section") : null;
  return slide && slide.scrollHeight > slide.clientHeight + 1 ? (slide as HTMLElement) : null;
}

type Props = {
  onSlideChange?: (idx: number) => void;
  initialSlideIdx?: number;
  chromeVariant?: "circle" | "rounded-rect";
};

export default function TheDeckTemplate({ onSlideChange, initialSlideIdx = 0, chromeVariant }: Props = {}) {
  const total = slides.length;
  const [current, setCurrent] = useState(() =>
    Math.max(0, Math.min(slides.length - 1, initialSlideIdx)),
  );

  useEffect(() => {
    onSlideChange?.(current);
  }, [current, onSlideChange]);

  useEffect(() => {
    document.documentElement.dataset.deckView ??= "deck";
  }, []);
  const [prev, setPrev] = useState<number | null>(null);
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [filmstripOpen, setFilmstripOpen] = useState(false);
  const transitionTimer = useRef<number | null>(null);

  const goTo = useCallback(
    (idxRaw: number) => {
      const idx = Math.max(0, Math.min(total - 1, idxRaw));
      setCurrent((cur) => {
        if (idx === cur) return cur;
        setPrev(cur);
        if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
        transitionTimer.current = window.setTimeout(() => setPrev(null), TRANSITION_MS + 40);
        return idx;
      });
      setBurgerOpen(false);
    },
    [total],
  );

  useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(/^#(\d+)$/);
      if (m) {
        const target = parseInt(m[1], 10) - 1;
        if (Number.isFinite(target)) {
          setCurrent((cur) => {
            const next = Math.max(0, Math.min(total - 1, target));
            return next === cur ? cur : next;
          });
        }
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [total]);

  useEffect(() => {
    const desired = `#${current + 1}`;
    if (typeof window !== "undefined" && window.location.hash !== desired) {
      window.history.replaceState(null, "", desired);
    }
  }, [current]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goTo(current - 1);
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goTo(current + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFilmstripOpen(true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (current === 0) {
          goTo(1);
        } else {
          setFilmstripOpen(false);
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(total - 1);
      } else if (e.key === "Escape") {
        setFilmstripOpen(false);
        setBurgerOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, total, goTo]);

  // Wheel / trackpad → advance slide. One gesture = one slide via debounce
  // so a single trackpad swipe doesn't fire through 5 slides at once.
  useEffect(() => {
    let lastWheelAt = 0;
    let lastInnerScrollAt = 0;
    const WHEEL_DEBOUNCE_MS = 450;
    const WHEEL_DELTA_THRESHOLD = 24;
    function onWheel(e: WheelEvent) {
      // Ignore while filmstrip or burger is open: they have their own scroll.
      if (filmstripOpen || burgerOpen) return;
      // Ignore predominantly-horizontal scrolls (trackpad swipe sideways).
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const now = Date.now();
      // A slide taller than the screen scrolls first, and momentum from that
      // scroll hitting the end shouldn't flip the slide.
      const slide = scrollingSlide(e.target);
      if (slide) {
        const atEnd =
          e.deltaY > 0
            ? slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 1
            : slide.scrollTop <= 0;
        if (!atEnd || now - lastInnerScrollAt < WHEEL_DEBOUNCE_MS) {
          lastInnerScrollAt = now;
          return;
        }
      }
      if (Math.abs(e.deltaY) < WHEEL_DELTA_THRESHOLD) return;
      if (now - lastWheelAt < WHEEL_DEBOUNCE_MS) return;
      lastWheelAt = now;
      goTo(current + (e.deltaY > 0 ? 1 : -1));
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [current, goTo, filmstripOpen, burgerOpen]);

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goTo(current + 1);
      else goTo(current - 1);
    } else if (scrollingSlide(e.target)) {
      // That vertical swipe was scrolling the slide.
    } else if (dy < -60 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      setFilmstripOpen(true);
    } else if (dy > 60 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      setFilmstripOpen(false);
    }
    touchStart.current = null;
  }

  return (
    <>
    <div
      className="print:hidden fixed inset-0 bg-[#0a0a0a] text-white overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0">
        {slides.map((slide, i) => {
          const active = i === current;
          const showing = i === current || i === prev;
          const Component = slide.Component;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-[#0a0a0a] transition-[opacity,transform] ease-out ${
                active ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              style={{
                transitionDuration: `${TRANSITION_MS}ms`,
                transformOrigin: "center top",
              }}
              aria-hidden={!active}
            >
              {showing ? <Component /> : null}
            </div>
          );
        })}
      </div>

      <DeckChrome
        currentIdx={current}
        total={total}
        onPrev={() => goTo(current - 1)}
        onNext={() => goTo(current + 1)}
        onJumpHome={() => goTo(0)}
        onJump={goTo}
        burgerOpen={burgerOpen}
        setBurgerOpen={setBurgerOpen}
        filmstripOpen={filmstripOpen}
        setFilmstripOpen={setFilmstripOpen}
        chromeVariant={chromeVariant}
      />
    </div>

    {/* What a browser prints: every slide, one to a page. */}
    <div className="deck-print hidden print:block text-white" aria-hidden="true">
      {slides.map((slide) => (
        <div key={slide.id} className="deck-print-slide">
          <slide.Component />
        </div>
      ))}
    </div>
    </>
  );
}
