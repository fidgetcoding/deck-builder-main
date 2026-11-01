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

- **A deck is a public URL.** There's no login and no password. Anyone with the link can read it. The word "Confidential" on the slides is a label, not a lock.
- **Search engines are told to stay out** through `robots.txt` and `noindex` tags. That's a polite request, not access control.
- **Your content ships to the browser.** Slide copy is compiled into the page, so don't put anything in the repo you wouldn't hand the viewer. If your fork is public, your deck copy is public too.

If a deck needs real protection, put it behind your host's access controls (on Vercel, that's Deployment Protection).

## What's In The Box

No database, no accounts, no API keys, no environment secrets. The one API route, `/api/deck-version`, returns the current build ID and takes no input.
