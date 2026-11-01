import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

export default function SlideHeader08() {
  return (
    <section className="absolute inset-0 flex overflow-y-auto pt-24 pb-32 tall-md:pb-24 px-6 sm:px-12">
      <div className="m-auto max-w-6xl w-full">
        <FadeIn className="w-full">
          <div
            className="rounded-2xl overflow-hidden flex items-center justify-center w-full"
            style={{
              background: ACCENT,
              aspectRatio: "16 / 8",
              padding: "12px",
            }}
          >
            <div
              className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
              style={{
                background:
                  "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 14px, rgba(255,255,255,0.02) 14px 28px)",
              }}
            >
              <span className="text-white/50 text-xs font-bold uppercase tracking-[0.3em]">
                [IMAGE PLACEHOLDER]
              </span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
