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
`app_settings`, plus the XP Shop tables `digital_items`, `egg_defs`, `child_unlocks`,
`child_eggs`) was applied via a series of additive migrations directly against the
`family-quest` Supabase project (`ganqijzaprfjvutyrlwa`, org `BenchmarkCiA's Org`,
`eu-west-1`, free tier — $0/mo). The sync layer lives in `src/lib/supabaseSync.ts`
(write-through per dispatched action) and `src/lib/supabaseClient.ts`. `src/lib/id.ts`'s
`makeId()` generates real UUIDs so locally-created records slot straight into Postgres
`uuid` columns.

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
- Parent Dashboard: a "Set Stars / XP Balance" card sets a child's balance to an
  **exact** number (not a +/- delta) — pick a child, the fields prefill with their
  current balance, edit either one (typing `0` genuinely zeroes it out) and Save, or
  use the one-tap "Reset to 0" button. Internally this still records the equivalent
  +/- transaction for audit history, it's just presented as "what should the balance
  be" rather than "how much to add," which is what a parent actually wants when
  correcting a mistake. Every change is logged as a normal transaction (PRD §15/§16
  audit trail). There's also a per-challenge "Reset" button that reverses any Stars/XP
  already awarded for that completion and makes the quest available again the same
  day — useful for redoing a quiz or undoing a mistaken approval.
- **XP Shop — characters, growth, and eggs** (kid tab "Shop"; parent tab "Shop" for
  admin controls): a second progression track alongside the Stars reward shop, built
  around the core rule that **XP is never spent** — "unlocking" a character just
  permanently records that a child reached the XP threshold, and Stars/XP stay
  untouched. Scope, deliberately: characters + growth + eggs only (see "Deliberately
  deferred" for what's out of this pass).
  - *Characters*: ~10 single-stage characters (astronaut, robot, pirate, wizard, fox,
    panda, space explorer, fairy, kitten, bunny) each unlock permanently once a
    child's lifetime XP crosses a threshold, filtered by an age range per item so a
    5-year-old and a 13-year-old see different shop content (PRD's "age-based shop").
    Each kid starts with one free character already unlocked (bunny/fox/astronaut for
    the 5/11/13-year-olds respectively) so the shop is never empty on day one.
    Unlocked characters can be freely switched ("Use") with no cost and stay unlocked
    forever.
  - *Growth*: 4 of the characters (dragon, unicorn, puppy, dino) have 2-3 visual
    stages, each gated by a higher lifetime-XP threshold than the last. Growing into
    the next stage is automatic and free the moment XP crosses the line — no button
    to press, no XP spent, and it can't be "undone" by spending XP since XP never
    goes down.
  - *Eggs*: once a child's lifetime XP crosses a parent-configurable global gate
    (Settings → "Egg unlock threshold," default 2000), an egg-selection screen opens
    showing eggs they haven't already hatched, filtered by age. Choosing an egg
    snapshots the child's XP at that moment; the egg's hatch progress is `current XP −
    that snapshot`, so incubating an egg never touches or requires spending the
    child's real XP total (`src/lib/xpShop.ts` `eggProgress()`). Once progress
    reaches the egg's requirement, a "Hatch now!" button appears; hatching
    permanently unlocks that egg's character family (starting at its baby stage) and
    equips it immediately. A child can only incubate one egg at a time — Parent →
    Shop can "Reset Egg" to let them pick again if needed.
  - *Parent controls* (Parent mode → "Shop" tab): per-child summary (equipped
    character, families unlocked, current egg progress, hatched eggs, reset-egg
    button), and inline editing of every character's/egg's XP requirement and age
    range — nothing is hardcoded, matching the PRD's "these values must not be
    hard-coded" requirement for the egg threshold specifically, extended here to all
    thresholds and age ranges.
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
  was expanded from a fixed 10 to a pool (`src/data/defaults.ts`), and each
  day a *different* 10-question subset is drawn from that pool
  (`src/lib/dailyQuiz.ts`): a small seeded shuffle keyed on
  `(challengeId, today's date)`, so it's stable all day (same 10 questions if the
  child reopens it), different tomorrow, and requires no server/cron job — every
  device computes the same result independently from the date alone. Pool sizes as of
  this pass: Math is now ~200 questions per kid (198 for Mia, 200 for Sam, 200 for
  Alex) — algorithmically generated and independently re-verified for arithmetic
  correctness and zero duplicates before shipping — which is enough for **about 20
  days** before a child doing the quiz daily starts seeing repeats (up from ~3 days at
  the old 30-question size). English stayed at 30 questions per kid (~3 days before
  repeats) — it's still hand-authored rather than algorithmically generated (spelling/
  vocabulary/grammar don't have a safe procedural-generation + auto-verification path
  the way arithmetic does), so growing it further means writing another batch by hand.
  Expanding any pool further (or refreshing it with new questions periodically) is
  just appending more entries to the array plus one additive Supabase migration — see
  "Deliberately deferred" below for what it would take to make that recur
  automatically without asking again each time.
- Editable kid profiles: a parent can rename any kid from Settings.
- Hebrew + RTL (PRD §7): a language toggle in Settings switches the UI chrome to
  Hebrew and flips the whole layout to right-to-left (`document.dir`, logical CSS
  properties throughout). Seed challenge titles/descriptions, reward names, badge
  names/descriptions, and the Discovery fact library are now translated too
  (`localizeChallengeText`/`localizeRewardName`/`localizeBadge` in `src/lib/i18n.ts`,
  `factsHe` in `src/data/facts.ts`) — the earlier version only translated UI chrome,
  which meant a Hebrew-mode quest card showed a Hebrew category tag next to an
  English title/description in the same box. The one deliberate exception: the
  English-vocabulary quiz ("Word Wizard") stays English end-to-end, title included —
  translating the label but not the spelling/vocabulary questions inside it would
  produce the same kind of mixed-language box for a challenge whose entire point is
  English, so `localizeChallengeText` special-cases `category === 'english'` to skip
  translation entirely rather than translate half of it.
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
- Home and Quests are one screen. There was no real reason for "today's top 4
  quests with a link to see the rest" and "the full quest list" to be two separate
  tabs showing overlapping data — Home now shows the full daily list directly, and
  the Quests tab/screen is gone (`KidQuests.tsx` deleted, `TabBar`'s `KidScreen`
  type dropped `'quests'`).
- **Exit confirmation** (`src/lib/useExitGuard.ts` + `src/components/ExitConfirmModal.tsx`):
  a phone's back button/gesture used to exit the page outright on the very first
  press, since the app has no router history entries of its own — silently losing
  whatever quest was open. A small history-guard hook (push one extra history
  entry on mount; a `popstate` event means the user pressed back; re-arm the guard
  immediately in case of a rapid second press) now intercepts every back press.
  The confirmation itself is an in-app modal styled like the rest of the app
  (dark card, rounded corners, Stay/Exit buttons) rather than the browser's native
  `confirm()` dialog — the hook exposes `{ showConfirm, confirmExit, cancelExit }`
  as React state instead of blocking synchronously, so the modal renders through
  the normal component tree. Verified with Playwright: pressing back shows the
  themed modal (not a native browser dialog), canceling keeps the app mounted.
- **Set Stars/XP to an exact balance** — see Parent Dashboard bullet above; fixes
  a bug where typing `0` did nothing (it was interpreted as "+0", not "set to 0").
- **A real division-answer bug in Sam's original math batch** was found and fixed:
  8 questions (e.g. "63 / 7 = ?") had `correctIndex` pointing at the *divisor*
  instead of the quotient — sometimes the true answer wasn't even among the
  choices. This was hand-authored content from before the pool-expansion pass
  started running automated correctness checks, so it had never been re-verified.
  Fixed locally and live via a full-pool correctness sweep (every question format
  in `defaults.ts` re-parsed and its stated answer recomputed independently) that
  now reports 0 errors across all 598 math questions — worth re-running
  (`scratchpad`-style verify script, not checked into the repo) after any future
  hand-authored batch, not just generated ones.
- **Age-5 content overhaul** (PRD "XP Character, Egg & Age-5 Content System" spec,
  §25-34) — Mia went from 5 daily challenges to ~32, spanning all 9 spec
  categories, reusing existing engine primitives wherever the content fit rather
  than building bespoke UI for each category:
  - *Math* ("Counting Fun"): the original 198-question plain-digit pool gained 46
    visual/emoji questions (counting, addition/subtraction with pictures,
    bigger/smaller, number sequences, shape ID) appended on top — additive, so
    both styles now rotate in daily (244 total).
  - *English* ("Word Match", new): word-to-picture matching, missing-letter,
    first-letter, and color-vocabulary questions — all expressed as ordinary quiz
    questions with emoji/letter choices, no new UI needed. Like Word Wizard, this
    stays English end-to-end regardless of UI language (category `'english'`).
  - *Creative* ("Picture Puzzle", new): pattern completion, color-the-shape, and
    counting-to-match, also as ordinary quiz questions — sits alongside the
    existing free-draw "Draw & Doodle," doesn't replace it.
  - *Memory* (new `ChallengeKind: 'memory'`, `MemoryBody` in
    `TaskDetailModal.tsx`): a real card-flip matching-pairs mini-game, board size
    from `difficulty` (3-10 pairs, i.e. 6-20 cards, matching the spec's
    progression), symbols on the challenge (`memorySymbols`), attempts tracked
    and saved as the completion note.
  - *Explorer* (6 challenges, new category), *Movement* (6, category `physical`),
    *Life Skills* (6, new category `lifeskills`, positively framed as "I Can Do
    It!" — this also absorbed and renamed the old single "Toy Pickup" chore), and
    *Daily Adventure* (6, new category `adventure`) are all plain honor-system
    `selfreport` challenges — no new engine work, just content.
  - *Kindness*: kept the existing "Kind Heart" and added one more ("Share").
  - *Discovery*: unchanged, already fit the spec well.
  - **No automatic rotation — manual parent control instead.** The first version
    of this feature auto-picked a random daily subset of 7 challenges once a kid
    had more than 7 (seeded by `childId`+date, same technique as quiz-question
    rotation). In practice this meant the parent had no visibility into or control
    over which quests would show up on a given day, which is a worse experience
    than just... showing all of them and letting a parent trim the list — so it
    was removed (`getTodayItemsForChild` now shows every active scheduled
    challenge, full stop). A child with more challenges just has a longer daily
    list until a parent prunes it via Parent → Manage Quests (see below).
- **Parent → Manage Quests** (`ParentChallengeList.tsx`, was "All Challenges"):
  redesigned to group every challenge by the kid it's assigned to, each with a
  visible on/off checkbox — this is the actual lever for "control what a kid's
  daily quests are": turning a quest off removes it from that kid's day
  immediately and *stays* off (it's the same `active` flag as before, just with
  a UI that makes per-kid curation the primary interaction instead of a flat,
  ungrouped list). Nothing is deleted (so history/stats are preserved) unless
  it's a parent-created challenge, which still has an explicit Delete button.
  This replaces the daily-rotation idea above as the answer to "how do I control
  what shows up."
- **Every challenge kind now gives visible completion feedback.** Draw & Doodle
  and plain self-report tasks (chores, missions, "I Can Do It!") used to close
  the modal *instantly* on completion with no acknowledgment at all — which,
  especially for a young child, reads as "nothing happened" / broken, even
  though the completion was correctly recorded. `TaskDetailModal` now shows a
  brief "🎉 Nice work! +N ⭐ +N XP" celebration (matching the quiz/memory-game
  pattern) before closing, for every kind that doesn't already have its own
  built-in celebration.
- **Memory game defensive fallback.** If a memory challenge is ever missing its
  `memorySymbols` (a hand-created one without that field set, or a sync/caching
  hiccup), `MemoryBody` now falls back to a built-in default symbol set instead
  of silently rendering nothing — a challenge with this `kind` can no longer open
  to an empty, unplayable modal.
- **Memory game: child picks the board size.** Opening a memory challenge now
  shows a "How many cards?" picker (6/10/14/16/20, matching the PRD's
  progression, capped by however many symbols that challenge actually has) with
  the difficulty-derived size pre-highlighted — the child can play a shorter or
  longer game each time instead of always getting the same fixed count.
- **Draw & Doodle is a guided "complete the picture" prompt, not free draw.**
  A pool of 8 prompts (`src/data/drawPrompts.ts`) — complete the house's
  windows, draw the other half of a flower, add the missing wheel, etc. — each
  pairs instruction text with a `guide` of a few plain vector shapes (lines,
  circles, rects, triangles in the canvas's coordinate space; no image assets)
  that pre-render onto the canvas before the child draws on top, and get
  redrawn if they hit Clear. One prompt is picked per day with the same
  seeded-daily technique used for quiz rotation. No data model lock-in: a
  `draw`-kind challenge with no `drawPrompts` set still falls back to plain
  free draw, so this doesn't force every future drawing challenge to have
  prompts.
- **Quiz *question text* is now translated in Hebrew mode, not just the
  challenge title/description.** The earlier Hebrew pass translated a
  challenge's title/description but never touched the individual question
  strings inside `quiz` arrays — so a Hebrew-mode child would see a Hebrew
  title next to an English question like "How many apples?" or "What is the
  perimeter of a 3x12 rectangle?". With hundreds of algorithmically-generated
  questions across Sam/Alex's math and Mia's visual math/Picture Puzzle pools,
  a per-string translation map (the title/description approach) doesn't scale.
  `src/lib/translateQuiz.ts` instead recognizes the ~15 sentence *templates*
  every question was generated from (via regex) and reconstructs the Hebrew
  phrasing with the original numbers/words substituted in — covers "How many
  X?", "You eat N, how many left?", bigger/smaller, shape/color questions,
  percentages, algebra ("Solve: Nx + C = R"), squares/roots, and perimeter.
  Pure symbol/digit questions ("8 x 3 = ?") needed no translation to begin
  with since they're already language-neutral. Anything that doesn't match a
  known template (e.g. a parent-typed custom question) falls back to the
  original text rather than breaking. The English-vocabulary quizzes (Word
  Wizard, Word Match) are still correctly exempt end-to-end, unchanged.
- **Counting Fun is icon-only now, no subtraction.** Replaced the pool with
  126 questions: 60 counting ("🦄🦄🦄 How many unicorns?") and 60 addition
  ("🐻 + 🐻🐻 = ?"), both drawing from a wide mix of animals, fantasy
  characters, food and objects (not just fruit), plus the existing 6
  shape-ID questions. The old plain-digit arithmetic and the digit-based
  bigger/smaller and number-sequence questions were removed entirely — no
  subtraction, no bare numbers as the "picture." (Replacing a quiz pool's
  *content* is safe and doesn't touch history: a completion snapshots its
  own question/answer data at the time, decoupled from the live pool.)
- **Two new Age-5 mini-games** (`ChallengeKind: 'bigger' | 'missing'`), both
  bespoke UI (not the quiz engine, since they need per-icon sizing/layout the
  quiz format can't express) and both 5 rounds per play-through:
  - *What's Bigger?* (`BiggerBody`): two icons from a shared pool render at
    randomly-assigned sizes (one much larger than the other); the child taps
    whichever one is visually bigger. "Bigger" is simply whichever rendered
    size the round assigned — no real-world size judgment required, so
    there's never an ambiguous case (a strawberry rendered larger than a
    lion is correctly "bigger" for the round).
  - *What's Missing?* (`MissingBody`): 5 icons show in a reference row, the
    same 5 show again below with one replaced by a "❓", and the child picks
    the missing one from 3 answer choices (the correct icon plus 2
    distractors not shown in the row, so there's no ambiguity about which
    position is "missing").
  - Both pick their icons/sizes/blank-position with the same seeded-PRNG
    technique as quiz rotation, keyed per round (`${seedKey}-${round}`) so
    a session is internally varied but stable if the child backs out and
    reopens the same day. New category `logic` (distinct from `memory`,
    which is specifically the card-matching game) with its own color.
  - Data lives on the challenge (`comparisonIcons` / `missingIcons`) with a
    shared default pool (`src/data/iconPools.ts`) as a fallback, same
    pattern as the memory game's defensive fallback.

- **Animated character avatars + new unicorn/soccer characters.** The XP
  Shop's "My Character" display and browse tiles now play a gentle idle
  bounce-and-tilt animation (`character-wiggle` keyframe in `app.css`) so
  equipped/browsable characters feel alive rather than static emoji. Added a
  directly XP-unlockable `unicorn-friend` character (age range 3-12) separate
  from the existing egg-gated unicorn family, since that one caps out at age
  9 and was unreachable for the 11yo; and two soccer-themed characters
  (`soccer-player`, `soccer-champion`) for the 13yo.
- **Toggleable background music.** A soft, slow pentatonic melody
  synthesized live with the Web Audio API (`src/lib/backgroundMusic.ts`) —
  deliberately not a bundled/sourced audio file, to sidestep licensing and
  keep the app self-contained. A floating 🔊/🔇 button (bottom corner, all
  screens) toggles it; the preference persists in `localStorage` since it's
  a device setting, not family data that needs to sync.
- **Memory game: up to 30 cards.** The card-count picker now offers 30 cards
  (15 pairs) on top of the original 6-20 range; Mia's symbol pool was
  expanded from 10 to 15 unique symbols so the largest board is actually
  playable (a board can't have more pairs than distinct symbols).
- **Sam's English simplified to word-translation only.** Word Wizard's
  quiz pool for the 11yo was replaced with 30 straightforward "What does
  '&lt;word&gt;' mean?" questions (English word → Hebrew meaning,
  multiple-choice) instead of spelling/grammar/synonym questions that were
  too advanced. The existing "example sentence shown right after the
  correct answer" mechanic is unchanged. Alex's separate, harder English
  pool is untouched.
- **Daily egg-care mini-game.** A cosmetic "Feed 🍎" / "Give a drink 💧"
  pair of buttons, available once each per child per day, on both the
  active (unhatched) egg and the equipped hatched character. Pressing
  either triggers a brief celebratory dance animation (`egg-dance`
  keyframe). Tracked in `localStorage` per child per day
  (`src/lib/useEggCare.ts`) since it's flavor, not progress data — no XP or
  Stars involved.
- **Parent Stats: review any specific day's wrong answers.** `ParentStats`
  (the monthly-summary screen) previously only showed an aggregate % correct
  for the month. Added a per-child date picker ("Review a specific day")
  that lists that day's scheduled challenges and, for quizzes, exactly which
  questions were answered wrong and what the correct answer was — reusing
  the same right/wrong breakdown `ParentDashboard`'s "Today" view already
  had (now extracted into a shared `QuizAnswerDetails` component), but
  selectable for any past date, not just today.
- **Fixed: math equations rendering with the operator on the wrong side in
  Hebrew mode.** Digits/operators/emoji are "weak"/"neutral" in the Unicode
  bidi algorithm, so inside an RTL page a plain equation like "🐷🐷 +
  🐷🐷🐷 = ?" could get visually reordered by the browser. `QuizBody` now
  forces `dir="ltr"` on the question element specifically when it contains
  no Hebrew characters (the exact case that's actually affected) — Hebrew
  instructional/translated text is untouched and still reads correctly
  right-to-left.

## Deliberately deferred (see PRD §39's own "don't build everything at once")

These are called out in the PRD itself as v1.5/v2/v3 scope, or need infrastructure
decisions (Claude API keys, real auth) or a larger content-authoring effort that
weren't part of this pass:

- **Real authentication** — see the security note above; Supabase Auth (PRD §37)
  is the natural next step once this needs to leave a private network.
- **Claude API-generated challenges + moderation queue** (PRD §32/§33) — the
  `content_moderation_queue`-shaped review step isn't built, and no AI generation
  is wired up yet.
- **Hebrew content translation** — chrome, seed challenge titles/descriptions,
  rewards, badges, and Discovery facts are translated (see above). The quiz
  *questions themselves* (math digits/expressions are language-neutral already;
  English-vocabulary questions stay English on purpose) and any content a parent
  types into a custom challenge/reward are not auto-translated.
- **XP Shop scope** — this pass built characters + growth stages + eggs
  (PRD "XP Character, Egg & Age-5 Content System" spec, sections 1-24/35-46), matching
  its own "MVP scope" guidance (~10-15 characters, ~5-6 eggs, a few growth stages) —
  not the full spec. Explicitly **not** built: per-character customization slots
  (hair/hat/clothing/accessories — spec §8, optional/expandable by the spec's own
  wording), achievement- or level-based unlock conditions (only XP-threshold unlocks
  are wired up; `DigitalItem.unlockType` only has `'xp' | 'egg'`, not `'level' |
  'achievement'`), and a parent UI for *creating* brand-new characters/eggs from
  scratch (parents can retune XP thresholds and age ranges on the built-in catalog
  from Parent → Shop, but adding a new character/egg means editing
  `src/data/characters.ts` and one additive migration — there's no art pipeline, so
  new items are emoji-based like the existing ones, consistent with the rest of the
  app's visual style).
- **Age-5 content category overhaul — now built** (spec sections 25-34). See
  "What's implemented" below for the full breakdown. Not carried over from the
  spec: audio narration / icon-only input (still text, though minimal), and the
  Explorer/Movement/Adventure missions are honor-system (no photo proof) like the
  rest of the app's selfreport challenges.
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
- **Automated content refresh** — the quiz pools rotate daily (see above) but don't
  grow or refresh themselves; nothing currently adds a "next batch" of questions on a
  schedule. Making that automatic needs one of: (a) an even bigger hand-authored/
  generated pool up front so rotation alone stays fresh for longer (Math just did
  this — see above), (b) someone asking for a fresh batch to be authored/generated
  and appended periodically (the mechanism supports this today — it's just appending
  entries to the arrays in `src/data/defaults.ts` plus one additive Supabase
  migration, no architecture change), or (c) the AI-generation pipeline above, which
  could generate and append new questions on a cron trigger, gated behind the same
  parent moderation requirement as any other AI content. English/Knowledge remain on
  hand-authored batches by explicit choice for now rather than moving to (c).

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
