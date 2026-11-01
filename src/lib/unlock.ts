/** The optional deck lock. Set DECK_PASSCODE to turn it on. See src/proxy.ts. */
export const UNLOCK_COOKIE = "deck_unlock";

/** What the cookie holds: proof of the passcode, without being the passcode. */
export async function unlockToken(passcode: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passcode),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("deck-unlock-v1"));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function sameToken(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
