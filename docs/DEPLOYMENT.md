# Deploying to Vercel

About 30 minutes. You will connect GitHub, Supabase and Vercel, then verify everything works.

## Before you start

- The code is pushed to GitHub (see [GITHUB_SETUP.md](GITHUB_SETUP.md)).
- A Supabase project exists and **all four migrations** in `supabase/migrations/` were run in order (0001 to 0004).
- GitHub sign-in is configured in Supabase (see [BACKEND_SETUP.md](BACKEND_SETUP.md)).
- `npm run build` passes locally.

## 1. Import the project into Vercel

1. Sign in at https://vercel.com with your GitHub account.
2. **Add New → Project**, then pick the `dev-passport` repository. If it isn't listed, click *Adjust GitHub App Permissions* and grant access.
3. Vercel detects **Next.js** automatically. Leave the build settings as they are.
4. Open **Environment Variables** *before* clicking Deploy and add the variables below.

### Environment variables

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key | Public by design |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | Your **final** domain, no trailing slash. Until you have one, use the `*.vercel.app` URL and update it later |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret key | **Sensitive.** Tick *Sensitive* in Vercel if offered. Server only |
| `GITHUB_TOKEN` | token with **no scopes** | Optional but recommended |
| `NEXT_PUBLIC_GITHUB_URL` | `https://github.com/YOUR-ORG/dev-passport` | Nav and footer |
| `NEXT_PUBLIC_LINKEDIN_URL` | your LinkedIn group link | |
| `NEXT_PUBLIC_WHATSAPP_URL` | your WhatsApp invite link | |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `hello@your-domain.com` | Shown on Privacy and Terms |
| `NEXT_PUBLIC_OPERATOR_NAME` | your name or organization | Shown on Privacy and Terms |
| `NEXT_PUBLIC_JURISDICTION` | e.g. `Oman` | Optional |

Set them for **Production**. For **Preview** deployments you can use the same values (the service-role key gives previews full database access, so only do that if you trust everyone who can open pull requests; otherwise leave it out of Preview).

5. Click **Deploy**. Note your URL, for example `https://dev-passport.vercel.app`.

> `NEXT_PUBLIC_*` values are baked in at build time. After changing any of them, **redeploy**.

## 2. Tell Supabase about your production URL

Supabase → **Authentication → URL Configuration**:

- **Site URL**: `https://your-domain.com` (or your `*.vercel.app` URL for now)
- **Redirect URLs**: keep `http://localhost:3000/auth/callback` and add `https://your-domain.com/auth/callback`

For preview deployments you can also add a wildcard such as `https://*-your-team.vercel.app/auth/callback`.

Your **GitHub OAuth app does not change** as long as you keep using the same Supabase project: its callback URL is Supabase's (`https://xxxx.supabase.co/auth/v1/callback`), not your website's.

## 3. Add your custom domain (optional but recommended)

1. Vercel → your project → **Settings → Domains → Add**.
2. Add the DNS records Vercel shows at your domain registrar (an `A` record for the root domain and a `CNAME` for `www`). HTTPS is issued automatically.
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel and the Supabase **Site URL** and **Redirect URLs** to the new domain, then **redeploy**.

## 4. Verify the deployment

Open the live site and check each item:

- [ ] Home page loads, the scroll animation works, no console errors
- [ ] **Sign in with GitHub** works and lands on `/dashboard`
- [ ] `/create`: change something, refresh, and confirm it was saved
- [ ] Issue a passport, then open `/u/your-handle` in a private window
- [ ] **Import from GitHub** runs (a "none found" message is also a pass)
- [ ] `/u/your-handle/opengraph-image` shows your share card
- [ ] `/explore`, `/roadmap`, `/community`, `/privacy`, `/terms` load; your contact email appears on the legal pages
- [ ] `/settings`: toggling visibility saves; **Download my data** works
- [ ] A wrong handle such as `/u/nobody-here` shows the themed not-found page
- [ ] `/robots.txt` and `/sitemap.xml` load
- [ ] Test link previews with LinkedIn's Post Inspector (https://www.linkedin.com/post-inspector/) and https://developers.facebook.com/tools/debug/. These sites cache images, so use their *Inspect/Scrape again* button after changes

> **Test account deletion with a throwaway GitHub account**, never your real one.

## 5. Recommended hardening

Add security headers in `next.config.mjs`:

```js
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
export default nextConfig;
```

Also:
- In GitHub, protect `main` so only reviewed code with passing CI is deployed.
- Keep the service-role key out of screenshots and chats. If it ever leaks, rotate it in Supabase and update Vercel.
- Add a **Content-Security-Policy** later if you want; test carefully because Next.js, fonts and images need specific allowances.

## 6. Operating it

- **Reports**: Supabase → Table Editor → `reports`. Check it regularly and set `status` to `reviewing` or `closed`. To remove a bad passport, delete the user in **Authentication → Users** (this cascades to all their data).
- **Logs**: Vercel → project → Logs; Supabase → Logs.
- **Backups**: enable them in Supabase (paid plans include daily backups; on the free plan export data yourself regularly).
- **Rollback**: Vercel → Deployments → pick an earlier deployment → *Promote to Production*.
- **Migrations**: add a new numbered SQL file, run it in Supabase **before** deploying code that needs it.
- **Analytics**: none are enabled. If you add any (for example Vercel Web Analytics or Plausible), update the Privacy Policy first.

## Plan limits to know about

- Vercel's **Hobby** plan is intended for personal, non-commercial projects. Check Vercel's current terms if the project grows or takes donations.
- Supabase's **free** plan can pause a project after a period of inactivity and has database size limits. Check their current limits, and upgrade before you rely on it for many users.
- GitHub API limits: the importer works without `GITHUB_TOKEN` but is limited to a few searches per minute across *all* users. Set the token in production.

## Troubleshooting

| Problem | Fix |
|---|---|
| Sign-in redirects to `localhost` | `NEXT_PUBLIC_SITE_URL` or Supabase **Site URL** is still local. Fix both, then redeploy |
| `redirect_uri` error from GitHub | The GitHub OAuth callback must be your **Supabase** `/auth/v1/callback` URL |
| Back at `/login?error=auth` | Add `https://your-domain/auth/callback` to Supabase Redirect URLs |
| Importer says "not set up" | `SUPABASE_SERVICE_ROLE_KEY` is missing in Vercel; add it and redeploy |
| Share image is generic | The passport isn't issued, isn't public, or the page was cached; re-scrape with the LinkedIn inspector |
| Build fails on Vercel only | Run `npm run build` locally with the same env vars; check the Vercel build log for the first error |
