#!/usr/bin/env bash
# Creates the labels and starter issues for the repository using the GitHub CLI.
# Usage:  ./scripts/setup-github.sh YOUR-ORG/dev-passport
# Requires: GitHub CLI (https://cli.github.com) and `gh auth login`.
set -euo pipefail

REPO="${1:-}"
if [[ -z "$REPO" ]]; then
  echo "Usage: $0 OWNER/REPO   (example: $0 mobile-dev-connect/dev-passport)"
  exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI not found. Install it from https://cli.github.com"
  exit 1
fi
gh auth status >/dev/null 2>&1 || { echo "Run 'gh auth login' first."; exit 1; }

echo "Creating labels in $REPO ..."
label() { gh label create "$1" --color "$2" --description "$3" --force --repo "$REPO" >/dev/null; }
label "good first issue" "7057ff" "Good for newcomers"
label "help wanted"      "008672" "Extra attention is needed"
label "intermediate"     "fbca04" "Some experience needed"
label "advanced"         "d93f0b" "Needs deeper knowledge of the codebase"
label "design"           "c5def5" "UI, UX and visual design"
label "docs"             "0075ca" "Documentation"
label "accessibility"    "1d76db" "Accessibility improvements"
label "testing"          "bfd4f2" "Tests and quality"
label "security"         "b60205" "Security-related"
label "bug"              "d73a4a" "Something isn't working"
label "enhancement"      "a2eeef" "New feature or request"

issue() {
  local title="$1" labels="$2" body="$3"
  gh issue create --repo "$REPO" --title "$title" --label "$labels" --body "$body" >/dev/null
  echo "  + $title"
}

echo "Creating starter issues ..."

issue "Add a light theme with a toggle" "good first issue,design" \
"The site is dark (burgundy and gold) only.

**Acceptance criteria**
- [ ] A theme toggle in the navigation bar
- [ ] A light palette defined with the existing Tailwind tokens
- [ ] Preference saved and respected on reload, with no flash of the wrong theme
- [ ] Passport and stamps remain readable in both themes"

issue "Accessibility audit of the landing page and builder" "good first issue,accessibility" \
"Run Lighthouse and axe on the landing page, /create steps and /u pages.

**Acceptance criteria**
- [ ] Lighthouse accessibility score 95+ on each page
- [ ] Every form control has a label; keyboard-only use works end to end
- [ ] Findings and fixes documented in the PR"

issue "Improve the print / Save as PDF layout of the passport" "good first issue,design" \
"The browser print dialog is our PDF export. Check A4 and Letter output.

**Acceptance criteria**
- [ ] No cut-off cards or stamps across page breaks
- [ ] Readable text and visible stamp ink in print"

issue "Write the \"How to earn good stamps\" guide" "good first issue,docs" \
"Add docs/EARNING_STAMPS.md with examples of strong stamps for each category (Contribution, Project, Learning, Community, Career), good proof links, and how verified vs self-reported works."

issue "Add unit tests for the social image helpers" "good first issue,testing" \
"Cover \`clip\` in src/lib/ogCards.tsx and the username/handle edge cases for the Open Graph image route.

**Acceptance criteria**
- [ ] Tests run in CI with \`npm test\`"

issue "Component tests with Testing Library" "intermediate,testing" \
"Add React Testing Library tests for the builder steps (StepLinks, StepStamps, StepStack): validation messages, add/remove, and that verified stamps are locked."

issue "Playwright smoke tests for public pages" "intermediate,testing" \
"End-to-end tests for /, /demo, /explore, /roadmap, /community, /privacy, /terms and a not-found handle on /u/…

**Acceptance criteria**
- [ ] Runs in CI against a production build
- [ ] No sign-in or secrets required"

issue "Sort and filter stamps on a passport" "intermediate" \
"Let visitors filter a passport's stamps by category and toggle verified-only, on /u/handle."

issue "Translate the interface (Arabic first)" "intermediate,help wanted" \
"Add i18n scaffolding (for example next-intl) with English and Arabic, including right-to-left layout.

**Acceptance criteria**
- [ ] Language switcher
- [ ] RTL layout verified on the landing page, builder and passport"

issue "Replace the in-memory throttle with a shared rate limiter" "intermediate,security" \
"src/lib/throttle.ts is per-instance and resets on cold starts. Use a shared store (for example Upstash Redis) for the GitHub, report and delete routes."

issue "Embeddable passport badge (SVG)" "advanced" \
"Add /badge/<handle>.svg that renders a small badge showing the handle, stamp count and verified count, for GitHub READMEs and LinkedIn.

**Acceptance criteria**
- [ ] Only for public, issued passports
- [ ] Cached sensibly; no personal data beyond what the public passport shows"

issue "Endorsements: let maintainers and peers vouch for a stamp" "advanced,security" \
"Design and build an endorsement flow. Endorsements must be server-controlled and must not let a user verify their own stamp. Start with a short design proposal in the issue."

issue "Recruiter view: search and shortlist" "advanced" \
"Search listed passports by skill and level, and let a signed-in recruiter keep a private shortlist. Respect the opt-in 'List me in Explore' setting."

issue "Self-hosting guide with Docker" "advanced,docs" \
"Document and test running Dev Passport on your own infrastructure (Docker, own Supabase)."

echo "Done. Review the issues at https://github.com/$REPO/issues"
