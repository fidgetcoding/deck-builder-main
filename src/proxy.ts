import { NextResponse, type NextRequest } from "next/server";
import { UNLOCK_COOKIE, sameToken, unlockToken } from "@/lib/unlock";

/**
 * The optional lock. With DECK_PASSCODE unset, everything passes straight through.
 *
 * With it set, nothing leaves the server without the cookie, and that includes
 * /_next/static: slide copy is compiled into those JS chunks, so gating only the
 * pages would leave the whole deck readable by anyone who guessed a chunk URL.
 */
export async function proxy(request: NextRequest) {
  const passcode = process.env.DECK_PASSCODE;
  if (!passcode) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname === "/unlock") return NextResponse.next();

  const cookie = request.cookies.get(UNLOCK_COOKIE)?.value;
  if (cookie && sameToken(cookie, await unlockToken(passcode))) return NextResponse.next();

  const headers = { "Cache-Control": "no-store" };
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return new NextResponse(null, { status: 401, headers });
  }
  const unlock = new URL("/unlock", request.url);
  unlock.searchParams.set("next", pathname + search);
  return NextResponse.redirect(unlock, { status: 307, headers });
}

// The version check stays out: it's a build ID, and polling shouldn't cost a proxy call.
export const config = {
  matcher: ["/((?!api/deck-version$).*)"],
};
