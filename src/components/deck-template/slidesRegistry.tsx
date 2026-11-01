import type { ComponentType } from "react";
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

export type SectionId =
  | "header-01"
  | "header-02"
  | "header-03"
  | "header-04"
  | "header-05"
  | "header-06"
  | "header-07"
  | "header-08"
  | "header-09"
  | "header-10";

export type SlideMeta = {
  id: string;
  section: SectionId | null;
  sectionLabel: string | null;
  caption: string;
  Component: ComponentType;
};

export const slides: SlideMeta[] = [
  { id: "cover", section: null, sectionLabel: null, caption: "Cover", Component: SlideCover },
  { id: "header-01", section: "header-01", sectionLabel: "HEADER 01", caption: "HEADER 01", Component: SlideHeader01 },
  { id: "header-02", section: "header-02", sectionLabel: "HEADER 02", caption: "HEADER 02", Component: SlideHeader02 },
  { id: "header-03", section: "header-03", sectionLabel: "HEADER 03", caption: "HEADER 03", Component: SlideHeader03 },
  { id: "header-04", section: "header-04", sectionLabel: "HEADER 04", caption: "HEADER 04", Component: SlideHeader04 },
  { id: "header-05", section: "header-05", sectionLabel: "HEADER 05", caption: "HEADER 05", Component: SlideHeader05 },
  { id: "header-06", section: "header-06", sectionLabel: "HEADER 06", caption: "HEADER 06", Component: SlideHeader06 },
  { id: "header-07", section: "header-07", sectionLabel: "HEADER 07", caption: "HEADER 07", Component: SlideHeader07 },
  { id: "header-08", section: "header-08", sectionLabel: "HEADER 08", caption: "HEADER 08", Component: SlideHeader08 },
  { id: "header-09", section: "header-09", sectionLabel: "HEADER 09", caption: "HEADER 09", Component: SlideHeader09 },
  { id: "header-10", section: "header-10", sectionLabel: "HEADER 10", caption: "HEADER 10", Component: SlideHeader10 },
  { id: "next-steps", section: null, sectionLabel: "NEXT STEPS", caption: "Next Steps", Component: SlideNextSteps },
];

export type SectionMeta = {
  id: SectionId;
  label: string;
  firstSlideIndex: number;
};

export const sections: SectionMeta[] = [
  { id: "header-01", label: "01", firstSlideIndex: slides.findIndex((s) => s.section === "header-01") },
  { id: "header-02", label: "02", firstSlideIndex: slides.findIndex((s) => s.section === "header-02") },
  { id: "header-03", label: "03", firstSlideIndex: slides.findIndex((s) => s.section === "header-03") },
  { id: "header-04", label: "04", firstSlideIndex: slides.findIndex((s) => s.section === "header-04") },
  { id: "header-05", label: "05", firstSlideIndex: slides.findIndex((s) => s.section === "header-05") },
  { id: "header-06", label: "06", firstSlideIndex: slides.findIndex((s) => s.section === "header-06") },
  { id: "header-07", label: "07", firstSlideIndex: slides.findIndex((s) => s.section === "header-07") },
  { id: "header-08", label: "08", firstSlideIndex: slides.findIndex((s) => s.section === "header-08") },
  { id: "header-09", label: "09", firstSlideIndex: slides.findIndex((s) => s.section === "header-09") },
  { id: "header-10", label: "10", firstSlideIndex: slides.findIndex((s) => s.section === "header-10") },
];
