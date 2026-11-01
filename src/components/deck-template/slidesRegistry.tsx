import type { DeckSlide } from "./slideTypes";
import SlideCover from "./slides/SlideCover";
import SlideHeader01 from "./slides/SlideHeader01";
import SlideHeader02 from "./slides/SlideHeader02";
import SlideHeader03 from "./slides/SlideHeader03";
import SlideHeader04 from "./slides/SlideHeader04";
import SlideHeader05 from "./slides/SlideHeader05";
import SlideHeader06 from "./slides/SlideHeader06";
import SlideHeader07 from "./slides/SlideHeader07";
import SlideHeader08 from "./slides/SlideHeader08";
import SlideHeader09 from "./slides/SlideHeader09";
import SlideHeader10 from "./slides/SlideHeader10";
import SlideNextSteps from "./slides/SlideNextSteps";

// Add, remove or reorder slides here. `section` puts a slide in the numbered bar.
export const deckSlides: DeckSlide[] = [
  { id: "cover", section: null, sectionLabel: null, caption: "Cover", node: <SlideCover /> },
  { id: "header-01", section: "01", sectionLabel: "HEADER 01", caption: "HEADER 01", node: <SlideHeader01 /> },
  { id: "header-02", section: "02", sectionLabel: "HEADER 02", caption: "HEADER 02", node: <SlideHeader02 /> },
  { id: "header-03", section: "03", sectionLabel: "HEADER 03", caption: "HEADER 03", node: <SlideHeader03 /> },
  { id: "header-04", section: "04", sectionLabel: "HEADER 04", caption: "HEADER 04", node: <SlideHeader04 /> },
  { id: "header-05", section: "05", sectionLabel: "HEADER 05", caption: "HEADER 05", node: <SlideHeader05 /> },
  { id: "header-06", section: "06", sectionLabel: "HEADER 06", caption: "HEADER 06", node: <SlideHeader06 /> },
  { id: "header-07", section: "07", sectionLabel: "HEADER 07", caption: "HEADER 07", node: <SlideHeader07 /> },
  { id: "header-08", section: "08", sectionLabel: "HEADER 08", caption: "HEADER 08", node: <SlideHeader08 /> },
  { id: "header-09", section: "09", sectionLabel: "HEADER 09", caption: "HEADER 09", node: <SlideHeader09 /> },
  { id: "header-10", section: "10", sectionLabel: "HEADER 10", caption: "HEADER 10", node: <SlideHeader10 /> },
  { id: "next-steps", section: null, sectionLabel: "NEXT STEPS", caption: "Next Steps", node: <SlideNextSteps /> },
];
