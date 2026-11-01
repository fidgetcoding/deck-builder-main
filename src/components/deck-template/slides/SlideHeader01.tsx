"use client";

import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

export default function SlideHeader01() {
  return (
    <section className="absolute inset-0 overflow-hidden pt-28 pb-16 px-6 sm:px-12">
      <div className="mx-auto max-w-6xl h-full flex flex-col">
        <FadeIn>
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: ACCENT }}
          >
            HEADER 01: Section Eyebrow
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl mb-10 text-white">
            [Headline goes here: lorem ipsum dolor sit amet.]
          </h2>
        </FadeIn>

        <div className="flex-1 grid gap-6 md:grid-cols-2 md:gap-10 items-stretch">
          <FadeIn delay={200}>
            <div className="space-y-5">
              <p className="text-base sm:text-lg leading-relaxed text-white/85">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                tempor incididunt ut labore et dolore magna. Ut enim ad minim veniam,
                quis nostrud exercitation ullamco laboris.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-white/85">
                Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.
              </p>
              <p className="text-base sm:text-lg leading-relaxed text-white/85">
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={280}>
            <div
              className="relative h-full min-h-[260px] rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, rgba(0,150,46,0.05) 12px 24px)",
                border: `1px dashed ${ACCENT}66`,
              }}
            >
              <span className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">
                [IMAGE PLACEHOLDER]
              </span>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
