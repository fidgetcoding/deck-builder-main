import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

const placeholderStripes =
  `repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, color-mix(in srgb, ${ACCENT} 5%, transparent) 12px 24px)`;

export default function SlideHeader07() {
  return (
    <section className="absolute inset-0 overflow-y-auto pt-28 pb-32 tall-md:pb-16 px-6 sm:px-12">
      <div className="mx-auto max-w-6xl min-h-full tall-md:h-full flex flex-col">
        <FadeIn>
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: ACCENT }}
          >
            HEADER 07: Lorem Ipsum
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <h2 className="md:whitespace-nowrap font-bold leading-tight text-white mb-6 text-[clamp(0.95rem,2.1vw,2.25rem)]">
            Lorem ipsum dolor sit amet.
          </h2>
        </FadeIn>

        <FadeIn delay={200} className="flex-1 min-h-0 mb-6">
          <div
            className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
            style={{
              background: placeholderStripes,
              border: `1px dashed color-mix(in srgb, ${ACCENT} 40%, transparent)`,
              minHeight: "min(50vh, 480px)",
            }}
          >
            <span className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">
              [HERO IMAGE PLACEHOLDER]
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={280}>
          <p className="text-base sm:text-lg leading-relaxed text-white/85 max-w-4xl">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
