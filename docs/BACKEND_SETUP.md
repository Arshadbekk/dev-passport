# Backend setup (Supabase + GitHub sign-in)

About 30 minutes, once per environment.

## 1. Install packages
```bash
npm install
```

## 2. Create the Supabase project
1. https://supabase.com → **New project** (free tier is fine). Save the database password.
2. **Project Settings → API**: copy the **Project URL** and the **anon / publishable key**. Also note the **service_role / secret key** (server only).

## 3. Environment variables
```bash
cp .env.example .env.local
```
Fill in at least `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (`http://localhost:3000`) and `SUPABASE_SERVICE_ROLE_KEY`. Optionally `GITHUB_TOKEN`. `.env.local` is git-ignored: never commit it.

## 4. Create the database
In Supabase → **SQL Editor → New query**, run each file in `supabase/migrations/` **in this order**, one at a time:

1. `0001_init.sql`: tables, security rules, signup trigger
2. `0002_passport_issue.sql`: passport numbers, username check
3. `0003_github_import.sql`: GitHub import support
4. `0004_safety_and_discovery.sql`: Explore opt-in and reports

If one reports an error, stop and read the message before continuing.

## 5. GitHub OAuth app
1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Homepage URL `http://localhost:3000`. **Authorization callback URL**: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` (the **Supabase** URL).
3. Generate a client secret; copy the Client ID and secret.

## 6. Enable GitHub in Supabase
1. **Authentication → Providers → GitHub**: enable, paste the Client ID and secret.
2. **Authentication → URL Configuration**: Site URL `http://localhost:3000`; add Redirect URL `http://localhost:3000/auth/callback`.

## 7. Run and test
```bash
npm run dev
```
Sign in at http://localhost:3000/login. You should land on `/dashboard`, and Supabase's Table Editor should show your row in `profiles` and a welcome stamp (`verified = true`, `source = platform`).

## Security rules in plain English
- Public profiles, stamps and links are readable by everyone; private ones only by their owner.
- Users edit only their own data and can only create manual, unverified stamps.
- `verified`, `source`, `external_id`, `passport_no`, `issued_at`, `github_login` and `github_synced_at` can't be changed from the browser.
- Verified stamps are created only by the server (service role) or the signup trigger.
- Handles are 3-30 characters (`a-z`, `0-9`, `_`, `-`), unique, and reserved words are blocked.
- Limits: 8 links and 200 manual stamps per user.
- The `reports` table has no policies, so only the server can read or write it.

## Troubleshooting

| Problem | Fix |
|---|---|
| "The backend is not configured yet" | `.env.local` is missing or the dev server wasn't restarted |
| GitHub says `redirect_uri` is not associated | The GitHub callback must be the Supabase `/auth/v1/callback` URL |
| Back at `/login?error=auth` | Add `http://localhost:3000/auth/callback` to Supabase Redirect URLs |
| Signed in but no profile row | The signup trigger didn't run: re-run `0001`, then delete the user in **Authentication → Users** and sign in again |
| Importer says "not set up" | `SUPABASE_SERVICE_ROLE_KEY` is missing or the server wasn't restarted |

For GitHub import details see [GITHUB_IMPORT.md](GITHUB_IMPORT.md). To deploy, see [DEPLOYMENT.md](DEPLOYMENT.md).
