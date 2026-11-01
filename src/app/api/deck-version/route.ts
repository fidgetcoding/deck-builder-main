// Prerendered at build, so the CDN answers this and a poll never wakes a function.
export const dynamic = "force-static";

/**
 * What build is live right now. Open decks poll this and reload themselves
 * when the answer changes. DECK_BUILD_ID is stamped by next.config.ts.
 */
export function GET() {
  return Response.json({ version: process.env.DECK_BUILD_ID ?? "dev" });
}
