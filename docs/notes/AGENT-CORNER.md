# AGENT-CORNER: read this first

One front door for every AI agent (Claude, Kiro, or a new one) working on MyLokalEvent 2.0. Read this file, then stop. Only open the detail logs linked at the bottom when you need that exact detail. That keeps a fresh chat cheap.

**Standing rule: update this file in the same PR as the work.** Edit the shared sections and your own agent section only. Keep it short; move long detail into the agent's log file.

Last updated: 2026-11-08 (corner created).

> Public repo. Never write secrets, keys, personal data, or details from the owner's employer or other private projects here.

## 1. Project in one minute

- **What:** MyLokalEvent 2.0, a marketable rebuild of the owner's university portfolio project (v1: `7YMERA/mylokalevent`). Event listings for Malaysia, fishing events first, built to expand to other event types.
- **Owner:** GitHub `7YMERA`. Works with Claude (cloud, sees only this repo) and Kiro (owner's Windows laptop). The repo is the only thing they share.
- **Stack:** Next.js 16 (Cache Components, read `node_modules/next/dist/docs/` before writing Next code), TypeScript, Tailwind design tokens, Supabase (Auth + Postgres + RLS + Storage), Stripe Checkout, Resend email, Vitest + pgTAP.
- **Live:** https://mylokalevent.vercel.app. Vercel deploys from `main` only. A GitHub Action pushes Supabase migrations on merge to `main`. Everything runs in the cloud; nothing needs the laptop.
- **Languages:** BM and EN, locale in the URL (`/ms`, `/en`). Casual everyday BM, short copy.
- **Homepage:** an open events feed. Anyone can browse; like, comment and post need an account. The old launch page lives at `/about`.

## 2. Decisions that stand

- Fishing niche first; data model open to any event category.
- Repo stays public (portfolio). No licence (all rights reserved). Secrets only via env vars; `.env.example` lists them.
- Pricing: listing fee RM10, featured RM20 for 7 days. Rejected after paying: one free resubmit, no refund (resubmit not built yet).
- Google sign-in is built but parked behind `GOOGLE_SIGN_IN=on` until the owner has time.
- Design: professional, modern, token-based colours, light AND dark must both have correct contrast. No emojis in UI (use stroke SVG icons). Never literal hex or `bg-white`.
- Before/after comparisons (docs, wiki, notes) always compare against **v1**, never early v2.
- Logo: wau bulan (moon kite). Brand files in `docs/brand/`.
- Wiki pages are authored in `docs/wiki/` and published by a GitHub Action. Never edit the wiki web editor.
- Work in small PRs. Push to `main` is blocked; branch, PR, review.
- Pace: show the task sequence first, then go one step at a time and wait for the owner's "go".
- Model split for Claude threads: Haiku for search/audits/quick lookups, Sonnet for building and PR prep, Opus for hard planning and final review.

## 3. Where things live

| Need                                   | Path                                                          |
| -------------------------------------- | ------------------------------------------------------------- |
| Scope, requirements, tasks             | `.kiro/specs/mvp/` (post-MVP ideas: `.kiro/specs/backlog.md`) |
| Steering for agents                    | `.kiro/steering/` (`product`, `tech`, `structure`)            |
| Routes (localised)                     | `src/app/[locale]/`                                           |
| Data access, Stripe, email, engagement | `src/lib/` (data access is `server-only`)                     |
| Translations (keys must match)         | `src/messages/{ms,en}.json`                                   |
| Design tokens                          | `src/app/globals.css` (`@theme inline`)                       |
| Migrations, RLS, pgTAP tests           | `supabase/migrations/`                                        |
| Portfolio before/after                 | `docs/v1-vs-v2.md`, `docs/screenshots/`                       |
| Wiki source                            | `docs/wiki/`                                                  |
| Brand assets                           | `docs/brand/`                                                 |
| Workflows                              | `.github/workflows/` (`ci`, `deploy-db`, `wiki`)              |
| Demo accounts                          | `npm run demo:users` (needs a service key in `.env.local`)    |

Checks before a PR: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. A pre-commit hook formats staged files.

## 4. Conventions to copy

- Every table has RLS. Privileged writes go through a `security definer` function that checks the caller, changes the row and writes `audit_log` in one transaction (copy `set_user_status`).
- Clients never write privileged columns (`revoke all`, then grant specific columns).
- `getClaims()` verifies the JWT; never trust the cookie. Server Actions read the locale from a hidden `locale` field.
- Test passwords: build them from parts so gitleaks does not flag them.

## 5. What is built (PR log)

| PR       | What                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| #1-#5    | README, Kiro steering and MVP spec, Next.js 16 scaffold with CI, `profiles` + RLS + audit log, design tokens and `docs/v1-vs-v2.md` |
| #6       | Email sign-up/sign-in/account (Supabase Auth, httpOnly cookies)                                                                     |
| #7       | Post-MVP backlog (AI poster import, document cross-check, round-robin moderation)                                                   |
| #8       | BM/EN i18n with browser detection and parity test                                                                                   |
| #9, #13  | Google sign-in (PKCE) plus consent step; button hidden by flag                                                                      |
| #10      | `demo:users` script                                                                                                                 |
| #11      | Kiro's organisers, events, payments, admin queue, saves/follows (tasks 2-6); Claude fixed review findings 1-5                       |
| #12, #16 | Claude notes; notes moved to `docs/notes/`; wiki publishing                                                                         |
| #14      | Migrations deploy on merge; Vercel from `main` only                                                                                 |
| #15      | Wau bulan logo, favicon, brand files                                                                                                |
| #17, #18 | Launch page; theme kept when switching language                                                                                     |
| #19      | Kiro's wiki roadmap (phased post-launch plan)                                                                                       |
| #20      | Pre-commit format hook, `sharp` patch, Actions bump, README live link, payment fixes 6-8                                            |
| #21      | Homepage becomes the open events feed; launch page moved to `/about`                                                                |
| this PR  | Agent corner                                                                                                                        |

## 6. Proven vs only written

- Proven: auth, i18n, RLS/pgTAP tests, CI, migrations deploy, live site.
- **Written but never run:** the Stripe payment path and webhook, Resend receipt/reason emails, real geotagged photo upload. Smoke-test with Stripe test keys (`stripe listen`) is the top open item and needs the owner.
- Deferred: interactive multi-pin map (an OpenStreetMap embed is the placeholder).

## 7. Open items (most important first)

**Before launch**

1. Stripe test-mode smoke test, plus Resend and real photo upload (owner needed). After PR #20, add webhook events `checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` in Stripe.
2. PDPA data export and account deletion (task 7.1) and privacy notice.
3. Decide organiser privacy (phone and SSM number are public today).
4. Branch protection requiring CI.

**Small fixes:** search breaks on commas/brackets (`src/lib/events.ts`); escape titles in emails; free-resubmit not implemented; admins can approve any status (limit to `in_review`); make `events/` upload prefix server-only; OG share images; regenerate `database.types.ts`.

**Unfinished MVP:** reminders and cron (6.2); reports, suspend, categories, revenue dashboard (5.2, 5.3); interactive map; Google sign-in setup; security review then closed beta (Terengganu, Kelantan, Sabah).

More detail: the "Suggestions" and "Next steps" sections of the logs in section 9.

## 8. Agent sections

### Claude

- Cloud container, sees this repo only; cannot push to the wiki repo directly (the Action does it).
- Cannot run Stripe, Resend, or anything needing the owner's keys.
- Keeps `CLAUDE-NOTES.md` current: changes, challenges, limitations, suggestions, CI error log.
- Opens PRs with the owner's requested-by attribution block; subscribes to PR events.
- Lessons: Prettier must pass (`format:check`); small PRs get real reviews; do not rely on tsc alone for Cache Components pages, run `npm run build`.

### Kiro

- Runs on the owner's Windows laptop; Docker needed for DB tests there.
- Keeps `KIRO-NOTES.md` current (same format, plus build/verify steps for Windows and the "proven vs written" list).
- Known habit: commits without formatting; the pre-commit hook now covers it.
- Kiro: add your own short bullets here when you next finish a slice (keep to this section).

## 9. Detail logs (open only when needed)

- [`CLAUDE-NOTES.md`](CLAUDE-NOTES.md): Claude's full history, review findings with fixes, CI error log, Google sign-in setup steps, suggestions.
- [`KIRO-NOTES.md`](KIRO-NOTES.md): Kiro's slice-by-slice file guide, local build steps, CI error log, deferred features and why.
- [`../v1-vs-v2.md`](../v1-vs-v2.md): portfolio changelog.
