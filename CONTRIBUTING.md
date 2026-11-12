# Contributing to Dev Passport

Thank you for helping build this! Developers, designers, writers and testers of every level are welcome.

## Ways to contribute

- **Code**: features, bug fixes, tests
- **Design**: UI, accessibility, custom SVG assets
- **Docs**: guides, README, translations
- **Testing**: try it, find bugs, report them
- **Review**: review other people's pull requests

## Set up locally

1. Fork the repository and clone your fork.
2. `npm install`
3. `cp .env.example .env.local` and fill it in. Follow [docs/BACKEND_SETUP.md](docs/BACKEND_SETUP.md) to create your own free Supabase project (never use someone else's keys).
4. `npm run dev`

## Making a change

1. Find an issue labeled `good first issue`, `intermediate` or `advanced`, and comment that you'd like to take it so work isn't duplicated. New ideas: open an issue first.
2. Create a branch: `git checkout -b feat/short-description`
3. Make a small, focused change. One issue per pull request.
4. Run the checks (CI runs the same ones):

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

5. Open a pull request, link the issue (`Closes #12`), describe what changed and why, and add screenshots for UI changes.

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/): `feat: add embeddable badge`, `fix: handle empty bio`, `docs: improve setup guide`.

## Ground rules

- **Trust is the product.** Never let the browser set `verified`. Only server code using the service role may create verified stamps.
- **Validate everything that comes from outside**: URLs, query strings, request bodies, shared links. Only `http(s)` links.
- **Never commit secrets.** `.env.local` is ignored; keep it that way. The service-role key is server-only.
- **Database changes** go in a *new* numbered file in `supabase/migrations/`. Never edit an existing migration.
- **Accessibility**: label inputs, keep keyboard navigation working, respect `prefers-reduced-motion`.
- **Add tests** for logic you add or change (`*.test.ts` next to the code).
- **Keep the design restrained**: the burgundy-and-gold theme is documented in [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

## Review

A maintainer aims to respond within 48 hours. One approval and passing CI are required to merge. Reviews are how everyone learns, so please be open to feedback and kind when giving it.

## Security

Please don't open public issues for vulnerabilities. See [SECURITY.md](SECURITY.md).

## Code of Conduct

By taking part you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
