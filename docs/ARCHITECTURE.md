# Architecture

## Overview

```
Browser (Next.js App Router, React)
  │  pages, components, autosave (Supabase JS client, row-level security)
  ▼
Next.js server (Vercel)
  │  server components · route handlers (/api/...) · middleware (session refresh, route protection)
  │  service-role client used ONLY in server routes that create verified data
  ▼
Supabase (Postgres + Auth)            GitHub (OAuth sign-in, public API)
  tables, RLS policies, triggers
```

## Data model (`supabase/migrations/`)

| Table | Purpose |
|---|---|
| `profiles` | One per user: handle, name, headline, location, bio, stack, visibility (`is_public`, `listed`), `passport_no`, `issued_at`, `github_login`, `github_synced_at` |
| `stamps` | Achievements: title, category, date, proof link, `verified`, `source` (`manual` / `github` / `platform`), `external_id`, `is_public` |
| `links` | Up to 8 ordered links per user |
| `reports` | Abuse reports (no policies: readable and writable only by the server) |

Migrations run in order: `0001` base schema, `0002` passport numbers and username check, `0003` GitHub import support, `0004` Explore opt-in and reports. Never edit an applied migration; add a new one.

## Trust model

- `verified` can only be true when `source` is `github` or `platform` (check constraint).
- Users can insert only `manual`, unverified stamps (RLS). Triggers freeze `verified`, `source`, `external_id`, `passport_no`, `issued_at`, `github_login` and `github_synced_at` for client updates, and freeze the content of verified stamps.
- Only server code using the service-role key (`/api/github/*`) or the signup trigger can create verified stamps.
- Passport numbers come from a database function (`issue_passport`), never from the client.

## Key flows

- **Sign-in**: Supabase Auth with GitHub → `/auth/callback` exchanges the code → a trigger creates the profile (unique handle) and a welcome stamp.
- **Builder** (`/create`): the server page loads rows; `usePassportEditor` applies changes optimistically, saves to Supabase, and rolls back on error.
- **Issue**: `issue_passport()` sets the number; the passport becomes shareable.
- **GitHub import** (`/api/github/*`): identity comes from the signed-in user's GitHub login (never from the request); the server calls GitHub and upserts verified stamps by `(user_id, external_id)`.
- **Public page** (`/u/[username]`): visible only if issued and public; hidden stamps never shown; metadata and a generated Open Graph image.
- **Explore**: lists only passports that are public, issued **and** listed (opt-in).
- **Account**: export as JSON; delete removes the auth user and cascades to all rows.
- **Reports**: public form → server route (honeypot + throttle) → `reports` table.

## Security measures

Input validation (`sanitizePassport`, `normalizeUrl`, strict GitHub-name checks), `http(s)`-only links, open-redirect protection, same-origin checks on state-changing routes, per-user throttles, PostgREST filter sanitization in search, and no secrets in the browser bundle.

## Known limitations

- The throttle (`src/lib/throttle.ts`) is in-memory and per-instance; use a shared store for strong guarantees.
- "Snapshot" share links (`/view?d=`) embed the passport in the URL and can't be revoked.
- Avatars are hot-linked from GitHub.
- Verified means *confirmed fact*, not *quality*.
