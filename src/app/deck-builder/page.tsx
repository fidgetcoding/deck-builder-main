import DualTemplate from "@/components/deck-builder/DualTemplate";
import { ResumeBoundary } from "@/components/helpers/FadeIn";
import { deckSlides } from "@/components/deck-template/slidesRegistry";
import { proposalTemplate } from "@/components/proposal/brands";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: { absolute: `${brand.client} x ${brand.name}` },
  robots: { index: false, follow: false },
};

// Scrolled past the cover on any phone or laptop, close enough for a first paint.
const PAST_COVER_PX = 500;

export default async function DeckBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; resume?: string }>;
}) {
  const { view, resume } = await searchParams;
  const initialView =
    view === "deck" ? "deck" : view === "scroll" || view === "proposal" ? "proposal" : null;
  const resumeAt = resume && /^\d+$/.test(resume) ? parseInt(resume, 10) : null;

  return (
    <ResumeBoundary resumed={resumeAt !== null}>
      <DualTemplate
        slides={deckSlides}
        proposal={proposalTemplate}
        initialView={initialView}
        initialDeckIdx={initialView === "deck" && resumeAt ? resumeAt - 1 : 0}
        initialPastCover={initialView === "proposal" && (resumeAt ?? 0) > PAST_COVER_PX}
      />
    </ResumeBoundary>
  );
}
