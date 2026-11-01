"use client";

import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

export default function SlideHeader06() {
  return (
    <section className="absolute inset-0 overflow-hidden pt-28 pb-16 px-6 sm:px-12">
      <div className="mx-auto max-w-6xl h-full flex flex-col">
        <FadeIn>
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: ACCENT }}
          >
            HEADER 06: Section Eyebrow
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl mb-10 text-white">
            [Headline: pricing or scope tiers.]
          </h2>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-3 md:gap-6 flex-1">
          {[
            { label: "[OPTION 01]", value: "[$X]", featured: false },
            { label: "[OPTION 02]", value: "[$Y]", featured: true },
            { label: "[OPTION 03]", value: "[$Z]", featured: false },
          ].map((opt, i) => (
            <FadeIn key={opt.label} delay={200 + i * 80}>
              <div
                className="rounded-2xl p-6 sm:p-7 h-full flex flex-col"
                style={{
                  border: opt.featured ? `2px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.1)",
                  background: opt.featured ? `${ACCENT}10` : "transparent",
                }}
              >
                <p
                  className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-3"
                  style={{ color: opt.featured ? ACCENT : "rgba(255,255,255,0.5)" }}
                >
                  {opt.label}
                </p>
                <p className="text-3xl sm:text-4xl font-bold text-white leading-none tabular-nums mb-4">
                  {opt.value}
                </p>
                <ul className="space-y-2 text-sm sm:text-base text-white/75">
                  <li>Lorem ipsum dolor sit amet</li>
                  <li>Consectetur adipiscing elit</li>
                  <li>Sed do eiusmod tempor</li>
                  <li>Incididunt ut labore</li>
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
