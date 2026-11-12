# Publishing the project on GitHub as open source

## 1. Prepare the code

1. **Replace the placeholders.** Find them all with:
   ```bash
   grep -rn "YOUR-ORG\|YOUR-DOMAIN\|YOUR-GROUP-ID\|YOUR-INVITE-CODE" . --exclude-dir=node_modules --exclude-dir=.next
   ```
   Replace `YOUR-ORG` with your GitHub organization or username, and `YOUR-DOMAIN` with your domain or email domain (README, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `.github/ISSUE_TEMPLATE/config.yml`).
2. **Add the test tooling** (once):
   ```bash
   npm install -D vitest
   ```
   Make sure `package.json` has these scripts:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "next lint",
     "typecheck": "tsc --noEmit",
     "test": "vitest run"
   }
   ```
3. **Run every check locally** and fix anything that fails:
   ```bash
   npm run lint && npm run typecheck && npm test && npm run build
   ```
4. **Check for secrets.** None of these should print anything sensitive:
   ```bash
   git status                       # .env.local must NOT be listed
   grep -rEn "eyJ[A-Za-z0-9_-]{30,}|sb_secret_|ghp_[A-Za-z0-9]{20,}|service_role" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
   ```
   Expect to see only the *words* `service_role` in code and docs, never an actual key. If a real key was ever pasted anywhere, **rotate it** before publishing.

## 2. Create the repository

1. On GitHub, create an **organization** (for example `mobile-dev-connect`), so ownership is shared and the project looks credible.
2. **New repository** → name `dev-passport` → **Public** → do **not** add a README, .gitignore or license (you already have them).
3. In your project folder:
   ```bash
   git init
   git add .
   git status                       # last look: no .env files, no node_modules
   git commit -m "feat: initial public release of Dev Passport"
   git branch -M main
   git remote add origin https://github.com/YOUR-ORG/dev-passport.git
   git push -u origin main
   ```

## 3. Configure the repository

**About box** (gear icon on the repo page): description, website URL (your live site), and topics: `nextjs`, `typescript`, `supabase`, `tailwindcss`, `open-source`, `portfolio`, `flutter`, `developer-tools`.

**Settings → General**: enable **Issues** and **Discussions**; disable Wiki and Projects if you don't use them. Upload a **Social preview** image (1280×640; you can save your site's `/opengraph-image` as a PNG).

**Settings → Code security** (all free for public repositories):
- Enable **Private vulnerability reporting**
- Enable **Dependency graph**, **Dependabot alerts** and **Dependabot security updates**
- Enable **Secret scanning** and **Push protection**

**Settings → Rules → Rulesets** (or *Branches → Branch protection*) for `main`:
- Require a pull request before merging (1 approval)
- Require status checks to pass: **Lint, typecheck, test, build**
- Block force pushes and deletion

> Turn on required status checks only *after* the first CI run has completed once, so the check name exists.

## 4. Create labels and starter issues

```bash
# one time: install the GitHub CLI from https://cli.github.com, then
gh auth login
./scripts/setup-github.sh YOUR-ORG/dev-passport
```

This creates the labels (`good first issue`, `intermediate`, `advanced`, `design`, `docs`, ...) and about 14 starter issues with acceptance criteria. Review them on GitHub afterward and edit anything you like.

## 5. First release

```bash
git tag -a v0.1.0 -m "First public release"
git push origin v0.1.0
```

Then on GitHub: **Releases → Draft a new release**, choose `v0.1.0`, click *Generate release notes*, and publish.

## 6. Invite contributors

- Post on your LinkedIn and WhatsApp groups with the repository link and the `good first issue` filter:
  `https://github.com/YOUR-ORG/dev-passport/issues?q=is%3Aopen+label%3A%22good+first+issue%22`
- Add yourself and 1-2 trusted members as maintainers (Settings → Collaborators and teams).
- Fill in `.github/CODEOWNERS` with your username.
- Pin 3 good first issues and enable a welcoming Discussions category.

## 7. Keep the project healthy

- Respond to issues and pull requests within about 48 hours. Slow reviews are the biggest reason contributors leave.
- Merge small PRs often; use *Squash and merge* to keep history clean.
- Review Dependabot pull requests weekly.
- Never merge a change that lets the browser set `verified`; ask a second maintainer to review anything in `supabase/` or `src/app/api/`.
- Celebrate contributors: mention them in release notes and on LinkedIn. Their merged PRs are verified stamps on their own passports.
