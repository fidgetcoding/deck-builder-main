"use client";

import FadeIn from "@/components/helpers/FadeIn";
import { useBrand } from "@/components/BrandContext";

/**
 * Scroll-view cover hero: mirrors deck-template/slides/SlideCover.tsx
 * but laid out as a full-viewport scroll section instead of absolute inset.
 * Sits above BrandProposal in DualTemplate when view === "proposal".
 */
export default function ProposalCover() {
  const brand = useBrand();
  const ACCENT = brand.accent;
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0a0a0a]">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/75 via-black/40 to-black/85" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <FadeIn>
          <p
            className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[0.18em] mb-4"
            style={{ color: ACCENT }}
          >
            {brand.client}
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <p className="text-2xl font-light leading-none text-white/50 mb-4">×</p>
        </FadeIn>
        <FadeIn delay={200}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wmark.svg"
            alt={brand.name}
            width={135}
            className="mx-auto mb-12"
          />
        </FadeIn>
        <FadeIn delay={320}>
          <p className="mt-6 text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-white text-balance sm:whitespace-nowrap">
            {brand.coverHeadline}
          </p>
        </FadeIn>
        <FadeIn delay={440}>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            {brand.coverSubtitle}
          </p>
        </FadeIn>
      </div>

      <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <FadeIn delay={560}>
          <a
            href="#letter"
            onMouseEnter={() => {
              if (typeof document === "undefined") return;
              const el = document.getElementById("letter") ?? document.getElementById("contents");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("letter") ?? document.getElementById("contents");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            aria-label="Scroll into the proposal"
            className="scroll-hint-link inline-flex text-white/80 hover:text-white pointer-events-auto"
          >
            <span className="scroll-hint-inner animate-scroll-hint inline-flex">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </a>
        </FadeIn>
      </div>

      <div className="absolute bottom-8 left-0 right-0 z-10 text-center pointer-events-none">
        <FadeIn delay={680}>
          <p className="text-xs text-white/40 uppercase tracking-[0.25em]">
            Prepared by {brand.name} · Confidential
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
