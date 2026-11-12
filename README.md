<div align="center">

# Dev Passport

**A developer portfolio that comes with proof.**

Turn real contributions into a shareable, verifiable "passport". Every stamp links to evidence, and is clearly labeled **verified** or **self-reported**.

[![CI](https://github.com/YOUR-ORG/dev-passport/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR-ORG/dev-passport/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-C9A45C.svg)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-6B1428.svg)](CONTRIBUTING.md)

[Live site](https://YOUR-DOMAIN) · [Roadmap](docs/ROADMAP.md) · [Contribute](CONTRIBUTING.md) · [Report a bug](https://github.com/YOUR-ORG/dev-passport/issues/new/choose)

<!-- Add screenshots to docs/screenshots/ and uncomment:
![Landing page](docs/screenshots/landing.png)
![Passport](docs/screenshots/passport.png)
-->

</div>

## Why

CVs and portfolios are self-reported, and recruiters can't tell what a developer personally did. Dev Passport makes work visible, links every claim to proof, and keeps the line between *confirmed* and *claimed* obvious.

Built in the open by the [Mobile Dev Connect](https://www.linkedin.com/groups/) community (Flutter, Android, iOS and React Native developers). Contributing here is public, reviewable, portfolio-ready work.

## Features

- **GitHub sign-in** with no passwords and no access to your code
- **Guided passport builder**: identity, stack, links and stamps, with live preview, autosave and a strength score
- **Verified stamps** created only by the server:
  - merged pull requests in other people's public repositories
  - your own public projects (ownership checked with GitHub)
  - a *count* of private/company contributions (no repository names or code)
- **Public passport** at `/u/handle` with privacy controls, QR code, PDF export and automatic social preview images
- **Explore directory**, opt-in only
- **Account control**: export your data and delete your account any time
- **Safety**: report form, strict input validation, database row-level security
- A premium, passport-themed design with scroll-driven animation that respects *reduced motion*

## How trust works

| Label | Meaning |
|---|---|
| **Verified** | Dev Passport confirmed a specific fact with a trusted source (for example GitHub). It does not judge code quality. |
| **Self-reported** | Entered by the owner and not checked by us. Always follow the proof link. |

Users can never set `verified` themselves: the database rejects it, and only the server (service role) or the signup trigger can create verified stamps. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase (Postgres, Auth, Row Level Security) · `next/og` for share images · Vitest · deployed on Vercel.

## Quick start

Requirements: Node.js 18.17+ and a free [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/YOUR-ORG/dev-passport.git
cd dev-passport
npm install
cp .env.example .env.local      # then fill in the values
npm run dev
```

Open http://localhost:3000. Before sign-in works, follow **[docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md)**: create the Supabase project, run the SQL files in `supabase/migrations/` in order, and create a GitHub OAuth app.

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | The public anon/publishable key |
| `NEXT_PUBLIC_SITE_URL` | yes | `http://localhost:3000` locally; your domain in production |
| `SUPABASE_SERVICE_ROLE_KEY` | for imports, delete, reports | **Server only.** Never commit it or prefix it with `NEXT_PUBLIC_` |
| `GITHUB_TOKEN` | optional | Token with **no scopes**; raises rate limits and enables private-contribution counts |
| `NEXT_PUBLIC_GITHUB_URL`, `NEXT_PUBLIC_LINKEDIN_URL`, `NEXT_PUBLIC_WHATSAPP_URL` | optional | Community links in the nav and footer |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_OPERATOR_NAME`, `NEXT_PUBLIC_JURISDICTION` | optional | Shown on the Privacy and Terms pages |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / run |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests (Vitest) |

## Project structure

```
src/
  app/              Pages and API routes (App Router)
    api/            github import, account export/delete, reports
    u/[username]/   Public passport page + social image
  components/
    create/         The passport builder (wizard, steps, autosave hook)
    assets/         Custom SVG assets: crest, rosette, seal, ink stamps
    nav/            Navigation and command palette
  lib/              Supabase clients, GitHub importer, sharing and safety helpers
supabase/migrations/  Database schema, security rules, triggers (run in order)
docs/                 Setup, architecture, deployment, roadmap
```

## Deploying

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for a step-by-step Vercel guide, and **[docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md)** for repository setup.

## Contributing

All skill levels are welcome, including design, docs and testing.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Pick an issue labeled `good first issue`
3. Open a pull request

When your pull request is merged, you can import it as a verified stamp on your own passport.

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md). To report a vulnerability, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE). The hosted service is governed by its own Terms of Service and Privacy Policy.
