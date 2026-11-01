"use client";

type Props = {
  view: "deck" | "proposal";
  isCover: boolean;
  onToggle: () => void;
};

const SEGMENT_W = 84; // px
const PADDING = 4; // px

export default function ViewToggle({ view, isCover, onToggle }: Props) {
  const positionClass = isCover
    ? "top-3 left-3 sm:top-4 sm:left-4"
    : view === "deck"
      ? "bottom-14 left-3 sm:bottom-4 sm:left-4" // clears the phone nav bar
      : "bottom-3 left-3 sm:bottom-4 sm:left-4";

  function setView(target: "deck" | "proposal") {
    if (view !== target) onToggle();
  }

  const knobX = view === "deck" ? PADDING : PADDING + SEGMENT_W;

  const segmentBase =
    "relative z-10 flex items-center justify-center gap-1.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 focus:outline-none";

  return (
    <nav
      aria-label="View toggle"
      className={`print:hidden fixed z-[60] ${positionClass} inline-flex items-center rounded-xl border border-white/10 bg-[#0a0a0a]/40 backdrop-blur-xl backdrop-saturate-150 shadow-[0_2px_20px_rgba(0,0,0,0.35)]`}
      style={{ padding: PADDING }}
    >
      {/* Top edge sheen */}
      <span
        aria-hidden="true"
        className="absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />

      {/* Sliding knob */}
      <span
        aria-hidden="true"
        className="absolute top-1 bottom-1 rounded-lg border border-white/15 bg-white/[0.12] backdrop-blur-md shadow-[0_1px_8px_rgba(255,255,255,0.08)_inset,0_2px_10px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out"
        style={{
          width: SEGMENT_W,
          left: 0,
          transform: `translateX(${knobX}px)`,
        }}
      />

      <button
        type="button"
        onClick={() => setView("deck")}
        onMouseEnter={() => setView("deck")}
        aria-pressed={view === "deck"}
        aria-label="Deck view"
        style={{ width: SEGMENT_W }}
        className={`${segmentBase} ${
          view === "deck" ? "text-white" : "text-white/50 hover:text-white/80"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <line x1="3" y1="9.5" x2="21" y2="9.5" />
        </svg>
        Deck
      </button>

      <button
        type="button"
        onClick={() => setView("proposal")}
        onMouseEnter={() => setView("proposal")}
        aria-pressed={view === "proposal"}
        aria-label="Scroll view"
        style={{ width: SEGMENT_W }}
        className={`${segmentBase} ${
          view === "proposal" ? "text-white" : "text-white/50 hover:text-white/80"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="13" y2="16" />
        </svg>
        Scroll
      </button>
    </nav>
  );
}
