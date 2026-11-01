import type { ReactNode } from "react";

export type SlideMeta = {
  id: string;
  section: string | null;
  sectionLabel: string | null;
  caption: string;
};

/** A slide, already rendered on the server. Its copy isn't in any JS chunk. */
export type DeckSlide = SlideMeta & { node: ReactNode };
