import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

export default function SlideHeader02() {
  return (
    <section className="absolute inset-0 overflow-y-auto pt-28 pb-32 tall-md:pb-16 px-6 sm:px-12">
      <div className="mx-auto max-w-6xl min-h-full tall-md:h-full flex flex-col">
        <FadeIn>
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-4"
            style={{ color: ACCENT }}
          >
            HEADER 02: Section Eyebrow
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl mb-12 text-white">
            [Headline goes here: three pillars of lorem ipsum.]
          </h2>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-3 md:gap-6">
          {[1, 2, 3].map((n) => (
            <FadeIn key={n} delay={200 + n * 80}>
              <div
                className="rounded-2xl p-6 sm:p-7 h-full flex flex-col"
                style={{
                  border: `1px solid ${ACCENT}55`,
                  background: `${ACCENT}0d`,
                }}
              >
                <p
                  className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: ACCENT }}
                >
                  [Pillar 0{n}]
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
                  [Pillar Title]
                </p>
                <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
                  tempor incididunt ut labore et dolore magna.
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
