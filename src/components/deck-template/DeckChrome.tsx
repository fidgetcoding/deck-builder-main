"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import type { SlideMeta } from "./slideTypes";
import { useBrand } from "@/components/BrandContext";
import ContactModalTrigger from "@/components/shared/ContactModalTrigger";

type Props = {
  slides: SlideMeta[];
  currentIdx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
  onJumpHome: () => void;
  burgerOpen: boolean;
  setBurgerOpen: (v: boolean) => void;
  filmstripOpen: boolean;
  setFilmstripOpen: (v: boolean) => void;
  chromeVariant?: "circle" | "rounded-rect";
};

export default function DeckChrome({
  slides,
  currentIdx,
  total,
  onPrev,
  onNext,
  onJump,
  onJumpHome,
  burgerOpen,
  setBurgerOpen,
  filmstripOpen,
  setFilmstripOpen,
  chromeVariant = "circle",
}: Props) {
  const brand = useBrand();
  const ACCENT = brand.accent;
  const sections = slides.flatMap((slide, firstSlideIndex) =>
    slide.section ? [{ id: slide.section, label: slide.section, firstSlideIndex }] : [],
  );
  // Hover is for a real mouse only. A tap also fires fake hover events, and racing
  // those against the click could close a menu the tap just opened.
  const hoveredOpenAt = useRef(0);
  const hoverOpenBurger = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    hoveredOpenAt.current = Date.now();
    setBurgerOpen(true);
  };
  const hoverCloseBurger = (e: PointerEvent) => {
    if (e.pointerType === "mouse") setBurgerOpen(false);
  };
  const clickBurger = () => {
    // Hovering opened it a moment ago, so a click on the way in shouldn't undo that.
    if (Date.now() - hoveredOpenAt.current < 400) return;
    setBurgerOpen(!burgerOpen);
  };
  const isRect = chromeVariant === "rounded-rect";
  // Size-proportional radii (~25% of side) for clear rounded-square look on every button
  const burgerShape = isRect ? "rounded-[10px]" : "rounded-full";   // 40x40
  const chevronShape = isRect ? "rounded-[14px]" : "rounded-full";  // 56x56
  const filmstripToggleShape = isRect ? "rounded-[7px]" : "rounded-full"; // 28x28
  const filmstripCloseShape = isRect ? "rounded-[8px]" : "rounded-full";  // 32x32
  const meta = slides[currentIdx];
  const activeSection = meta?.section ?? null;
  const progressPct = total > 1 ? (currentIdx / (total - 1)) * 100 : 0;
  const atFirst = currentIdx === 0;
  const atLast = currentIdx === total - 1;
  const isCover = currentIdx === 0;

  const trayScrollRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const btn = thumbRefs.current[currentIdx];
    const container = trayScrollRef.current;
    if (!btn || !container) return;
    const target = btn.offsetLeft - container.clientWidth / 2 + btn.offsetWidth / 2;
    container.scrollTo({ left: target, behavior: "smooth" });
  }, [currentIdx]);

  return (
    <>
      {!isCover && (
        <div className="absolute top-0 inset-x-0 z-40 h-16 flex items-center px-4 sm:px-6 bg-[#0a0a0a]/70 backdrop-blur-md border-b border-white/5">
          <button
            type="button"
            onClick={onJumpHome}
            className="flex items-center gap-3 sm:gap-4 shrink-0 group focus:outline-none focus-visible:ring-2 rounded"
            style={{ ["--tw-ring-color" as string]: ACCENT }}
            aria-label="Return to cover"
          >
            <span className="text-white/80 text-[11px] sm:text-xs font-bold uppercase tracking-[0.22em] group-hover:text-white transition-colors">
              {brand.client}
            </span>
            <span className="text-white/30 text-base leading-none">×</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/wmark.svg"
              alt={brand.name}
              className="h-5 sm:h-6 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </button>

          <div
            className="relative flex-1 min-w-0 flex justify-end items-center pl-4"
            onPointerLeave={hoverCloseBurger}
          >
            <div
              className={`flex items-center gap-3 sm:gap-5 md:gap-7 overflow-x-auto no-scrollbar transition-opacity duration-200 ${
                burgerOpen ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
              aria-hidden={burgerOpen}
            >
              {sections.map((s) => {
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onJump(s.firstSlideIndex)}
                    className="shrink-0 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] py-1 transition-colors focus:outline-none"
                    style={{ color: active ? ACCENT : "rgba(255,255,255,0.6)" }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            <div
              className={`absolute right-0 flex items-center gap-3 sm:gap-5 md:gap-7 transition-opacity duration-200 ${
                burgerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={!burgerOpen}
              onPointerEnter={hoverOpenBurger}
            >
              <ContactModalTrigger className="shrink-0 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] py-1 text-white/80 hover:text-white transition-colors focus:outline-none cursor-pointer">
                Contact
              </ContactModalTrigger>
            </div>
          </div>

          <button
            type="button"
            onPointerEnter={hoverOpenBurger}
            onClick={clickBurger}
            aria-expanded={burgerOpen}
            aria-label={burgerOpen ? "Close menu" : "Open menu"}
            className={`ml-3 sm:ml-4 shrink-0 flex items-center justify-center w-10 h-10 ${burgerShape} bg-white/0 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors focus:outline-none`}
          >
            {burgerOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          <div
            className="absolute left-0 bottom-0 h-[2px] transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%`, background: ACCENT }}
            aria-hidden
          />
        </div>
      )}

      {isCover && (
        <div
          className="absolute top-3 right-4 sm:right-6 z-40 flex items-center gap-3 sm:gap-5 md:gap-7"
          onPointerEnter={hoverOpenBurger}
          onPointerLeave={hoverCloseBurger}
        >
          <div
            className={`flex items-center gap-3 sm:gap-5 md:gap-7 transition-opacity duration-200 ${
              burgerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!burgerOpen}
          >
            <ContactModalTrigger className="shrink-0 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] py-1 text-white/80 hover:text-white transition-colors focus:outline-none cursor-pointer">
              Contact
            </ContactModalTrigger>
          </div>

          <button
            type="button"
            onClick={clickBurger}
            aria-expanded={burgerOpen}
            aria-label={burgerOpen ? "Close menu" : "Open menu"}
            className={`flex items-center justify-center w-10 h-10 ${burgerShape} bg-[#0a0a0a]/70 backdrop-blur border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors focus:outline-none`}
          >
            {burgerOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Section pill removed: each slide has its own eyebrow text */}

      {!isCover && (
        <button
          type="button"
          onMouseEnter={() => { if (!atFirst) onPrev(); }}
          disabled={atFirst}
          aria-label="Previous slide"
          className={`hidden sm:flex absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 items-center justify-center ${chevronShape} border border-white/10 bg-[#0a0a0a]/40 backdrop-blur transition-all focus:outline-none ${
            atFirst ? "opacity-20 cursor-not-allowed" : "text-white/80 hover:-translate-x-0.5"
          }`}
          style={
            atFirst
              ? undefined
              : {
                  // hover handled inline below via group-hover-equivalent: keep border subtle by default
                }
          }
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {!isCover && (
        <button
          type="button"
          onMouseEnter={() => { if (!atLast) onNext(); }}
          disabled={atLast}
          aria-label="Next slide"
          className={`hidden sm:flex absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 items-center justify-center ${chevronShape} border border-white/10 bg-[#0a0a0a]/40 backdrop-blur transition-all focus:outline-none ${
            atLast ? "opacity-20 cursor-not-allowed" : "text-white/80 hover:translate-x-0.5"
          }`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      <div className="sm:hidden absolute bottom-0 inset-x-0 z-30 h-12 bg-[#0a0a0a]/80 backdrop-blur border-t border-white/5 flex items-center justify-between px-4">
        <button
          type="button"
          onClick={onPrev}
          disabled={atFirst}
          aria-label="Previous slide"
          className={`flex items-center justify-center w-10 h-10 ${atFirst ? "opacity-20" : "text-white/80"}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setFilmstripOpen(!filmstripOpen)}
          aria-expanded={filmstripOpen}
          aria-label="Toggle slide tray"
          className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${filmstripOpen ? "rotate-180" : ""}`}>
            <polyline points="18 15 12 9 6 15" />
          </svg>
          <span className="tabular-nums">{String(currentIdx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={atLast}
          aria-label="Next slide"
          className={`flex items-center justify-center w-10 h-10 ${atLast ? "opacity-20" : "text-white/80"}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="hidden sm:flex absolute bottom-4 right-5 z-30 items-center gap-3">
        <button
          type="button"
          onPointerEnter={(e) => { if (e.pointerType === "mouse") setFilmstripOpen(true); }}
          onClick={() => setFilmstripOpen(!filmstripOpen)}
          aria-expanded={filmstripOpen}
          aria-label={filmstripOpen ? "Close slide tray" : "Open slide tray"}
          className={`flex items-center justify-center w-7 h-7 ${filmstripToggleShape} border border-white/10 bg-[#0a0a0a]/40 backdrop-blur text-white/70 transition-colors focus:outline-none`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${filmstripOpen ? "rotate-180" : ""}`}>
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 tabular-nums">
          {String(currentIdx + 1).padStart(2, "0")} <span className="text-white/25">/</span> {String(total).padStart(2, "0")}
        </div>
      </div>

      <div
        className={`absolute left-0 right-0 z-40 transition-transform duration-300 ease-out bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 ${
          filmstripOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ bottom: 0, height: "168px" }}
        aria-hidden={!filmstripOpen}
      >
        <button
          type="button"
          onClick={() => setFilmstripOpen(false)}
          onPointerEnter={(e) => { if (e.pointerType === "mouse") setFilmstripOpen(false); }}
          aria-label="Close slide tray"
          className={`absolute top-2 right-3 z-10 flex items-center justify-center w-8 h-8 ${filmstripCloseShape} border border-white/20 bg-[#0a0a0a]/80 text-white transition-colors focus:outline-none`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div ref={trayScrollRef} className="h-full overflow-x-auto overflow-y-hidden no-scrollbar pl-4 sm:pl-6 pr-28 pt-7 pb-3 flex items-center gap-3">
          {slides.map((s, i) => {
            const active = i === currentIdx;
            return (
              <button
                key={s.id}
                ref={(el) => { thumbRefs.current[i] = el; }}
                type="button"
                onClick={() => onJump(i)}
                aria-label={`Jump to slide ${i + 1}: ${s.caption}`}
                className="shrink-0 group flex flex-col items-start gap-1.5 focus:outline-none rounded"
              >
                <div
                  className="relative w-[200px] h-[112px] rounded overflow-hidden border transition-colors"
                  style={{
                    borderColor: active ? ACCENT : "rgba(255,255,255,0.1)",
                  }}
                >
                  <ThumbPreview slideId={s.id} caption={s.caption} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-2 text-[10px] font-semibold uppercase tracking-widest text-white/90 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  {active && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-widest pl-1" style={{ color: active ? ACCENT : "rgba(255,255,255,0.4)" }}>
                  {s.caption}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ThumbPreview({ slideId, caption }: { slideId: string; caption: string }) {
  const ACCENT = useBrand().accent;
  const isCover = slideId === "cover";
  const isNextSteps = slideId === "next-steps";
  const bg = isCover || isNextSteps ? ACCENT : "#0a0a0a";
  const fg = isCover || isNextSteps ? "#ffffff" : ACCENT;
  return (
    <div className="absolute inset-0 flex items-center justify-center px-3 text-center" style={{ background: bg }}>
      <span className="block text-[10px] font-bold uppercase tracking-wider leading-tight" style={{ color: fg }}>
        {caption}
      </span>
    </div>
  );
}
