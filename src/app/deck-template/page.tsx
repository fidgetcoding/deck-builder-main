import TheDeckTemplate from "@/components/deck-template/TheDeckTemplate";
import { ResumeBoundary } from "@/components/helpers/FadeIn";
import { deckSlides } from "@/components/deck-template/slidesRegistry";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: { absolute: `${brand.client} x ${brand.name}` },
  robots: { index: false, follow: false },
};

export default async function DeckTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string }>;
}) {
  const { resume } = await searchParams;
  const resumeAt = resume && /^\d+$/.test(resume) ? parseInt(resume, 10) : null;

  return (
    <ResumeBoundary resumed={resumeAt !== null}>
      <TheDeckTemplate slides={deckSlides} initialSlideIdx={resumeAt ? resumeAt - 1 : 0} />
    </ResumeBoundary>
  );
}
