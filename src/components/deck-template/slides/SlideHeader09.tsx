import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

const placeholderStripes =
  "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, rgba(0,150,46,0.05) 12px 24px)";

export default function SlideHeader09() {
  return (
    <section className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 z-0 flex items-center justify-center"
        style={{ background: placeholderStripes }}
      >
        <span className="text-white/15 text-[10px] font-bold uppercase tracking-[0.4em]">
          [FULL-BLEED IMAGE PLACEHOLDER]
        </span>
      </div>
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-black/15 to-black/55" />

      <div className="relative z-20 h-full flex items-start justify-start pt-24 sm:pt-28 px-6 sm:px-12">
        <FadeIn>
          <div
            className="rounded-md px-5 py-3 sm:px-7 sm:py-4 max-w-5xl"
            style={{ background: ACCENT }}
          >
            <p className="md:whitespace-nowrap uppercase font-bold tracking-tight leading-snug text-white text-[clamp(0.7rem,1.35vw,1.5rem)]">
              Lorem ipsum dolor sit amet consectetur.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
