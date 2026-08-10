# Family Quest

A gamified daily-challenge PWA for kids, built from the Family Quest PRD (v2) and the
Jahnoon design handoff. Three kid profiles (ages 5/11/13) get personalized daily
challenges — math, English, chores, reading, kindness — and earn Stars (spendable on
real-world rewards) and XP (in-app progress) for completing them. A Parent mode lets a
parent create/assign custom challenges, approve chore/kindness completions, manage the
reward shop, and tune the scoring rules.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

Data is stored in the browser's `localStorage` (key `family-quest-state-v1`) — there is
no backend yet. Parent mode is gated by a PIN (default `1234`, changeable in
Settings), not real authentication.

## The two things this build focuses on

1. **Parents can add challenges.** Parent mode → *+ Add Challenge*: title,
   description, category, type (quiz / drawing / self-report), difficulty, which
   child/children it's assigned to, one-time/daily/weekly recurrence, and whether it
   needs parent approval before Stars/XP are awarded. Created challenges show up
   immediately in the relevant kids' quest lists and can be paused or deleted from
   *All Challenges*.

2. **Helping others always scores highest.** Kindness, Sibling, and Family
   challenges get an automatic **+50% Stars & XP bonus** over a same-difficulty
   challenge in any other category (`src/lib/scoring.ts`). This is a standing rule of
   the scoring engine, not a per-challenge toggle a parent has to remember — every
   kindness/helping challenge a parent creates is bonused automatically, and the
   bonus is shown to both the parent (while creating it) and the child (on the
   quest row and in the challenge modal). Both the bonus % and the base
   difficulty→Stars/XP table are editable in Parent → Settings.

## What's implemented

- Kid app: profile picker, Home (mascot + next-reward progress + today's quests),
  Quests (full list), task detail modal (quiz/draw/self-report), Reward Shop, and
  Streaks & Badges — following the Jahnoon design's per-kid theming (Mia/pink dragon,
  Sam/teal owl, Alex/indigo icon badges), fonts, and dark cosmic backgrounds.
- Parent app: dashboard with per-child daily summary and a pending-approvals /
  pending-redemptions queue, challenge creation & management, reward shop management,
  and a settings screen for the scoring table, kindness bonus %, streak rules, and PIN.
- Scoring engine matching PRD §12: Stars/XP scale with a 1–5 difficulty rating,
  fully parent-configurable, with the helping-others bonus layered on top.
- Streaks with monthly freeze tokens (PRD §21) so one missed day doesn't reset
  progress to zero.
- Badges/achievements with per-category and cumulative thresholds (PRD §22).
- Manual-approval flow with a parent queue for chores/kindness (PRD §30).
- Basic PWA manifest (installable; no offline service worker yet).

## Deliberately deferred (see PRD §39's own "don't build everything at once")

These are called out in the PRD itself as v1.5/v2/v3 scope, or need infrastructure
decisions (a live Supabase project, Claude API keys) that weren't part of this pass:

- **Backend/persistence**: PRD §37 recommends Supabase + Cloudflare Pages so history
  survives reinstalls and is visible cross-device. This build uses `localStorage`
  instead so it runs standalone with no account/infra setup. `src/types.ts` and
  `src/state/store.tsx` mirror the PRD §38 entity model, so swapping the reducer's
  persistence for Supabase calls later shouldn't require a data-model rewrite.
- Non-Reader Mode audio/icon-only presentation for Mia (PRD §6) — the age-appropriate
  seed content is there, but there's no text-to-speech or icon-only input yet.
- Hebrew/RTL localization (PRD §7).
- AI challenge generation + moderation queue (PRD §32/§33).
- Adaptive difficulty (PRD §31) — difficulty is currently parent-set per challenge.
- Digital Shop / cosmetics (PRD §18) and Level-up celebration moments (PRD §17) — XP
  and an age-normalized level curve are tracked (`src/lib/scoring.ts`) but not yet
  surfaced in the UI.
- Notifications (PRD §35).
- Photo evidence upload for approval-required challenges (PRD §30) — approval works,
  but without photo attachment.

## Project structure

```
src/
  types.ts            PRD §38-aligned data model
  lib/scoring.ts       difficulty->Stars/XP table + helping-others bonus (the core ask)
  lib/streak.ts, badges.ts, selectors.ts
  data/defaults.ts     seed kids/challenges/rewards/badges
  state/store.tsx       React context + reducer, localStorage-persisted
  components/          shared UI (StarField, TopBar, TabBar, Mascot)
  screens/             kid-facing screens
  parent/              parent mode (gate, dashboard, challenge form, settings, ...)
```
