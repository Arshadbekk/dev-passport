# Design system

The look is **dark navy and gold**: a premium, passport-like feel with restraint.

## Principles
- Restraint: hairline 1px borders, no heavy shadows, generous whitespace.
- One signature moment: the passport opening (landing hero) and stamps pressing onto the page.
- Gold means trust: only verified items and key actions use gold. Cyan is for secondary accents.
- Motion is slow and smooth (300-600ms) and always respects `prefers-reduced-motion`.

## Tokens (see `tailwind.config.ts`)
| Token | Value | Use |
|---|---|---|
| `ink` | #070B14 | Page background |
| `panel` | #0D1424 | Cards and panels |
| `line` | #1B2540 | Hairline borders |
| `muted` / `soft` | #7C8BA8 / #A9B5CB | Secondary / body text |
| `gold` / `goldsoft` / `golddeep` | #C9A45C / #E8D5A6 / #8F6D2E | Verified, primary actions, emblem |
| `accent` | #38BDF8 | Secondary accent |

## Typography
- Headlines: Fraunces (serif) via `font-serif`
- Body and UI: Inter via `font-sans`
- Small labels: `.eyebrow` (uppercase, wide tracking)

## Utility classes (`globals.css`)
`.gold-text`, `.btn-gold`, `.btn-ghost`, `.eyebrow`, `.seal-shimmer`

## Components
- `PassportHero`: animated passport cover (framer-motion, 3D tilt, auto-open)
- `StampBadge`: stamp with category icon, verified seal or self-reported label
- `PassportCard`: full passport page
- `Reveal`: fade-up on scroll
