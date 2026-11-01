import type { BrandConfig } from "./brands";

export const DEFAULT_SECTION_TITLES = {
  letter: "A Letter",
  work: "The Work",
  files: "Final Files",
  moments: "Memorable Moments",
  brands: "Our Work",
  capabilities: "Our Capabilities",
  selects: "Our Selects",
  bonus: "Bonus Film",
};

export type SectionId = keyof typeof DEFAULT_SECTION_TITLES;

export function sectionTitle(brand: BrandConfig, id: SectionId): string {
  return brand.sectionTitles?.[id] ?? DEFAULT_SECTION_TITLES[id];
}

/** The sections with something to show, in page order. Empty ones don't render. */
export function visibleSections(brand: BrandConfig): SectionId[] {
  const shown: Record<SectionId, boolean> = {
    letter: !!(brand.letterGreeting || brand.letterParagraphs?.length || brand.letterSignoff),
    work: !!(
      brand.workHeadline ||
      brand.workBlurb ||
      brand.caseFilmSrc ||
      brand.workPresentationImageSrc ||
      brand.workTiles?.length ||
      brand.placeholderMode
    ),
    files: !!(brand.filesHeadline || brand.filesBody || brand.deliverables?.length),
    moments: !!(brand.momentsHeadline || brand.funMoments?.length),
    brands: brand.showBrandsGrid === true && !!brand.logos?.length,
    capabilities: !!brand.capabilities?.length,
    selects: !!brand.videos?.length,
    bonus: !!brand.bonusFilmSrc,
  };
  return (Object.keys(DEFAULT_SECTION_TITLES) as SectionId[]).filter((id) => shown[id]);
}
