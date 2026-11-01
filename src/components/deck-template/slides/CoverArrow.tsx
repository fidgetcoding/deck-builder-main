"use client";

import type { ReactNode } from "react";

export default function CoverArrow({ children }: { children: ReactNode }) {
  return (
    <a
      href="#2"
      onMouseEnter={() => {
        window.location.hash = "#2";
      }}
      aria-label="Continue into the deck"
      className="scroll-hint-link inline-flex text-white/80 hover:text-white pointer-events-auto"
    >
      {children}
    </a>
  );
}
