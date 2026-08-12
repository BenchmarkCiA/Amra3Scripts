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
  Quests (full list), task detail modal (quiz/draw/self-report/discovery), Reward Shop,
  and Streaks & Badges — following the Jahnoon design's per-kid theming (Mia/pink
  dragon, Sam/teal owl, Alex/indigo icon badges), fonts, and dark cosmic backgrounds.
- Parent app: dashboard with per-child daily summary (including what each kid wrote
  on helping-others/discovery tasks) and a pending-approvals / pending-redemptions
  queue, challenge creation & management, reward shop management (add/**edit**/
  disable/delete), and a settings screen for the scoring table, kindness bonus %,
  streak rules, PIN, kids' names, and app language.
- Scoring engine matching PRD §12: Stars/XP scale with a 1–5 difficulty rating,
  fully parent-configurable, with the helping-others bonus layered on top.
- Multi-question quizzes (PRD §13/§14): Math/English challenges are 10-question
  rounds with per-question retry and a running "Question X of N" counter. A question
  only counts as correct if answered right on the *first* try (retries are free and
  never punished, but the recorded score is a genuine accuracy number). English
  questions show an example sentence using the word after a correct answer — the
  child controls advancing to the next question with a "Next" button on those
  (instead of auto-advancing) so there's time to actually read it; plain questions
  still auto-advance quickly. Score + a full per-question right/wrong breakdown
  (including the correct answer for anything missed) is stored per completion
  (`ChallengeCompletion.score.details`) and is visible to the parent via a "See
  answers" toggle on the Dashboard.
- Discovery / fun facts (PRD §8 "Discover Something New"): kids pick a subject
  (space, sports, science, animals, nature, history — `src/data/facts.ts`) and get a
  medium-length fact; what they learned is saved to the completion note so a parent
  can see it and start a conversation about it (PRD §25).
- Helping-others "what did you do?" notes: kindness/sibling/family self-report
  challenges require a short text answer before marking complete, visible to the
  parent on the dashboard (PRD §34 trust-based verification).
- Parent Dashboard: manual Stars/XP adjustment for any child (positive or negative,
  with an optional reason, fully logged as a normal transaction — PRD §15/§16 audit
  trail), and a per-challenge "Reset" button that reverses any Stars/XP already
  awarded for that completion and makes the quest available again the same day —
  useful for redoing a quiz or undoing a mistaken approval.
- Monthly Stats (Parent → Stats, PRD §26 Parent Analytics): pick any month a child
  has activity in and see total challenges completed, Stars/XP earned, quizzes taken
  with average first-try accuracy, and a per-category breakdown — answers "how many
  quizzes/challenges did they do this month."
- **How daily challenges refresh**: `recurrence: 'daily'` challenges are scheduled
  every single day automatically — there's no "roll over to tomorrow" step to run.
  A kid's "done" status for a challenge is keyed to *today's date*, so the moment the
  calendar date changes, all daily challenges reappear as not-done with no admin
  action needed.
- **Quiz content now rotates day-to-day.** Each Math/English quiz's question bank
  was expanded from a fixed 10 to a pool of 30 (`src/data/defaults.ts`), and each
  day a *different* 10-question subset is drawn from that pool
  (`src/lib/dailyQuiz.ts`): a small seeded shuffle keyed on
  `(challengeId, today's date)`, so it's stable all day (same 10 questions if the
  child reopens it), different tomorrow, and requires no server/cron job — every
  device computes the same result independently from the date alone. Honest math on
  what "30" buys you: with 30 questions and 10 shown per day, a child doing the quiz
  every single day will start seeing repeats after about 3 days, just in a different
  order/combination each time — it is *not* 30 fully-distinct days of content. Getting
  to genuinely 30 unique days would need ~300 authored questions per subject per kid
  (10/day × 30 days), which is a much larger content-authoring effort; this pass
  aimed for "meaningfully varies day to day" rather than "never repeats for a month."
  Expanding any pool further (or refreshing it with new questions periodically) is
  just appending more entries to the array — see "Deliberately deferred" below for
  what it would take to make that recur automatically without asking again each month.
- Editable kid profiles: a parent can rename any kid from Settings.
- Hebrew + RTL (PRD §7): a language toggle in Settings switches the UI chrome to
  Hebrew and flips the whole layout to right-to-left (`document.dir`, logical CSS
  properties throughout). Seed challenge/quiz/fact *content* stays English-authored
  for now — see "Deliberately deferred" below.
- Streaks with monthly freeze tokens (PRD §21) so one missed day doesn't reset
  progress to zero.
- Badges/achievements with per-category and cumulative thresholds (PRD §22).
- Manual-approval flow with a parent queue for chores/kindness (PRD §30).
- Basic PWA manifest (installable; no offline service worker yet).
- Supabase persistence (PRD §37 §38): schema + RLS applied, write-through sync from
  every reducer action, with a localStorage fallback when unconfigured. Every schema
  change so far has shipped as an *additive* migration (new columns/rows only) so
  stars, XP, and history survive app updates — see `apply_migration` calls referenced
  in commit history rather than any destructive `DROP`/table rebuild.

## Deliberately deferred (see PRD §39's own "don't build everything at once")

These are called out in the PRD itself as v1.5/v2/v3 scope, or need infrastructure
decisions (Claude API keys, real auth) or a larger content-authoring effort that
weren't part of this pass:

- **Real authentication** — see the security note above; Supabase Auth (PRD §37)
  is the natural next step once this needs to leave a private network.
- **Claude API-generated challenges + moderation queue** (PRD §32/§33) — the
  `content_moderation_queue`-shaped review step isn't built, and no AI generation
  is wired up yet.
- **Hebrew content translation** — the language toggle covers UI chrome (buttons,
  nav, labels, category names); challenge titles/descriptions, the 40 quiz questions,
  and the fun-fact library are still English-only. Translating educational content
  accurately (especially spelling/grammar questions, which are English-specific by
  nature) is a separate effort from RTL/layout support.
- Non-Reader Mode audio/icon-only presentation for Mia (PRD §6) — the age-appropriate
  seed content is there, but there's no text-to-speech or icon-only input yet.
- Adaptive difficulty (PRD §31) — difficulty is currently parent-set per challenge.
- Digital Shop / cosmetics (PRD §18) and Level-up celebration moments (PRD §17) — XP
  and an age-normalized level curve are tracked (`src/lib/scoring.ts`) but not yet
  surfaced in the UI.
- Notifications (PRD §35).
- Photo evidence upload for approval-required challenges (PRD §30) — approval works,
  but without photo attachment.
- Multi-question quiz *authoring* in Parent → Add Challenge — parent-created quizzes
  are still single-question; only the system-seeded Math/English quizzes got the
  10-question treatment. Building a multi-question form builder is a bigger UI task
  than this pass covered.
- **Automated monthly content refresh** — the 30-question pools rotate daily (see
  above) but don't grow or refresh themselves; nothing currently adds a "next batch"
  of questions on a schedule. Making that automatic needs one of: (a) a much bigger
  hand-authored pool up front so rotation alone stays fresh for longer, (b) someone
  asking for a fresh batch to be authored and appended periodically (the mechanism
  supports this today — it's just appending entries to the arrays in
  `src/data/defaults.ts` plus one additive Supabase migration, no architecture
  change), or (c) the AI-generation pipeline above, which could generate and append
  a new month's questions on a cron trigger, gated behind the same parent moderation
  requirement as any other AI content.

## Project structure

```
src/
  types.ts             PRD §38-aligned data model
  lib/scoring.ts        difficulty->Stars/XP table + helping-others bonus (the core ask)
  lib/i18n.ts            UI string dictionary (en/he) + isRTL()
  lib/streak.ts, badges.ts, selectors.ts
  lib/supabaseClient.ts Supabase client + isSupabaseConfigured flag
  lib/supabaseSync.ts   row<->app-model mapping, initial hydrate, write-through sync
  data/defaults.ts      local-only fallback seed (kids/challenges/rewards/badges)
  data/facts.ts          fun-fact library for the Discovery challenge kind
  state/store.tsx        React context + reducer; Supabase when configured, else
                        localStorage
  components/           shared UI (StarField, TopBar, TabBar, Mascot)
  screens/              kid-facing screens (TaskDetailModal has the quiz/discovery/
                        selfreport-note interaction logic)
  parent/               parent mode (gate, dashboard, challenge form, settings, ...)
```
