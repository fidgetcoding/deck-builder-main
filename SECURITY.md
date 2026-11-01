# Security Policy

## Reporting a Vulnerability

**Please don't open a public GitHub issue for security vulnerabilities.**

Email **nate@lorecraft.io** with:

- What's wrong
- How to reproduce it
- What someone could do with it
- A suggested fix, if you've got one

## Response Timeline

- **48 hours**: Initial acknowledgment
- **7 days**: Preliminary assessment
- **30 days**: Target for a fix or mitigation

## Safe Harbor

Security research done in good faith is welcome. No legal action against anyone who makes a good-faith effort to avoid privacy violations and service disruption, reports promptly, and doesn't go public before a fix is out.

## What This Thing Doesn't Protect

Know this before you put anything real in a deck:

- **Without `DECK_PASSCODE`, a deck is a public URL.** Anyone with the link can read it. The word "Confidential" on the slides is a label, not a lock.
- **With `DECK_PASSCODE`, nothing leaves the server without the code.** That covers pages, the JavaScript chunks that hold slide copy, images and public files. I checked this on a real Vercel deployment as well as in the tests. The only things still open are the passcode form and `/api/deck-version`, which returns a build ID.
- **It's one shared code.** There are no accounts, no audit log and no lockout, only a half-second wait after a wrong guess, so use a long one. Anyone who has it can pass it on. Changing it signs everyone out.
- **The lock isn't retroactive.** A deployment made before you set the passcode stays unlocked at its own URL, and Vercel's Skew Protection can route to it by deployment ID until its maximum age runs out. Put the lock on before the real content goes in, or delete the old deployments.
- **Search engines are told to stay out** through `robots.txt` and `noindex` tags. That's a polite request, not access control.
- **Your repo is your repo.** Slide copy lives in the code, so if your fork is public, your deck copy is public too, passcode or not.

If a deck needs more than a shared code, put it behind your host's access controls (on Vercel, that's Deployment Protection).

## What's In The Box

No database, no accounts and no API keys. The only secret is the optional `DECK_PASSCODE`, which stays on the server. The unlock cookie is `HttpOnly`, `Secure` over HTTPS, and holds a signature rather than the code.
