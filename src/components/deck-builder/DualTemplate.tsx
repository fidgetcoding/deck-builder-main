"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TheDeckTemplate from "@/components/deck-template/TheDeckTemplate";
import BrandProposal from "@/components/proposal/BrandProposal";
import { proposalTemplate } from "@/components/proposal/brands";
import ViewToggle from "./ViewToggle";
import ClientLogoHeader from "./ClientLogoHeader";
import ProposalCover from "./ProposalCover";

type View = "deck" | "proposal";

const PROPOSAL_FIRST_SECTION_ID = "letter";

export default function DualTemplate() {
  // Default view by viewport. SSR-safe: start with null, decide on mount.
  const [view, setView] = useState<View | null>(null);

  // Cross-view section memory. 0 = cover, >0 = some post-cover content.
  const [deckIdx, setDeckIdx] = useState(0);
  const [proposalPastCover, setProposalPastCover] = useState(false);

  const isCover =
    view === "deck"
      ? deckIdx === 0
      : view === "proposal"
        ? !proposalPastCover
        : true;

  // Set initial view: ?view= query param wins over viewport default.
  // Also respect #N hash for deck-mode slide jump.
  // URL and viewport only exist in the browser, so this has to wait for mount.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const hash = window.location.hash.replace(/^#/, "");

    let initialView: View;
    if (viewParam === "deck") initialView = "deck";
    else if (viewParam === "scroll" || viewParam === "proposal") initialView = "proposal";
    else {
      const mql = window.matchMedia("(max-width: 767px)");
      initialView = mql.matches ? "proposal" : "deck";
    }

    if (initialView === "deck" && hash) {
      const n = parseInt(hash, 10);
      if (!Number.isNaN(n) && n >= 1) setDeckIdx(n - 1);
    }

    setView(initialView);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Track proposal scroll past the cover (cover is full-viewport on first section).
  useEffect(() => {
    if (view !== "proposal") return;
    const compute = () => {
      const threshold = window.innerHeight * 0.6;
      setProposalPastCover(window.scrollY > threshold);
    };
    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [view]);

  const handleDeckSlideChange = useCallback((idx: number) => {
    setDeckIdx(idx);
  }, []);

  // Track whether we just toggled, so we can land on the equivalent section
  // (cover ↔ cover; post-cover ↔ post-cover) without resetting the user.
  const pendingScrollRef = useRef<"top" | "post-cover" | null>(null);

  const toggleView = useCallback(() => {
    if (view === null) return;
    const next: View = view === "deck" ? "proposal" : "deck";
    const wasCover = view === "deck" ? deckIdx === 0 : !proposalPastCover;

    if (next === "deck") {
      // Set the slide index in the SAME render batch as setView so TheDeckTemplate
      // mounts with the correct initialSlideIdx (it only reads this on mount).
      setDeckIdx(wasCover ? 0 : Math.max(deckIdx, 1));
    } else {
      // Proposal scroll position is handled post-render in the effect below.
      pendingScrollRef.current = wasCover ? "top" : "post-cover";
    }

    // Keep the view in the URL so a reload (see DeckUpdateWatcher) stays on it.
    // The deck sets its own #slide hash when it mounts.
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?view=${next === "deck" ? "deck" : "scroll"}`,
    );

    setView(next);
  }, [view, deckIdx, proposalPastCover]);

  // After switch to proposal view, land on the equivalent scroll position.
  useEffect(() => {
    if (view !== "proposal") return;
    const target = pendingScrollRef.current;
    if (target === null) return;
    pendingScrollRef.current = null;

    requestAnimationFrame(() => {
      if (target === "top") {
        window.scrollTo({ top: 0, behavior: "auto" });
      } else {
        const el = document.getElementById(PROPOSAL_FIRST_SECTION_ID);
        if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
        else window.scrollTo({ top: window.innerHeight, behavior: "auto" });
      }
    });
  }, [view]);

  if (view === null) {
    // Render a minimal placeholder during SSR + first paint to avoid layout flash.
    return <div className="fixed inset-0 bg-[#0a0a0a]" aria-hidden="true" />;
  }

  return (
    <>
      {view === "deck" ? (
        <TheDeckTemplate
          onSlideChange={handleDeckSlideChange}
          initialSlideIdx={deckIdx}
          chromeVariant="rounded-rect"
        />
      ) : (
        <>
          <ProposalCover />
          <BrandProposal brand={proposalTemplate} chromeVariant="rounded-rect" />
        </>
      )}

      {/* Client x presenter lockup: proposal view only, post-cover only */}
      <ClientLogoHeader visible={view === "proposal" && proposalPastCover} />

      <ViewToggle view={view} isCover={isCover} onToggle={toggleView} />
    </>
  );
}
