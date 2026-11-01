import TheDeckTemplate from "@/components/deck-template/TheDeckTemplate";
import { ResumeBoundary } from "@/components/helpers/FadeIn";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `${brand.client} x ${brand.name}`,
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
      <TheDeckTemplate initialSlideIdx={resumeAt ? resumeAt - 1 : 0} />
    </ResumeBoundary>
  );
}
