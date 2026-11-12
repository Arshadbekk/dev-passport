# Architecture

## Overview

Version 0.1 is a frontend-only Next.js app. There is no server state.

```
Browser
  /create  -> edits a Passport, auto-saves to localStorage
  ShareBox -> encodes the Passport into /view?d=<base64url JSON>
  /view    -> decodes, sanitizes and renders the Passport
  /demo    -> renders sample data
```

## Key modules

| File | Responsibility |
|---|---|
| `src/lib/types.ts` | `Passport`, `Stamp`, categories |
| `src/lib/share.ts` | `safeUrl`, `sanitizePassport`, `encodePassport`, `decodePassport` |
| `src/lib/sample.ts` | Demo data |
| `src/components/PassportCard.tsx` | Renders a passport (used by create, view, demo) |
| `src/components/StampBadge.tsx` | One stamp, with verified / self-reported label |
| `src/components/ShareBox.tsx` | Share link, QR code, print to PDF |

## Trust model

All data coming from a URL or storage is untrusted. `sanitizePassport` enforces limits, restricts URLs to http(s) and forces `verified = false`. Real verification will be added with a backend (see roadmap), where the server decides which stamps are verified.

## Planned backend (Phase 2)

- Supabase: Postgres + Auth (GitHub OAuth)
- Tables: `profiles`, `stamps`, `endorsements`
- Row-level security so users only edit their own data
- Public read route `/u/[username]` rendered on the server for SEO
- GitHub API importer creating verified `Contribution` stamps from merged PRs

## Known limitations of v0.1

- Share links can get long with many stamps
- Passports live only in the browser or the link
- No verification yet
