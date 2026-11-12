# Starter issues

Copy these into GitHub Issues. Labels: `good first issue`, `intermediate`, `advanced`, `design`, `docs`.

## Good first issues

1. **Add a light theme** (`design`). Add a theme toggle; keep the dark theme as default. *Accept:* toggle works, no unreadable text.
2. **Add a favicon and social preview image** (`design`). *Accept:* favicon shows in tab; Open Graph image set in metadata.
3. **Add more stamp categories or icons** (`design`). *Accept:* each category has an icon; update `types.ts` and `StampBadge`.
4. **Form validation messages** for invalid proof/link URLs on `/create`. *Accept:* inline message when a URL is not http(s).
5. **Edit existing stamps** on `/create` (currently add/remove only). *Accept:* stamp can be edited and saved.
6. **Improve print layout** so the PDF fits cleanly on A4. *Accept:* no cut-off cards, readable text.
7. **Add a "Contributors" section** to the README using all-contributors. *Accept:* bot or manual list added.
8. **Accessibility pass** (labels, focus states, contrast). *Accept:* keyboard-only use works; Lighthouse accessibility 95+.
9. **Write a "How to earn good stamps" guide** (`docs`). *Accept:* guide in `docs/` with examples.

## Intermediate

10. **Sort and filter stamps** by category and date on the passport page.
11. **Unit tests** for `sanitizePassport`, `safeUrl`, `encode/decodePassport` (Vitest). *Accept:* tests run in CI.
12. **Shorter share links** by compressing the JSON (e.g. lz-string) while staying backward compatible.
13. **Dynamic Open Graph image** per passport so LinkedIn shows a rich preview.
14. **Export passport as JSON** and import it back on `/create`.
15. **Stamp timeline view** as an alternative to the grid.
16. **Internationalization** setup with English and one more language.

## Advanced

17. **Supabase setup**: schema, row-level security, environment variables, local dev docs.
18. **GitHub OAuth login** and a `/dashboard` page.
19. **GitHub PR importer**: fetch the user's merged PRs and create verified Contribution stamps.
20. **Server-rendered public profile** at `/u/[username]` with SEO metadata.
21. **Endorsement flow**: a maintainer can verify or endorse a stamp.
22. **Recruiter view**: search and shortlist developers by stack.
23. **End-to-end tests** (Playwright) for create, share and view flows.
24. **Mobile app** using the same backend (Flutter or React Native).
