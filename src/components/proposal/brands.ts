/**
 * Scroll-view content.
 *
 * Everything the long-scroll view renders comes from `proposalTemplate`.
 * Sections with no content don't render, so delete what you don't need.
 * The deck view's copy lives in src/components/deck-template/slides/.
 */

import { brand } from "@/lib/brand";

export interface WorkTile {
  title: string;
  body: string;
}

export interface Deliverable {
  label: string;
  detail: string;
}

export interface Moment {
  label: string;
  body: string;
}

export interface Capability {
  title: string;
  items: string[];
}

export interface BrandConfig {
  name: string;

  bg: string;
  fg: string;
  muted: string;

  letterSectionTitle?: string;
  letterGreeting: string;
  letterParagraphs: string[];
  letterSignoff: string;

  workHeadline?: string;
  workBlurb?: string;
  workTiles?: WorkTile[];
  workCaseFilmLabel?: string;
  workPresentationImageSrc?: string;
  workPresentationImageLabel?: string;
  downloadZipSrc?: string;
  downloadZipLabel?: string;

  filesHeadline?: string;
  filesBody?: string;
  deliverables?: Deliverable[];

  momentsHeadline?: string;
  funMoments?: Moment[];

  capabilities: Capability[];

  videos?: { src: string; label: string }[];
  videosSectionTitle?: string;
  caseFilmSrc?: string;
  bonusFilmSrc?: string;

  // Set showBrandsGrid and list logos here to show a logo grid.
  showBrandsGrid?: boolean;
  logos?: { name: string; src?: string; keepColor?: boolean; sizeClass?: string }[];

  closingHeadline?: string;
  closingBody: string;

  theme?: "light" | "dark";

  // Render image/video placeholder boxes for unset media fields.
  placeholderMode?: boolean;
}

const placeholderCapability = (n: number): Capability => ({
  title: `[Capability ${n}]`,
  items: ["[What you do]", "[What you do]", "[What you do]"],
});

export const proposalTemplate: BrandConfig = {
  name: brand.client,

  theme: "dark",
  bg: "#0a0a0a",
  fg: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",

  // Render placeholder boxes for unset media fields
  placeholderMode: true,

  letterSectionTitle: "A Letter",
  letterGreeting: `[Greeting: e.g. Hello, ${brand.client} team,]`,
  letterParagraphs: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
  ],
  letterSignoff: "[Signoff: e.g. Thank you. I mean it.]",

  workHeadline: "[Work headline: lorem ipsum dolor sit amet.]",
  workBlurb:
    "[Work blurb: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod incididunt ut labore et dolore magna. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut ex ea commodo consequat.]",
  workCaseFilmLabel: "[The case film:]",
  workPresentationImageLabel: "[The presentation image:]",
  downloadZipLabel: "[Download case film + presentation image (.zip)]",

  videosSectionTitle: "Our Selects",

  momentsHeadline: "[Moments: updated, run one.]",
  funMoments: [
    {
      label: "[“Quotable line.”]",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    },
    {
      label: "[Story title]",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    },
    {
      label: "[Story title]",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    },
    {
      label: "[Story title]",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    },
  ],

  capabilities: [1, 2, 3, 4, 5, 6].map(placeholderCapability),

  showBrandsGrid: false,

  closingBody:
    "[Closing paragraph: lorem ipsum dolor sit amet, consectetur adipiscing elit. When you are ready for the next campaign, we are one email away.]",
};
