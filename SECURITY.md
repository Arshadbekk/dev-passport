# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Use GitHub's private reporting: **Security → Report a vulnerability** on this repository, or email `security@YOUR-DOMAIN` (replace with your real address).

Include steps to reproduce, the impact, and any suggested fix. We aim to acknowledge reports within 72 hours and to fix confirmed issues promptly. Please give us reasonable time to fix a problem before disclosing it.

## Supported versions

Only the latest version on `main` (and the deployed site) is supported.

## What we protect

- **Verification can't be faked.** The `verified` flag, stamp source and passport number are read-only for users and enforced in the database, not just the UI.
- **Row Level Security** limits every user to their own rows; private passports are invisible to others.
- **Untrusted input** (URLs, query strings, shared links) is validated; only `http(s)` links are rendered.
- **Secrets** live in environment variables. The Supabase service-role key is used only in server routes.

## Out of scope

Reports about missing best-practice headers on non-sensitive pages, social engineering, and denial-of-service by traffic volume are not in scope.
