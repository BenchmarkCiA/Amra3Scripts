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
cp .env.example .env.local   # fill in your Supabase project URL + anon/publishable key
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

If `.env.local` is left empty, the app runs in a **local-only fallback mode**
(data in the browser's `localStorage`, key `family-quest-state-v1`) — useful for a
zero-setup demo. When Supabase env vars are set, Supabase is the source of truth
instead: every dispatched action (completing a quest, redeeming a reward, a parent
creating a challenge, etc.) is write-through synced to Postgres, and the app hydrates
from Supabase on load.

A ready-made Supabase project (`family-quest`, free tier) already exists with the
schema below applied and seeded with the three default kids — see **Supabase setup**
below for its URL/key. Parent mode is gated by a PIN (default `1234`, changeable in
Settings) — **this is a UX gate, not a security boundary**: see the security note below.

## Supabase setup

Schema (`children`, `challenges`, `challenge_completions`, `star_transactions`,
`xp_transactions`, `rewards`, `reward_redemptions`, `streaks`, `scoring_config`,
`app_settings`) was applied via two migrations (`init_family_quest_schema`,
`seed_family_quest_data`) directly against the `family-quest` Supabase project
(`ganqijzaprfjvutyrlwa`, org `BenchmarkCiA's Org`, `eu-west-1`, free tier — $0/mo). The
sync layer lives in `src/lib/supabaseSync.ts` (write-through per dispatched action) and
`src/lib/supabaseClient.ts`. `src/lib/id.ts`'s `makeId()` generates real UUIDs so
locally-created records slot straight into Postgres `uuid` columns.

**⚠️ Security note — read before deploying anywhere public.** This is built for the
PRD's stated scope: "a private, single-family application... no public sign-up" (§37).
There's no Supabase Auth yet, so Row Level Security is enabled but its policies allow
full read/write to anyone holding the anon/publishable key — which is embedded in the
client bundle by design (that's how Supabase's client-side model works). The parent PIN
gates the *UI*, but nothing stops a visitor who opens devtools from calling the Supabase
API directly and bypassing it. This is fine for a private app only you and your family
can reach; **before deploying to a public URL**, either add real Supabase Auth (parent
login) with RLS policies scoped to `auth.uid()`, or keep the deployment behind something
that isn't publicly reachable (e.g. no public DNS / access restricted at the host).

**⚠️ Testing caveat.** I could not browser-test the live Supabase path from inside this
sandboxed dev session — its outbound network policy blocks direct HTTPS to
`*.supabase.co` from code running in-session (confirmed via a 403 from the egress
proxy on both a raw `curl` and a headless-browser request). The schema, migrations, and
seed data themselves *are* verified — I ran and inspected them via the Supabase
management API. And the local-only fallback mode (no `.env.local`) was fully
click-tested in a browser end-to-end before this Supabase pass. But the actual
browser ⇄ Supabase round trip (hydrate on load, write-through sync) is code-complete
and type-checks, not personally confirmed working live. Please run `npm run dev` with
`.env.local` filled in and click through a quest completion or two — if anything's off,
it's almost certainly in `src/lib/supabaseSync.ts` or `supabaseClient.ts`.

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
- Supabase persistence (PRD §37 §38): schema + RLS applied, write-through sync from
  every reducer action, with a localStorage fallback when unconfigured.

## Deliberately deferred (see PRD §39's own "don't build everything at once")

These are called out in the PRD itself as v1.5/v2/v3 scope, or need infrastructure
decisions (Claude API keys, real auth) that weren't part of this pass:

- **Real authentication** — see the security note above; Supabase Auth (PRD §37)
  is the natural next step once this needs to leave a private network.
- **Claude API-generated challenges + moderation queue** (PRD §32/§33) — the
  `content_moderation_queue`-shaped review step isn't built, and no AI generation
  is wired up yet.
- Non-Reader Mode audio/icon-only presentation for Mia (PRD §6) — the age-appropriate
  seed content is there, but there's no text-to-speech or icon-only input yet.
- Hebrew/RTL localization (PRD §7).
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
  types.ts             PRD §38-aligned data model
  lib/scoring.ts        difficulty->Stars/XP table + helping-others bonus (the core ask)
  lib/streak.ts, badges.ts, selectors.ts
  lib/supabaseClient.ts Supabase client + isSupabaseConfigured flag
  lib/supabaseSync.ts   row<->app-model mapping, initial hydrate, write-through sync
  data/defaults.ts      local-only fallback seed (kids/challenges/rewards/badges)
  state/store.tsx        React context + reducer; Supabase when configured, else
                        localStorage
  components/           shared UI (StarField, TopBar, TabBar, Mascot)
  screens/              kid-facing screens
  parent/               parent mode (gate, dashboard, challenge form, settings, ...)
```
