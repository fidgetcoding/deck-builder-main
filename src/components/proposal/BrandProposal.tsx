"use client";

import Image from "next/image";
import { useBrand } from "@/components/BrandContext";
import FadeIn from "@/components/helpers/FadeIn";
import WorkPlayer from "./WorkPlayer";
import BrandMenu from "./BrandMenu";
import type { BrandConfig } from "./brands";

interface Props {
  brand: BrandConfig;
  chromeVariant?: "circle" | "rounded-rect";
}

function SectionLabel({
  num,
  title,
  mb = "mb-4",
}: {
  num: string;
  title: string;
  mb?: string;
}) {
  return (
    <FadeIn>
      <p
        className={`text-lg font-semibold text-white uppercase tracking-widest ${mb} bg-brand-green-light inline-block px-4 py-1`}
      >
        {num} · {title}
      </p>
    </FadeIn>
  );
}

// Paired with brand.capabilities by position.
const capabilityIcons = [
  (
    <svg key={0} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  (
    <svg key={1} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  (
    <svg key={2} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  (
    <svg key={3} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  (
    <svg key={4} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  (
    <svg key={5} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
];

export default function BrandProposal({ brand, chromeVariant }: Props) {
  const site = useBrand();
  const ctaShape = chromeVariant === "rounded-rect" ? "rounded-[12px]" : "rounded-full";
  const showTOC = chromeVariant === "rounded-rect";
  const placeholder = !!brand.placeholderMode;
  const showWork = !!(
    brand.workHeadline ||
    brand.workBlurb ||
    brand.caseFilmSrc ||
    brand.workPresentationImageSrc ||
    (brand.workTiles && brand.workTiles.length > 0) ||
    placeholder
  );
  const showFiles = !!(
    brand.filesHeadline ||
    brand.filesBody ||
    (brand.deliverables && brand.deliverables.length > 0)
  );
  const showMoments = !!(
    brand.momentsHeadline ||
    (brand.funMoments && brand.funMoments.length > 0)
  );
  const showBrandsGrid = brand.showBrandsGrid !== false;
  const showSelects = !!(brand.videos && brand.videos.length > 0);
  const showBonus = !!brand.bonusFilmSrc;

  const sectionIds: string[] = ["letter"];
  if (showWork) sectionIds.push("work");
  if (showFiles) sectionIds.push("files");
  if (showMoments) sectionIds.push("moments");
  if (showBrandsGrid) sectionIds.push("brands");
  sectionIds.push("capabilities");
  if (showSelects) sectionIds.push("selects");
  if (showBonus) sectionIds.push("bonus");
  const num = (id: string) => String(sectionIds.indexOf(id) + 1).padStart(2, "0");

  const tocLabelMap: Record<string, string> = {
    letter: brand.letterSectionTitle ?? "A Letter From Our Founder",
    work: "The Work",
    files: "Final Files",
    moments: "Memorable Moments",
    brands: "Our Work",
    capabilities: "Our Capabilities",
    selects: brand.videosSectionTitle ?? "Our Selects",
    bonus: "Bonus Film",
  };
  const tocItems = sectionIds.map((id) => ({
    id,
    num: num(id),
    label: tocLabelMap[id] ?? id,
  }));

  return (
    <div
      className="min-h-screen"
      data-cover-theme={brand.theme ?? "dark"}
      style={{
        fontFamily: "var(--font-outfit), sans-serif",
        backgroundColor: brand.bg,
        color: brand.fg,
      }}
    >
      {/* Burger menu: fixed top-right on every section */}
      <BrandMenu brand={brand} chromeVariant={chromeVariant} />

      {/* Cover hero is rendered by ProposalCover (in DualTemplate): start directly at TOC/letter */}

      {/* ========== TABLE OF CONTENTS ========== */}
      {showTOC && (
        <section
          id="contents"
          className="px-5 pt-12 pb-4 sm:px-8 md:pt-16 md:pb-6 scroll-mt-8"
        >
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">
                Contents
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <div className="border-t border-white/10 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                {tocItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="group flex items-baseline gap-3 py-3 sm:py-2 min-h-[44px] sm:min-h-0 border-b border-white/5 hover:border-brand-green-light/60 transition-colors"
                  >
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest w-6 shrink-0 group-hover:text-brand-green-light transition-colors">
                      {item.num}
                    </span>
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors flex-1">
                      {item.label}
                    </span>
                    <span className="text-white/20 group-hover:text-brand-green-light transition-colors text-sm">
                      →
                    </span>
                  </a>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ========== 01 LETTER ========== */}
      <section
        id="letter"
        className="px-5 pt-12 pb-8 sm:px-8 md:pt-16 md:pb-12 scroll-mt-8"
      >
        <div className="mx-auto max-w-prose md:max-w-3xl">
          <SectionLabel num={num("letter")} title={brand.letterSectionTitle ?? "A Letter From Our Founder"} mb="mb-8" />
          <FadeIn delay={100}>
            <p className="text-[15px] sm:text-lg leading-relaxed text-white mb-5 sm:mb-6">
              {brand.letterGreeting}
            </p>
          </FadeIn>
          {brand.letterParagraphs.map((p, i) => (
            <FadeIn key={i} delay={150 + i * 80}>
              <p className="text-[15px] sm:text-lg leading-relaxed text-white mb-5 sm:mb-6">{p}</p>
            </FadeIn>
          ))}
          <FadeIn delay={800}>
            <p className="text-[15px] sm:text-lg leading-relaxed text-white mt-8 sm:mt-10 mb-5 sm:mb-6">
              {brand.letterSignoff}
            </p>
            <div className="border-t border-white/10 pt-6">
              <p className="text-white font-bold">{site.signerName}</p>
              <p className="text-white text-sm bg-brand-green-light inline-block px-3 py-1 -ml-3 mt-1">
                {site.signerTitle}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ========== 02 THE WORK ========== */}
      {showWork && (
        <section id="work" className="px-5 py-8 sm:px-8 md:py-12 scroll-mt-8">
          <div className="mx-auto max-w-5xl">
            <SectionLabel num={num("work")} title="The Work" mb="mb-4" />
            {brand.workHeadline && (
              <FadeIn delay={100}>
                <h2 className="text-2xl font-bold leading-tight sm:text-4xl md:text-5xl mb-6 text-white">
                  {brand.workHeadline}
                </h2>
              </FadeIn>
            )}
            {brand.workBlurb && (
              <FadeIn delay={150}>
                <p className="text-base sm:text-lg leading-relaxed text-white/70 mb-10 max-w-3xl">
                  {brand.workBlurb}
                </p>
              </FadeIn>
            )}

            {brand.caseFilmSrc && (
              <FadeIn delay={175}>
                <div className="mb-10">
                  {brand.workCaseFilmLabel && (
                    <p className="text-base font-bold text-white mb-3">
                      {brand.workCaseFilmLabel}
                    </p>
                  )}
                  <div className="overflow-hidden rounded-xl sm:rounded-2xl">
                    <video
                      playsInline
                      controls
                      preload="auto"
                      onLoadedMetadata={(e) => {
                        e.currentTarget.volume = 1;
                      }}
                      className="w-full max-w-full h-auto block"
                    >
                      <source src={brand.caseFilmSrc} type="video/mp4" />
                    </video>
                  </div>
                </div>
              </FadeIn>
            )}

            {placeholder && !brand.caseFilmSrc && (
              <FadeIn delay={175}>
                <div className="mb-10">
                  {brand.workCaseFilmLabel && (
                    <p className="text-base font-bold text-white mb-3">
                      {brand.workCaseFilmLabel}
                    </p>
                  )}
                  <div
                    className="aspect-video w-full rounded-xl sm:rounded-2xl border border-dashed border-white/20 flex items-center justify-center"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)",
                    }}
                  >
                    <div className="flex flex-col items-center gap-3 text-white/30">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="6 4 20 12 6 20 6 4" />
                      </svg>
                      <p className="text-xs font-bold uppercase tracking-[0.3em]">
                        [CASE FILM / VIDEO]
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {placeholder && !brand.workPresentationImageSrc && (
              <FadeIn delay={200}>
                <div className="mb-10">
                  {brand.workPresentationImageLabel && (
                    <p className="text-base font-bold text-white mb-3">
                      {brand.workPresentationImageLabel}
                    </p>
                  )}
                  <div
                    className="aspect-[3/2] w-full rounded-2xl border border-dashed border-white/20 border-t-2 border-t-brand-green-light flex items-center justify-center"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)",
                    }}
                  >
                    <div className="flex flex-col items-center gap-3 text-white/30">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <p className="text-xs font-bold uppercase tracking-[0.3em]">
                        [PRESENTATION IMAGE]
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {brand.workPresentationImageSrc && (
              <FadeIn delay={200}>
                <div className="mb-10">
                  {brand.workPresentationImageLabel && (
                    <p className="text-base font-bold text-white mb-3">
                      {brand.workPresentationImageLabel}
                    </p>
                  )}
                  <div className="overflow-hidden rounded-2xl border-t-2 border-brand-green-light">
                    <Image
                      src={brand.workPresentationImageSrc}
                      alt={brand.workPresentationImageLabel ?? "Presentation image"}
                      width={2800}
                      height={1867}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
                      className="w-full h-auto block"
                    />
                  </div>
                  {brand.downloadZipSrc && (
                    <div className="mt-6 flex justify-center">
                      <a
                        href={brand.downloadZipSrc}
                        download
                        className={`inline-flex items-center gap-2 ${ctaShape} border border-white/20 px-5 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:border-white/40 transition-colors`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {brand.downloadZipLabel ?? "Download case film + presentation image (.zip)"}
                      </a>
                    </div>
                  )}
                </div>
              </FadeIn>
            )}

            {brand.workTiles && brand.workTiles.length > 0 && (
              <div className="grid gap-x-8 gap-y-10 md:grid-cols-3">
                {brand.workTiles.map((tile, i) => (
                  <FadeIn key={`${tile.title}-${i}`} delay={200 + i * 80}>
                    <div className="border-t border-white/10 pt-5 h-full">
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-3 text-brand-green-light">
                        0{i + 1}
                      </p>
                      <h3 className="text-xl font-bold mb-3 text-white">
                        {tile.title}
                      </h3>
                      <p className="text-base leading-relaxed text-white/60">
                        {tile.body}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== 03 FINAL FILES ========== */}
      {showFiles && (
        <section id="files" className="px-5 py-8 sm:px-8 md:py-12 scroll-mt-8">
          <div className="mx-auto max-w-4xl">
            <SectionLabel num={num("files")} title="Final Files" mb="mb-4" />
            {brand.filesHeadline && (
              <FadeIn delay={100}>
                <h2 className="text-2xl font-bold leading-tight sm:text-4xl md:text-5xl mb-6 text-white">
                  {brand.filesHeadline}
                </h2>
              </FadeIn>
            )}
            {brand.filesBody && (
              <FadeIn delay={150}>
                <p className="text-base sm:text-lg leading-relaxed text-white mb-10 max-w-3xl">
                  {brand.filesBody}
                </p>
              </FadeIn>
            )}

            {brand.deliverables && brand.deliverables.length > 0 && (
              <div className="space-y-3">
                {brand.deliverables.map((d, i) => (
                  <FadeIn key={`${d.label}-${i}`} delay={200 + i * 40}>
                    <div className="flex items-start gap-4 border-t border-white/10 pt-4">
                      <span className="text-[10px] font-semibold uppercase tracking-widest pt-1 w-8 shrink-0 text-brand-green-light">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <p className="text-base font-semibold mb-1 text-white">
                          {d.label}
                        </p>
                        <p className="text-sm text-white/60">{d.detail}</p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== 04 MOMENTS ========== */}
      {showMoments && (
        <section id="moments" className="px-5 py-8 sm:px-8 md:py-12 scroll-mt-8">
          <div className="mx-auto max-w-5xl">
            <SectionLabel num={num("moments")} title="Memorable Moments" mb="mb-4" />
            {brand.momentsHeadline && (
              <FadeIn delay={100}>
                <h2 className="text-2xl font-bold leading-tight sm:text-4xl md:text-5xl mb-10 text-white">
                  {brand.momentsHeadline}
                </h2>
              </FadeIn>
            )}

            {brand.funMoments && brand.funMoments.length > 0 && (
              <div className="grid gap-x-8 gap-y-6 sm:gap-y-10 md:grid-cols-2">
                {brand.funMoments.map((m, i) => (
                  <FadeIn key={`${m.label}-${i}`} delay={150 + i * 80}>
                    <div className="rounded-xl sm:rounded-2xl p-5 sm:p-8 h-full bg-white/[0.03]">
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-3 text-white">
                        Moment 0{i + 1}
                      </p>
                      <h3 className="text-lg sm:text-2xl font-bold mb-3 leading-snug text-white">
                        {m.label}
                      </h3>
                      <p className="text-sm sm:text-lg leading-relaxed text-white/70">
                        {m.body}
                      </p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========== 05 OUR WORK (BRANDS) ========== */}
      {showBrandsGrid && (
      <section id="brands" className="px-5 py-8 sm:px-8 md:py-12 scroll-mt-8">
        <div className="mx-auto max-w-5xl">
          <SectionLabel num={num("brands")} title="Our Work" mb="mb-4" />
          <FadeIn delay={100}>
            <h2 className="text-2xl font-bold leading-tight sm:text-4xl md:text-5xl mb-12 text-white">
              Brands we&apos;ve built for.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {(brand.logos ?? []).map((b, i) => (
              <FadeIn key={b.name} delay={200 + i * 40}>
                <div className="rounded-xl border border-white/10 p-4 sm:p-6 flex flex-col items-center justify-center gap-3 h-28 sm:h-32 bg-white/[0.02]">
                  {b.src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.src}
                      alt={b.name}
                      className={`${b.sizeClass || "max-h-12 sm:max-h-14 max-w-[110px] sm:max-w-[140px]"} object-contain ${
                        b.keepColor ? "" : "brightness-0 invert"
                      }`}
                    />
                  ) : null}
                  <p className="text-[11px] sm:text-xs text-center leading-tight text-white/60">
                    {b.name}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      )}

      {/* ========== 07 CAPABILITIES ========== */}
      <section id="capabilities" className="px-5 py-8 sm:px-8 md:py-12 scroll-mt-8">
        <div className="mx-auto max-w-5xl">
          <SectionLabel num={num("capabilities")} title="Our Capabilities" mb="mb-12" />

          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {brand.capabilities.map((c, i) => (
              <FadeIn key={`${c.title}-${i}`} delay={100 + i * 60}>
                <div className="flex flex-col gap-4">
                  <div className="text-white">{capabilityIcons[i % capabilityIcons.length]}</div>
                  <h3 className="text-xl font-bold text-white">{c.title}</h3>
                  <ul className="space-y-1.5">
                    {c.items.map((item, k) => (
                      <li
                        key={`${item}-${k}`}
                        className="flex items-start gap-2 text-sm leading-snug text-white/60"
                      >
                        <span className="mt-1.5 w-1 h-1 rounded-full shrink-0 bg-white/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 08 SELECTS REEL ========== */}
      {brand.videos && brand.videos.length > 0 && (
        <section id="selects" className="py-10 sm:py-12 md:py-16 scroll-mt-8 overflow-hidden">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 mb-8">
            <SectionLabel num={num("selects")} title={brand.videosSectionTitle ?? "Our Selects"} mb="mb-4" />
          </div>
          <div className="px-3 sm:px-6">
            <FadeIn delay={200}>
              <div className="mx-auto max-w-4xl">
                <WorkPlayer videos={brand.videos!} />
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ========== 09 BONUS FILM ========== */}
      {brand.bonusFilmSrc && (
        <section id="bonus" className="px-5 py-8 sm:px-8 md:py-12 scroll-mt-8">
          <div className="mx-auto max-w-5xl">
            <SectionLabel num={num("bonus")} title="Bonus Film" mb="mb-4" />
            <FadeIn delay={100}>
              <h2 className="text-2xl font-bold leading-tight sm:text-4xl mb-6 text-white">
                Something we made just for you.
              </h2>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="overflow-hidden rounded-xl sm:rounded-2xl border-t-2 border-brand-green-light">
                <video
                  loop
                  playsInline
                  controls
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    e.currentTarget.volume = 1;
                  }}
                  className="w-full max-w-full h-auto block"
                >
                  <source src={brand.bonusFilmSrc} type="video/mp4" />
                </video>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* ========== CLOSE ========== */}
      <section className="px-5 py-12 sm:px-8 sm:py-14 md:py-20 scroll-mt-8">
        <div className="mx-auto max-w-3xl text-center">
          {brand.closingHeadline && (
            <FadeIn>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 text-white">
                {brand.closingHeadline}
              </h2>
            </FadeIn>
          )}
          <FadeIn delay={150}>
            <p className="text-base sm:text-lg leading-relaxed mb-12 text-white">
              {brand.closingBody}
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="border-t border-white/10 pt-10 flex flex-col items-center gap-3">
              <Image
                src={brand.theme === "light" ? "/wmark-dark.svg" : "/wmark.svg"}
                alt={site.name}
                width={120}
                height={34}
              />
              <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                {site.tagline}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={400}>
            <div className="mt-8 flex justify-center">
              <a
                href={`mailto:${site.contactEmail}`}
                style={{ backgroundColor: "var(--brand-green-light)", color: "#FFFFFF" }}
                className={`inline-flex items-center gap-2 ${ctaShape} px-6 py-3 text-sm sm:text-base font-semibold tracking-wide hover:opacity-90 transition-opacity min-h-[44px]`}
              >
                Contact Us: {site.contactEmail}
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={500}>
            <p className="mt-6 text-[10px] uppercase tracking-widest text-center text-white/30">
              Confidential · Prepared for {brand.name}
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
