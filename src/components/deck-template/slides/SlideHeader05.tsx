import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

export default function SlideHeader05() {
  return (
    <section className="absolute inset-0 overflow-y-auto pt-28 pb-32 tall-md:pb-16 px-6 sm:px-12">
      <div className="mx-auto max-w-6xl min-h-full tall-md:h-full flex flex-col">
        <FadeIn>
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: ACCENT }}
          >
            HEADER 05: Section Eyebrow
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl mb-8 text-white">
            [Headline: four beats of lorem ipsum.]
          </h2>
        </FadeIn>

        <FadeIn delay={200}>
          <div
            className="relative aspect-[16/7] rounded-2xl overflow-hidden flex items-center justify-center mb-8"
            style={{
              background:
                `repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, color-mix(in srgb, ${ACCENT} 5%, transparent) 12px 24px)`,
              border: `1px dashed color-mix(in srgb, ${ACCENT} 40%, transparent)`,
            }}
          >
            <span className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">
              [HERO IMAGE PLACEHOLDER]
            </span>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((n) => (
            <FadeIn key={n} delay={280 + n * 60}>
              <div
                className="rounded-xl p-4 sm:p-5 h-full"
                style={{
                  border: `1px solid color-mix(in srgb, ${ACCENT} 33.3%, transparent)`,
                  background: `color-mix(in srgb, ${ACCENT} 5.1%, transparent)`,
                }}
              >
                <p
                  className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] mb-2"
                  style={{ color: ACCENT }}
                >
                  [Beat 0{n}]
                </p>
                <p className="text-sm sm:text-base font-semibold text-white leading-snug mb-2">
                  [Title]
                </p>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                  Lorem ipsum dolor sit amet.
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
