import { NextResponse, type NextRequest } from "next/server";
import { UNLOCK_COOKIE, sameToken, unlockToken } from "@/lib/unlock";

export const dynamic = "force-dynamic";

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const FAILED_ATTEMPT_DELAY_MS = 500;

/** Only ever send people back to a page on this site. */
function safeNext(value: unknown): string {
  const fallback = "/deck-builder";
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  try {
    const base = "http://deck.invalid";
    const url = new URL(value, base);
    return url.origin === base ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Plain HTML with no bundle behind it: the chunks are exactly what's locked. */
function page(next: string, failed: boolean, status: number) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Locked</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: #0a0a0a; color: #fff; font: 16px/1.5 system-ui, sans-serif; }
  form { width: 100%; max-width: 320px; display: flex; flex-direction: column; gap: 12px; }
  h1 { margin: 0 0 4px; font-size: 20px; font-weight: 600; }
  input, button { width: 100%; min-height: 44px; padding: 10px 12px; border-radius: 10px; font: inherit; }
  input { background: #161616; color: #fff; border: 1px solid #333; }
  button { background: #fff; color: #0a0a0a; border: 0; font-weight: 600; cursor: pointer; }
  p { margin: 0; color: #ff8a8a; font-size: 14px; }
</style>
</head>
<body>
<form method="post" action="/unlock">
  <h1>This deck is locked</h1>
  ${failed ? "<p>That's not the code.</p>" : ""}
  <input type="password" name="passcode" aria-label="Passcode" placeholder="Passcode" autocomplete="off" autofocus required maxlength="256">
  <input type="hidden" name="next" value="${escapeHtml(next)}">
  <button type="submit">Open</button>
</form>
<script>
  // The server never sees the #slide part of a link, so carry it through by hand.
  document.querySelector('[name="next"]').value += location.hash;
</script>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  if (!process.env.DECK_PASSCODE) return NextResponse.redirect(new URL(next, request.url), 303);
  return page(next, false, 200);
}

export async function POST(request: NextRequest) {
  const passcode = process.env.DECK_PASSCODE;
  if (!passcode) return NextResponse.redirect(new URL("/", request.url), 303);

  if (Number(request.headers.get("content-length") ?? 0) > 2048) {
    return new NextResponse(null, { status: 413 });
  }
  const form = await request.formData().catch(() => null);
  const attempt = form?.get("passcode");
  const next = safeNext(form?.get("next"));

  const expected = await unlockToken(passcode);
  if (typeof attempt !== "string" || !sameToken(await unlockToken(attempt), expected)) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_ATTEMPT_DELAY_MS));
    return page(next, true, 401);
  }

  const response = NextResponse.redirect(new URL(next, request.url), 303);
  response.cookies.set(UNLOCK_COOKIE, expected, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  return response;
}
