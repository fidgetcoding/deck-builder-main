import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A deploy is the wait while someone's watching, and this is the one slow step I
  // can cut. CI still runs the typecheck on every push.
  typescript: { ignoreBuildErrors: !!process.env.VERCEL },
  // Next reloads a tab when a refresh comes back from a different build ID. Open
  // decks work out for themselves whether a new build needs that (DeckUpdateWatcher).
  generateBuildId: () => "deck",
  // Inlined at build, so every build gets a new one. /api/deck-version serves it
  // and open decks reload when it changes.
  env: {
    DECK_BUILD_ID: String(Date.now()),
  },
  // AVIF first (better compression), WebP fallback. next/image negotiates
  // via Accept headers.
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      // Always ask. A CDN that held this would quietly stop live updates.
      {
        source: "/api/deck-version",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
