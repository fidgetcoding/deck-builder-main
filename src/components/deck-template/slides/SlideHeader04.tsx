import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

export default function SlideHeader04() {
  return (
    <section className="absolute inset-0 flex overflow-y-auto pt-32 pb-32 px-6 sm:px-12">
      <div className="m-auto max-w-5xl w-full">
        <FadeIn>
          <div
            className="rounded-2xl p-8 sm:p-12 md:p-16 text-center"
            style={{ background: ACCENT }}
          >
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-white/70 mb-5">
              HEADER 04: Section Eyebrow
            </p>
            <h4 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-snug text-white">
              [Big pivot statement: updated, run two.]
            </h4>
            <p className="mt-6 text-xl sm:text-2xl md:text-3xl font-semibold text-white/80">
              [Supporting line: consectetur adipiscing elit.]
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
