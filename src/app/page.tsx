import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata = {
  title: "Deck Builder",
  robots: { index: false, follow: false },
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6 text-white">
      <div className="flex flex-col items-center gap-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
          {brand.name}
        </p>
        <h1 className="text-4xl font-light uppercase tracking-tight sm:text-6xl md:text-7xl">
          Deck Builder
        </h1>
        <p className="max-w-md text-sm text-white/60 sm:text-base">
          A deck that&apos;s a link, not a file. Flip between deck and scroll.
        </p>
        <Link
          href="/deck-builder"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition-colors hover:border-white/30 hover:bg-white/[0.08] hover:text-white"
        >
          Open Deck Builder
          <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
