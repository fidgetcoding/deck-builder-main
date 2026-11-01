import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

export default function SlideHeader03() {
  return (
    <section className="absolute inset-0 overflow-y-auto pt-28 pb-32 tall-md:pb-16 px-6 sm:px-12">
      <div className="mx-auto max-w-6xl min-h-full tall-md:h-full">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10 items-stretch tall-md:h-full">
          <FadeIn>
            <div
              className="relative aspect-[3/4] tall-md:aspect-auto tall-md:h-full rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background:
                  `repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, color-mix(in srgb, ${ACCENT} 5%, transparent) 12px 24px)`,
                border: `1px dashed color-mix(in srgb, ${ACCENT} 40%, transparent)`,
              }}
            >
              <span className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]">
                [IMAGE PLACEHOLDER]
              </span>
            </div>
          </FadeIn>

          <div className="tall-md:h-full flex flex-col">
            <FadeIn delay={120}>
              <p
                className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-3"
                style={{ color: ACCENT }}
              >
                HEADER 03: Section Eyebrow
              </p>
            </FadeIn>
            <FadeIn delay={200}>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
                [Subheadline: sed do eiusmod.]
              </h3>
            </FadeIn>
            <FadeIn delay={280}>
              <p className="text-base sm:text-lg leading-relaxed text-white/85 mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
                nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </FadeIn>
            <FadeIn delay={360}>
              <p className="text-base sm:text-lg leading-relaxed text-white/85 mb-4">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </FadeIn>
            <FadeIn delay={440}>
              <p className="text-base sm:text-lg leading-relaxed text-white/85 mb-4">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
            </FadeIn>
            <FadeIn delay={520}>
              <p className="text-base sm:text-lg leading-relaxed text-white/85">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
                sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
