"use client";

import { useBrand } from "@/components/BrandContext";

type Props = {
  visible: boolean;
  clientLabel?: string;
  clientLogoSrc?: string;
  clientLogoAlt?: string;
};

export default function ClientLogoHeader({
  visible,
  clientLabel,
  clientLogoSrc,
  clientLogoAlt,
}: Props) {
  const brand = useBrand();
  const label = clientLabel ?? brand.client;
  return (
    <div
      aria-hidden={!visible}
      className={`print:hidden fixed top-0 inset-x-0 z-40 h-16 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Liquid-glass ribbon */}
      <div className="absolute inset-0 bg-[#0a0a0a]/40 backdrop-blur-xl backdrop-saturate-150 border-b border-white/10" />
      {/* Subtle top highlight for the "liquid" sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative h-full flex items-center px-4 sm:px-6">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to cover"
          className="flex items-center gap-4 sm:gap-6 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
        >
          {clientLogoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clientLogoSrc}
              alt={clientLogoAlt ?? label}
              className="h-4 sm:h-5 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
            />
          ) : (
            <span className="text-white text-xs sm:text-sm font-semibold tracking-[0.25em] sm:tracking-[0.3em] uppercase opacity-90 group-hover:opacity-100 transition-opacity">
              {label}
            </span>
          )}
          <span className="text-white/40 text-base sm:text-lg font-light">×</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wmark.svg" alt={brand.name} className="h-5 sm:h-6 w-auto opacity-90 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}
