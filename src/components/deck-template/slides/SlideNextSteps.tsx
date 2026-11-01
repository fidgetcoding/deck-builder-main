import FadeIn from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

const ACCENT = brand.accent;

export default function SlideNextSteps() {
  return (
    <section className="absolute inset-0 overflow-y-auto pt-24 pb-32 tall-md:pb-24 px-6 sm:px-12 flex">
      <div className="m-auto max-w-6xl flex flex-col items-center text-center">
        <FadeIn>
          <p
            className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] mb-6"
            style={{ color: ACCENT }}
          >
            Next Steps
          </p>
        </FadeIn>
        <FadeIn delay={120}>
          <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-snug mb-12 text-balance">
            [Closing line: a quick call to discuss costs and we&rsquo;ll be on our way<br />
            towards lorem ipsum dolor sit amet.]
          </p>
        </FadeIn>

        <FadeIn delay={240}>
          <div className="border-t border-white/10 pt-8 w-full max-w-md">
            <p className="text-white text-2xl sm:text-3xl font-bold uppercase tracking-[0.18em] mb-3">
              {brand.name}
            </p>
            <p className="text-white/40 text-sm mb-5">
              {brand.tagline}
            </p>
            <p className="text-xl font-bold text-white">{brand.signerName}</p>
            <p className="text-white/60 text-sm mb-2">{brand.signerTitle}</p>
            <a
              href={`mailto:${brand.contactEmail}`}
              className="inline-flex items-center justify-center min-h-[44px] font-semibold hover:underline"
              style={{ color: ACCENT }}
            >
              {brand.contactEmail}
            </a>
          </div>
        </FadeIn>
      </div>

      <div className="hidden tall-md:block absolute bottom-12 left-0 right-0 z-10 text-center pointer-events-none">
        <FadeIn delay={400}>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.25em]">
            Confidential · Prepared for {brand.client}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
