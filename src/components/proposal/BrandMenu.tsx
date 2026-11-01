"use client";

import { useRef, useState, type PointerEvent } from "react";
import ContactModalTrigger from "@/components/shared/ContactModalTrigger";
import type { BrandConfig } from "./brands";

interface Props {
  brand: BrandConfig;
  chromeVariant?: "circle" | "rounded-rect";
}

export default function BrandMenu({ brand, chromeVariant = "circle" }: Props) {
  const [open, setOpen] = useState(false);
  const openedAt = useRef(0);
  // Hover is for a real mouse only. A tap also fires fake hover events, and racing
  // those against the click could close the menu the tap just opened.
  const handleOpen = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    setOpen(true);
    openedAt.current = Date.now();
  };
  const handleLeave = (e: PointerEvent) => {
    if (e.pointerType === "mouse") setOpen(false);
  };
  const isRect = chromeVariant === "rounded-rect";
  const navShape = isRect ? "rounded-[10px]" : "rounded-full";
  const containerPos = isRect
    ? "print:hidden fixed top-3 right-4 sm:right-6 z-50 flex items-center gap-3 sm:gap-5 md:gap-7"
    : "print:hidden fixed top-4 right-4 z-50 flex items-center gap-3 sm:gap-5 md:gap-7";
  const burgerSize = isRect ? "w-10 h-10" : "w-11 h-11";

  return (
    <div
      className={containerPos}
      onPointerEnter={handleOpen}
      onPointerLeave={handleLeave}
    >
      <div
        className={`flex items-center gap-3 sm:gap-5 md:gap-7 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <ContactModalTrigger
          className="shrink-0 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] py-1 transition-colors cursor-pointer bg-transparent border-0"
        >
          Contact
        </ContactModalTrigger>
      </div>

      <button
        type="button"
        onClick={() => {
          // Hovering opened it a moment ago, so a click on the way in shouldn't undo that.
          if (Date.now() - openedAt.current < 400) return;
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className={`flex items-center justify-center ${burgerSize} ${navShape} backdrop-blur transition-colors focus:outline-none`}
        style={{
          backgroundColor: `${brand.bg}b3`,
          border: `1px solid ${brand.fg}1a`,
          color: brand.fg,
        }}
      >
        {open ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.85 }}
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.85 }}
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>
    </div>
  );
}
