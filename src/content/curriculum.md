# Tournament Fundamentals

## Chapter 1 — Tournament Architecture: Blinds, Antes, and Payouts

### The Blind Ladder
- An MTT is defined by an **escalating blind structure**: blinds and antes rise on a fixed clock, typically every 30–60 minutes live, 5–15 minutes online (faster in turbos).
- Total chips in play are fixed while blinds rise, so the **average stack measured in big blinds falls for the entire tournament**. Your strategy must track that falling depth, not your chip count.
- Structure speed is the rate at which average depth collapses. A slow structure (60-min levels, 300bb start) rewards postflop skill; a turbo compresses everyone toward shallow-stack play within hours.

| Level | SB | BB | BB Ante | 30,000 stack in bb |
|---|---|---|---|---|
| 1 | 100 | 100 | 100 | 300 |
| 5 | 200 | 400 | 400 | 75 |
| 10 | 600 | 1,200 | 1,200 | 25 |
| 15 | 1,500 | 3,000 | 3,000 | 10 |

### Antes: The Engine of Action
- Classic format: every player posts a small ante, usually 10–12.5% of the BB. The modern standard is the **big blind ante (BBA)**: the player in the BB posts one full big blind as an ante for the whole table, once per orbit. Same average cost, faster dealing.
- With a BBA, the preflop pot is **2.5bb** (SB 0.5 + BB 1 + ante 1) instead of 1.5bb — a 67% larger reward for winning the pot preflop, at unchanged risk.

| Situation | Open size | Pot to win | Break-even fold % (pure steal) |
|---|---|---|---|
| No ante | 2.2bb | 1.5bb | 2.2 / 3.7 ≈ 59% |
| BB ante | 2.2bb | 2.5bb | 2.2 / 4.7 ≈ 47% |

- Consequence: the moment antes begin, **correct opening ranges widen at every position**. A player who keeps ante-free ranges in an ante game is burning equity every orbit.

> Antes are a strategic switch, not a detail. Solver-derived open ranges for ante and no-ante games differ by several percentage points of hands at every seat — re-rank your preflop standards the level antes appear.

### Payout Structure
- Standard MTTs pay roughly **10–15% of the field**. A min-cash returns about 1.5–2x the buy-in; first place takes roughly **15–25% of the prize pool** depending on field size.
- This top-heavy, step-shaped payout curve is the root cause of everything ICM-related: most of the money sits in the top three finishing positions, not at the cash line.

@check 9-handed with a big blind ante, how large is the preflop pot before any action? | 2.5bb | 1.5bb | 3.5bb
@check How often must a 2.2bb open succeed as a pure steal in a BB-ante pot? | About 47% | About 59% | About 33% |
@check What fraction of the field does a standard MTT payout structure pay? | Roughly 10–15% | Exactly 50% | Only the final table

## Chapter 2 — Formats: Freezeout, Re-Entry, and Late Registration

### Freezeout
- One buy-in, one life. Bust and you are out.
- Effects: fields play more honestly, the survival premium in marginal spots is slightly higher for everyone, and per-event variance is capped at one buy-in. The WSOP Main Event is the canonical freezeout.

### Re-Entry
- **Single re-entry** (one extra bullet) or **unlimited re-entry** during the registration period. Distinct from the older **rebuy** format, where you could re-buy chips while still seated and often take an add-on at the reg break.
- Structural effects: larger prize pools, and average field strength that *rises* through the reg period, because strong players keep firing bullets until they bag a stack.
- Strategic effect: while registration is open and you are committed to re-entering, busting costs you approximately **one fresh bullet (buy-in + rake)**, not your entire tournament equity. Thin chip-EV edges — e.g., a 51–52% flip for a big pot — become slightly more acceptable than in a freezeout. The cost: every bullet pays rake again, so total invested rises.
- Account honestly: your ROI is measured against **total bullets fired**, not per event. Three €1k bullets for a €4k cash is a 33% return, not 300%.

### Late Registration
- Reg often stays open 6–15 levels. Enter at the close and you might start with 30–40bb while the average is 60–80bb.
- Trade-offs: you skip the deep-stacked phase (losing chip-accumulation opportunities against the weakest players) but also skip hours of play, start closer to the money, and begin directly in a stack zone where strong shove/resteal fundamentals carry most of the strategic weight.

> Decide your bullet budget before Level 1. An unlimited re-entry €1k is not a €1k decision — two bullets plus rake is a €2,200+ session, and your bankroll rules must price the event that way.

@check In an unlimited re-entry event during the reg period, busting while committed to re-entering costs you approximately what? | The price of a new bullet (buy-in plus rake) | Your entire tournament equity with no recourse | Nothing at all
@check Which format puts the highest premium on tournament survival in marginal spots? | Freezeout | Unlimited re-entry during the reg period | Rebuy with add-on
@check You late-register with 30bb against an 80bb average. What is the main strategic consequence? | You start directly in a shove/resteal-oriented middle-game stack, skipping deep play | Your chips are worth more than the average player's chips | Late entry guarantees a lower ROI than entering at Level 1

## Chapter 3 — Measuring Your Stack: Big Blinds, M-Ratio, and Effective Stacks

### Big Blinds: The Universal Currency
- Always convert chips to bb: 25,000 at 500/1,000 is a **25bb stack**, whatever the chip count looks like. Strategy is keyed to depth bands, not chip totals:

| Depth (bb) | Zone | Core toolkit |
|---|---|---|
| 100+ | Deep | Full postflop tree, implied-odds hands at full value |
| 40–100 | Standard | Normal open/3-bet/4-bet structure |
| 25–40 | Shallow | 3-bets become near-commitments; speculative flatting shrinks |
| 15–25 | Resteal | Open-jams and 3-bet jams are primary weapons |
| ≤10–12 | Push/fold | Jam-or-fold is near-optimal; limping/min-raising only in specific spots |

### M-Ratio (Harrington)
- **M = stack ÷ (SB + BB + total antes)** — the number of orbits you survive folding everything. With a BB ante 9-handed, one orbit costs 2.5bb, so **M ≈ bb ÷ 2.5**.
- Example: 25,000 at 500/1,000 with a 1,000 BBA → orbit cost 2,500 → **M = 10**.
- Harrington's zones:

| M | Zone | Meaning |
|---|---|---|
| 20+ | Green | Every play is available |
| 10–20 | Yellow | Speculative hands (small pairs, suited connectors) lose value; loosen aggression |
| 6–10 | Orange | First-in aggression dominates; raise/fold lines disappear |
| 1–5 | Red | Push/fold only |
| <1 | Dead | Blinded off; all-in next feasible spot |
- **Effective M** adjusts for short-handed tables: multiply by (players ÷ 10). M = 10 at a 6-max table is an effective M of 6 — blinds hit you almost twice as fast.

### Effective Stacks
- In any pot, only the **smaller stack** is in play: your 120bb means nothing against an 18bb opponent — you are playing an 18bb pot. Multiway, effective stacks are pairwise per opponent.
- Effective stack drives implied odds. A small pair flops a set ~12% of the time (about 7.5-to-1 against); to set-mine a raise profitably you want roughly **15x the call or more behind** in effective stacks, because you won't get paid every time you hit. Calling 2.5bb with 22 is fine at 100bb effective and a clear leak at 25bb effective.

> Recount your stack in bb and M after every level change. At 15bb, folding one orbit costs 2.5bb — 17% of your stack for doing nothing. Shallow stacks decay fast, and every strategic threshold in this course is denominated in bb.

@check You have 25,000 at 500/1,000 with a 1,000 big blind ante. What is your M-ratio? | 10 | 25 | 4
@check You cover the table with 120bb and face an 18bb open-jam. How many big blinds are actually at risk for you in this pot? | 18bb | 120bb | 60bb, the table average
@check Roughly how deep (as a multiple of the call) do you want effective stacks to set-mine a raise with a small pair? | About 15x or more | About 3x | Exactly 7.5x, the odds against flopping a set

## Chapter 4 — The Life Cycle of an MTT: Five Stages

| Stage | Typical avg depth | Primary lever | ICM pressure |
|---|---|---|---|
| Early | 100–300bb | Postflop skill, implied odds | Negligible |
| Middle (antes on) | 30–60bb | Steals, 3-bet/resteal jams | Low |
| Bubble | 25–40bb | Big-stack pressure vs medium-stack survival | Very high |
| ITM | Varies | Re-widen vs the short-stack gamble wave | Drops sharply, then rebuilds |
| Final table | 20–40bb | Laddering vs accumulation, seat-by-seat | Peaks at every pay jump |

### Early Stage
- Deep stacks, no or small antes, payouts astronomically far away: play is closest to **pure chip-EV** — near cash-game strategy. Suited connectors and small pairs are at maximum value; dominated offsuit broadways at minimum.
- There is no ICM reason to avoid a clear +chipEV stack-off at Level 1. The legitimate reason for caution is thinner: with a large skill edge, marginal 51% coin-flips for 250bb buy little compared to the equity you can accumulate in smaller pots.

### Middle Stage
- Antes on, average depth sliding through 30–60bb. This is the **theft economy**: with 2.5bb dead per hand, opening and 3-bet jamming become the main profit engines.
- Concrete resteal: CO opens 2.2bb; you jam 20bb from the SB. Uncontested you collect 4.7bb (2.2 + 2.5 dead) — a **23% stack increase without a showdown**. Add the times you're called and win, and hands far below premium become profitable jams.

### The Bubble
- Hand-for-hand play near the cash line maximizes ICM distortion. **Medium stacks** suffer most: they have real money to lose by busting and can be attacked relentlessly by the chip leader, who risks little.
- In extreme spots — chip leader jamming into a medium stack on the stone bubble — the medium stack correctly folds hands as strong as 99 or AQs. Chip-EV says call; $EV says fold. (Chapter 5 shows exactly why.)

### In the Money
- The instant the bubble bursts, expect a **wave of all-ins**: short stacks who were nursing a min-cash now gamble freely. Re-widen your calling ranges against this wave, then re-tighten as the next payout ladder approaches.

### Final Table
- Payout jumps steepen sharply: a typical 9-handed FT pays around 1.5% of the pool for 9th and 20%+ for 1st. Every elimination is a real-money ladder, so ICM pressure — covered in depth in the ICM module — dictates almost every close decision.

@check At which points is ICM pressure on a medium stack typically at its maximum? | The stone bubble and final-table pay jumps | Level 1 | Immediately after the bubble bursts
@check What usually happens immediately after the bubble bursts? | A wave of all-ins as surviving short stacks start gambling | Play tightens dramatically across the field | Blinds are rolled back one level
@check Why does a bubble chip leader attack medium stacks rather than short stacks? | Medium stacks lose the most $EV by busting, so they fold the most | Short stacks always hold premium hands | Medium stacks have fewer chips than short stacks

## Chapter 5 — Chips Are Not Money: Non-Linear Chip Value

### The 10-Player Experiment
- 10 players pay $100 each: $1,000 pool, paid 50/30/20 ($500/$300/$200). Everyone starts with 1,500 chips.
- At the start, 1,500 chips ↔ $100 of equity: **6.67 cents per chip**.
- The winner ends with all 15,000 chips but receives $500: **3.33 cents per chip**.
- Tenfold the chips, only fivefold the money. Therefore: **every chip you add to your stack is worth less than the ones you already have, and every chip you lose was worth more than the ones you keep.** Only in a winner-take-all event (or the cash-game analogue) do chips map linearly to money.

### The 57% Flip — A Worked Example
Three players remain with equal 5,000-chip stacks; payouts $50/$30/$20 (per $100 pool). Each player's equity is $33.33. You are offered a chip-neutral all-in flip against one opponent:

| Outcome | Your chips | Your $ equity | Change |
|---|---|---|---|
| Before the flip | 5,000 | $33.33 | — |
| Win the flip | 10,000 | $43.33 | +$10.00 |
| Lose the flip | 0 (3rd place) | $20.00 | −$13.33 |

- Winning: with 2/3 of the chips you win the tournament 2/3 of the time → (2/3)($50) + (1/3)($30) = **$43.33**.
- Break-even: p(43.33) + (1 − p)(20.00) = 33.33 → **p ≈ 57.1%**.
- A flip that is dead-even in chips requires **57% equity** in dollars. The 7-point gap above 50% is your **risk premium** — and the bystander who folded gained $3.33 without playing a hand.

### Consequences
- **Calling ranges must be tighter than jamming ranges.** The jammer wins the dead money outright; the caller pays the risk premium in full. This asymmetry is the backbone of short-stack strategy.
- Risk premiums swell wherever pay jumps loom — the bubble and the final table — and shrink toward zero far from the money.

### Where This Leads: ICM and Nash Push/Fold
- The **Independent Chip Model (ICM)** formalizes this chapter: it converts stack sizes into finish-probability distributions and each stack's dollar share of the remaining prize pool. It is the standard tool for bubble, final-table, and satellite decisions.
- Below roughly 10bb, **jam-or-fold is near-optimal**, and unexploitable (Nash) jamming ranges are solved. Approximate chip-EV jamming ranges at ~10bb, 9-max with ante (exact ranges vary with ante size and stack distribution — full charts in the Push/Fold module):

| Position | Approx. Nash jam range at ~10bb |
|---|---|
| UTG | ~10% (66+, A9s+, AJo+, KTs+) |
| HJ | ~15% |
| CO | ~20% |
| BTN | ~30–35% |
| SB | ~45–50% |

> These are chip-EV ranges. Layer ICM on top — a bubble, a pay jump, a covering stack — and every one of them tightens. That translation from chips to dollars is exactly what the next module builds.

@check Three players with equal stacks, payouts 50/30/20: what win probability do you need for a chip-neutral all-in flip to break even in $EV? | About 57% | Exactly 50% | About 43%
@check In which format do chips map linearly to money? | Winner-take-all | Any standard MTT payout structure | Satellites
@check What does ICM compute? | Each stack's dollar share of the prize pool via finish-probability distributions | The GTO strategy for deep-stacked postflop play | Your probability of winning the next hand

# Short-Stack Push/Fold

## Chapter 1 — The Push/Fold Threshold

### Why sub-20bb play is a different game

Below ~20 big blinds, the stack-to-pot ratio collapses. Any raise commits a large fraction of your stack, postflop maneuvering room disappears, and the value of seeing flops in position shrinks toward zero. Tournament theory therefore replaces the deep-stack toolkit with a simpler, mathematically solvable one: **jam or fold**.

- At 40bb, a 2.2bb open risks ~5% of your stack. At 10bb it risks 22% — and folding to a 3-bet jam afterward is a disaster.
- Push/fold is one of the few genuinely **solved** areas of poker: Nash equilibrium jam/call ranges exist and are unexploitable.
- Below **~10bb effective**, pure push/fold loses almost nothing versus a full mixed strategy. Between 10–16bb, solvers mix in min-raises and limps, but the jam-only baseline remains close to zero EV loss.

### Stack bands and default toolkits

| Effective stack | Default toolkit |
|---|---|
| 20bb+ | Standard raise/fold, 3-betting, postflop play |
| 15–20bb | Small opens; re-jam over opens; open-jam only rarely |
| 10–15bb | Mixed: open-jam much of the range (especially late position); structured min-raise/limp strategies viable |
| 5–10bb | Pure push/fold is essentially optimal |
| <5bb | Jam very wide; fold equity is collapsing — get in **first**, before blinding down |

> Always count the **effective stack** — the smaller of yours and the relevant opponent's. A 40bb stack facing only 8bb blinds is playing 8bb poker in that confrontation.

### Why open-shoving beats min-raising when short

- **Maximum fold equity.** A jam denies opponents the option of calling small to realize equity or 3-bet bluffing you off your hand.
- **No dominated postflop spots.** With a 10bb stack and a min-raise pot, you play a ~5 SPR pot out of position with a capped plan. Jamming skips that entirely.
- **You cannot be exploited by re-jams.** Min-raise/folding at 11bb is the classic leak: you open to 2bb, the big blind jams, and the pot lays you a price you almost cannot refuse. Example: 11bb effective, you open 2bb, BB jams; you call 9 more into a final pot of 23.5bb (11 + 11 + 0.5 SB + 1 ante) — you need only **~38% equity**. Nearly your whole range is priced in, so "raise/fold" burned 2bb for nothing.
- **Full equity realization.** All-in preflop, a hand like 66 or A5s realizes 100% of its raw equity. Played postflop at a low SPR out of position, it realizes far less.

Min-raising and limping still have a role at 10–16bb — covered in Chapter 6 — but the burden of proof is on the small raise, not the jam.

@check Below what effective stack is pure push/fold essentially a zero-EV-loss strategy versus optimal mixed play? | Around 10bb | Around 20bb | Around 30bb
@check At 11bb effective you min-raise to 2bb and the big blind jams. With blinds 0.5/1 plus a 1bb ante, roughly what equity do you need to call? | About 38% | About 50% | About 62%
@check Which action preserves the most fold equity at 8bb effective? | Open-shoving all-in | Min-raising with the intention of folding to a jam | Open-limping

## Chapter 2 — Fold Equity: The Engine of the Shove

### The shove EV equation

The EV of an open-jam decomposes into two parts:

**EV(jam) = P(everyone folds) × (blinds + antes) + P(called) × (equity × final pot − stack risked)**

The first term is pure profit with no showdown. That is fold equity, and at short stacks it does most of the work.

### The dead money on the table

With blinds 0.5/1 and a 1bb big blind ante (the modern standard), every pot starts with **2.5bb** of dead money. Stealing it is worth a large slice of a short stack:

| Your stack | Successful steal = stack growth |
|---|---|
| 15bb | +2.5bb ≈ **+17%** |
| 10bb | +2.5bb ≈ **+25%** |
| 8bb | +2.5bb ≈ **+31%** |
| 6bb | +2.5bb ≈ **+42%** |

Meanwhile, doing nothing is expensive: nine-handed with a big blind ante, one orbit costs 0.5 + 1 + 1 = **2.5bb**. At 8bb, folding every hand for one orbit destroys ~31% of your stack. Passivity is not neutral — it is a steady, guaranteed loss.

### A worked example

Button, 8bb effective, blinds 0.5/1 + 1bb ante. You jam a hand with mediocre showdown value (a K7s/K9s-type holding).

- Assume the SB calls 12% of hands and the BB calls 20%. P(both fold) = 0.88 × 0.80 ≈ **70%**.
- When called (≈30%), you hold roughly **35% equity** against their tight calling ranges. Final pot vs the BB: 8 + 8 + 0.5 + 1 = 17.5bb. EV when called = 0.35 × 17.5 − 8 ≈ **−1.9bb**.
- Total: EV ≈ 0.70 × (+2.5) + 0.30 × (−1.9) ≈ **+1.2bb per jam**.

A hand that is a clear equity underdog when called still prints more than a full big blind because of the fold branch. This is why Nash jam ranges look "too wide" to untrained eyes.

### What moves fold equity

- **Your stack size relative to callers.** A 12bb jam threatens real damage and gets folds; a 3bb jam prices the blinds in and gets called by nearly anything. Below ~4bb, fold equity is close to gone — which is exactly why you must jam **before** reaching that zone.
- **Position.** Fewer players left to act = higher P(everyone folds). This single fact drives the position-based widening in the Nash tables.
- **Opponent incentives.** ICM pressure (bubble, pay jumps) makes opponents call tighter, raising your fold equity above the chip-EV baseline.

> The worst short-stack outcome is not busting on a jam — it is blinding from 8bb to 3bb, then getting called by K4o with no fold equity left.

@check With blinds 0.5/1 and a 1bb big blind ante, how much dead money does a shover win when everyone folds? | 2.5bb | 1.5bb | 4bb
@check In the worked example, a button 8bb jam with only ~35% equity when called earned approximately what? | About +1.2bb per jam | About −0.5bb per jam | Exactly 0bb — it breaks even
@check What happens to fold equity as your stack falls below roughly 4bb? | It nearly disappears because callers are priced in | It increases because opponents fear elimination | Nothing — fold equity is independent of stack size

## Chapter 3 — Nash Push Ranges by Position and Stack

### How to use these tables

The tables below are **chip-EV Nash push/fold baselines**, 9-handed, blinds 0.5/1 with a 1bb big blind ante, first-in (everyone folded to you). They are unexploitable defaults; exact frontiers vary by ±1–3% between solvers and formats, and ICM situations (Chapter 4) call for tightening. Range notation: "K9s+" = K9s through KQs; "any A" = every ace, suited and offsuit.

- Memorize **BTN and SB first** — they are your most frequent and widest jam spots.
- Suitedness is worth a lot at these depths: A2s jams several seats and several big blinds earlier than A2o.
- Pairs jam very wide everywhere: even 22 is a standard jam from most seats at ≤10bb.

### 15bb

| Position | Nash jam range | ~% of hands |
|---|---|---|
| UTG | 66+, ATs+, AJo+, KQs | 8% |
| MP | 55+, A9s+, AJo+, KTs+, KQo, QJs | 11% |
| CO | 44+, A7s+, A5s, ATo+, K9s+, KJo+, QTs+, JTs | 15% |
| BTN | 22+, A2s+, A8o+, K7s+, KTo+, Q9s+, QJo, J9s+, T8s+, 98s | 23% |
| SB | 22+, any A, K2s+, K8o+, Q5s+, Q9o+, J7s+, J9o+, T7s+, T9o, 97s+, 86s+, 76s, 65s | 40% |

(At 15bb, open-jamming from early seats competes with small-raise strategies; the jam range shown is the pure push/fold baseline.)

### 12bb

| Position | Nash jam range | ~% of hands |
|---|---|---|
| UTG | 55+, A9s+, A5s, AJo+, KJs+, KQo | 11% |
| MP | 44+, A8s+, A5s, ATo+, KTs+, KQo, QJs | 13% |
| CO | 33+, A2s+, A9o+, K9s+, KJo+, QTs+, QJo, JTs | 18% |
| BTN | 22+, A2s+, A5o+, K6s+, K9o+, Q8s+, QTo+, J8s+, JTo, T8s+, 98s, 87s | 29% |
| SB | 22+, any A, K2s+, K7o+, Q4s+, Q9o+, J6s+, J9o+, T6s+, T9o, 96s+, 86s+, 75s+, 65s | 42% |

### 10bb

| Position | Nash jam range | ~% of hands |
|---|---|---|
| UTG | 44+, A8s+, A5s, ATo+, KTs+, KQo, QJs | 13% |
| MP | 33+, A2s+, A9o+, K9s+, KJo+, QTs+, JTs | 17% |
| CO | 22+, A2s+, A7o+, K7s+, KTo+, Q9s+, QJo, J9s+, T9s, 98s | 23% |
| BTN | 22+, any A, K4s+, K9o+, Q7s+, QTo+, J8s+, JTo, T7s+, 97s+, 87s, 76s | 33% |
| SB | 22+, any A, K2s+, K5o+, Q2s+, Q8o+, J4s+, J8o+, T6s+, T8o+, 96s+, 98o, 85s+, 75s+, 64s+, 54s | 50% |

### 8bb

| Position | Nash jam range | ~% of hands |
|---|---|---|
| UTG | 33+, A2s+, A9o+, KTs+, KQo, QJs | 16% |
| MP | 22+, A2s+, A8o+, K8s+, KJo+, QTs+, QJo, JTs | 20% |
| CO | 22+, A2s+, A5o+, K5s+, KTo+, Q8s+, QJo, J8s+, JTo, T8s+, 98s | 27% |
| BTN | 22+, any A, K2s+, K9o+, Q5s+, Q9o+, J7s+, J9o+, T7s+, T9o, 97s+, 86s+, 76s, 65s | 39% |
| SB | 22+, any A, any K, Q2s+, Q7o+, J2s+, J8o+, T4s+, T8o+, 95s+, 97o+, 84s+, 87o, 74s+, 63s+, 53s+, 43s | 58% |

### 6bb

| Position | Nash jam range | ~% of hands |
|---|---|---|
| UTG | 22+, A2s+, A8o+, K9s+, KTo+, Q9s+, QJo, JTs | 21% |
| MP | 22+, A2s+, A5o+, K7s+, KTo+, Q9s+, QTo+, J9s+, JTo, T9s | 27% |
| CO | 22+, any A, K4s+, K9o+, Q8s+, QTo+, J8s+, JTo, T8s+, 98s, 87s | 33% |
| BTN | 22+, any A, K2s+, K7o+, Q2s+, Q9o+, J5s+, J8o+, T6s+, T8o+, 96s+, 98o, 85s+, 75s+, 65s | 46% |
| SB | 22+, any A, any K, any Q, J2s+, J5o+, T3s+, T7o+, 95s+, 97o+, 85s+, 86o+, 74s+, 64s+, 53s+ | 67% |

At **5bb and below**, the SB jams essentially any two cards first-in, and the BTN approaches 55–60%.

### The patterns that matter

- **Position dominates.** At every depth the SB jams roughly 4–5× the hands UTG does. Each seat later ≈ one meaningful range widening.
- **Shorter = wider.** UTG goes from ~8% at 15bb to ~21% at 6bb — roughly 2.5× wider. The pot is a bigger fraction of your stack, and being called hurts relatively less.
- **A useful heuristic:** dropping ~2–3bb of depth widens your range about as much as moving one seat later.

> These are floors of unexploitability, not ceilings of profit. Versus blinds who fold too much, the max-EV jam range is wider than Nash (Chapter 6).

@check Which position has the widest Nash first-in jam range at every stack depth? | The small blind | UTG | The cutoff
@check Roughly what percentage of hands does the button open-jam at 8bb with antes in the Nash baseline? | About 39% | About 12% | About 70%
@check From 15bb down to 6bb, the UTG Nash jam range changes how? | It widens from about 8% to about 21% of hands | It stays essentially constant | It tightens as the stack shrinks

## Chapter 4 — Calling a Shove

### Why calling ranges are tighter than jamming ranges

The jammer profits from two sources: fold equity **plus** showdown equity. The caller has exactly one: showdown equity. A caller must therefore beat the pot odds with raw equity alone, which produces the fundamental asymmetry of push/fold play:

- **Jam ranges are wide. Call ranges are tight.** At the same depth and position, the correct calling range is often only half the width of the correct jamming range — or less.
- Fold equity for a caller is zero: the money is already in the middle.

### Chip-EV calling: the pot-odds calculation

Required equity = (amount to call) ÷ (final pot).

- **Example A — wide spot:** BTN jams 8bb (a ~39% Nash range). You are BB with 1bb posted; you call 7 more into a final pot of 17.5bb (8 + 8 + 0.5 + 1 ante). Required equity = 7/17.5 = **40%**. Against a 39% range, that is met by roughly 22+, A2s+, A3o+, K5s+, K9o+, Q9s+, QTo+, JTs — about **28%** of hands. Wide jam, fairly wide call.
- **Example B — tight spot:** UTG jams 10bb (~13% range). BB calls 9 into 21.5bb → needs **~42%** equity. Against 13%, that is only about 55+, ATs+, AJo+, with KQs/AJo marginal — roughly **7–8%** of hands. The call range is barely half the jam range.
- **Heads-up benchmark:** SB jams 10bb into your BB, no ante. You call 9 more into a final pot of 20bb → required raw equity **45%**. Versus a wide Nash SB jam, hands as weak as K9o and Q9s clear that bar; versus a nit, they do not. Always define the villain's range before computing.

### ICM: the risk premium

Chip EV is not tournament EV. Under ICM, chips you can lose are worth more than chips you can win, so a break-even chip-EV call is a **losing** tournament call. The gap is the **risk premium**.

Classic 3-handed example. Prize pool $100, payouts $50/$30/$20, three equal stacks:

- Your ICM equity now: **$33.33**.
- Call all-in vs an equal stack and win → 2/3 of the chips heads-up → ICM ≈ 0.667 × $50 + 0.333 × $30 = **$43.33** (gain $10.00).
- Call and lose → 3rd place, **$20.00** (loss of $13.33).
- Break-even equity = 13.33 / (13.33 + 10.00) = **~57%**.

You need **57% equity for a zero-EV call** in a spot where chip EV says 50%. That 7-point gap is the risk premium — and it grows on money bubbles and at big pay jumps, commonly reaching **5–15 points**, and 20+ when a huge pay jump hinges on your survival (e.g., two micro-stacks about to blind out).

- ICM tightens **calling** ranges dramatically; it tightens jamming ranges much less (the jammer still collects fold equity — in fact, opponents' risk premiums increase your fold equity).
- **Overcalling** a jam that has already been called requires massive further tightening: you need to beat two ranges, and the equity bar jumps accordingly. A hand that snap-calls one jam (77, AJs) is often a clear fold over a jam **and** a call.

> Before calling off a covered stack near a pay jump, add the risk premium to the raw pot-odds number. "I had ace-jack, I had to call" is chip-EV thinking in an ICM world.

@check At equal depth, correct all-in calling ranges compare to correct jamming ranges how? | They are significantly tighter | They are significantly wider | They are identical
@check In the 3-handed $50/$30/$20 ICM example with equal stacks, what equity is needed for a break-even all-in call? | About 57% | Exactly 50% | About 43%
@check Heads-up, no ante: the SB jams 10bb and you call 9 more from the BB into a final pot of 20bb. What raw equity do you need? | 45% | 33% | 55%

## Chapter 5 — Antes: The Range Inflator

### The dead-money math

Antes are the single biggest structural lever on jam ranges.

- No ante: preflop dead money = 0.5 + 1 = **1.5bb**.
- 1bb big blind ante: dead money = **2.5bb** — a **+67% increase** in what a successful steal wins.
- The reward for jamming rises 67% while the risk (your stack) is unchanged. Every profitable-jam frontier shifts wider.

### How much wider? A 10bb comparison

Approximate Nash first-in jam ranges at 10bb, 9-handed:

| Position | No ante | With 1bb BB ante | Relative widening |
|---|---|---|---|
| UTG | ~9% | ~13% | ~+45% |
| MP | ~12% | ~17% | ~+40% |
| CO | ~17% | ~23% | ~+35% |
| BTN | ~25% | ~33% | ~+30% |
| SB | ~44% | ~50% | ~+15% |

- Typical effect across positions and depths: ante structures widen correct jam ranges by roughly **25–40%** (early positions widen the most in relative terms).
- Concretely: A9o is a fold UTG at 10bb without antes and a clear jam with them; K9o appears in the ante-era BTN jam range a full 2–3bb deeper than in the no-ante range.

### Big blind ante vs traditional antes

- The **big blind ante** (BB posts ~1bb for the whole table) and traditional individual antes summing to ~1bb per hand put the **same total dead money** in the pot — correct jam ranges are essentially the same. Do not tighten just because "only the BB anted."
- Antes also improve the **caller's** pot odds — calling ranges widen too, which claws back some fold equity. The net effect is still strongly toward wider jamming, because the dead money grows the fold-branch payoff more than the extra calls cost.

### Structural urgency

- With antes, an orbit costs 2.5bb instead of 1.5bb — at 10bb you burn **25% of your stack per orbit** waiting for aces. Ante structures punish patience and reward first-in aggression; that is their design purpose.
- Practical rule: when the ante kicks in at a new level, mentally shift every chart one notch wider. Players who keep using no-ante ranges in ante levels are the most common source of free fold equity in live MTTs.

@check Adding a 1bb big blind ante changes preflop dead money from 1.5bb to 2.5bb — an increase of roughly | 67% | 25% | 150%
@check Compared with no-ante structures, antes typically make correct Nash jam ranges | 25–40% wider | 2–3% wider at most | tighter, because calls are cheaper |
@check A big blind ante versus traditional individual antes of the same total per hand should change your jam ranges how? | Essentially not at all — total dead money is what matters | Dramatically tighter with a BB ante | Antes only matter postflop

## Chapter 6 — Beyond the Jam: Limps, Min-Raises, and Exploits

### When the jam is not the whole answer

Pure push/fold is near-optimal below ~10bb. Between **10 and 16bb**, solvers use richer strategies. Use them only if you can execute the follow-up; a well-played jam beats a badly played min-raise every time.

### SB limping at 8–14bb

- Modern solver output for SB vs BB at these depths is **limp-heavy**: the SB limps a wide range that includes both traps (AA/KK limp at meaningful frequency) and speculative hands, jams a band of mid-strength hands (weak aces, medium kings, small pairs at some frequencies), and folds the true bottom.
- The logic: at 12bb, jamming A5o risks 12 to win 2.5, while limping keeps the pot small with hands that play tolerably postflop — and the limping range is protected from attack because monsters live inside it.
- Requirement: you must have a plan versus a BB raise (limp/jam with the right band, limp/fold the floats). If you don't, jam the Nash range and lose almost nothing.

### Min-raising at 12–16bb (CO/BTN)

- Solver structure is **polar**: min-raise the top (raise/call jams with QQ+/AK-type hands) plus some junk with good blockers (raise/fold), and **open-jam the middle** — hands like 44–88, A8o–ATo, KTs, QJs that hate facing a re-jam but have too much equity to fold.
- The middle jams precisely because it cannot profitably call a 3-bet jam and does not want to be bluffed off 40%+ equity. "Raise the top and the trash, jam the middle" is the standard shape.

### The stop-and-go

- Spot: you are in the **BB with ~6–9bb** facing a single in-position raiser, too shallow for a preflop jam to generate folds (the raiser is priced in).
- Line: call preflop, then **jam any flop** before the raiser can act. Since an unpaired hand misses the flop about **2/3** of the time, you convert dead preflop fold equity into live postflop fold equity.
- Only correct out of position, only heads-up, only when a preflop jam would be called ~always.

### Blockers: why A5s beats KJo as a jam

- Holding an ace cuts villain's **AA combos from 6 to 3** and **AK from 16 to 12**. The hands most likely to call you are exactly the hands your ace blocks.
- This is why low suited aces (A2s–A5s) sit in Nash jam ranges ahead of prettier-looking broadways: fewer calls, and live cards plus flush/straight/wheel equity when called.

### Exploitative deviations — Nash is a floor, not a target

- Nash guarantees you cannot be exploited; it does **not** maximize EV against real opponents.
- **Blinds over-fold** (nits, ICM-terrified stacks, players you've seen fold A9o to a jam): widen well beyond Nash. SB vs a nitty BB at 10bb, jamming close to any two is frequently max-EV.
- **Calling stations / big-stack bullies who call light:** tighten toward value — fold equity assumptions drive the wide jams, and when fold equity is overstated, the bottom of the range flips to losing.
- Recount ranges every time the ante level, table lineup, or pay-jump situation changes.

### The short-stack mistake list

- Blinding from 8bb to 4bb "waiting for a hand" — the most expensive form of folding.
- Min-raise/folding at 10–12bb.
- Calling jams with chip-EV odds while ignoring a 10-point ICM risk premium.
- Using no-ante ranges in ante levels.
- Jamming 15bb+ stacks from early seats with hands that play fine as small opens (QQ+, AK) — you fold out everything you dominate.

@check At 8–14bb in the SB versus BB, modern solvers often prefer which structure over pure jam-or-fold? | A limp-heavy strategy with a wide, trap-protected limping range | Min-raise/folding every playable hand | Open-folding everything below premium pairs
@check A jam with A5s gains extra value primarily because | your ace blocks AA and AK in opponents' calling ranges | five-high flushes are the most common winning hand | suited aces always have more than 50% equity when called
@check The stop-and-go (call preflop, jam any flop) is designed for which situation? | Big blind, ~6–9bb, out of position versus a single raiser who would call a preflop jam | Button, 15bb, versus two limpers | Any position with AA when you want to trap

# ICM & Final Table

## Chapter 1 — Chips Are Not Money: The Independent Chip Model

### The core problem ICM solves
In a cash game, chips map 1:1 to money: winning a 200bb pot doubles your money. In a tournament they do not, because the prize pool is paid out on a **ladder**. Once payouts are non-linear, chip expected value (**chip-EV**) and money expected value (**$EV**) diverge — and every correct final-table decision is a $EV decision.

The **Independent Chip Model (ICM)** converts stack sizes into real-money tournament equity. The standard implementation is the **Malmuth–Harville** calculation:

- Your probability of finishing **1st** equals your share of the chips in play.
- Your probability of finishing **2nd** is computed by removing each possible winner, then taking your chip share of what remains — summed over all winners.
- Repeat recursively for 3rd, 4th, and so on.
- Your ICM equity = sum over all finishing positions of (probability of that finish × prize for that finish).

### The number that changes everything
Three players left, payouts **$50,000 / $30,000 / $20,000**. Stacks: A = 5,000,000, B = 3,000,000, C = 2,000,000 (10M total).

| Player | Chip share | ICM equity | Equity share of pool |
|---|---|---|---|
| A | 50% | **$38,393** | 38.4% |
| B | 30% | **$32,750** | 32.8% |
| C | 20% | **$28,857** | 28.9% |

A holds **2.5×** C's chips but only **1.33×** C's money equity. The full calculation behind this table is worked line-by-line in Chapter 5.

### Properties you must internalize
- **Diminishing marginal value:** your first chip is worth the most; every chip you add is worth less in $ than the one before. Doubling your stack never doubles your $EV (except heads-up).
- **The short stack is propped up by the ladder:** C's guaranteed $20,000 floor is why 20% of the chips is worth 28.9% of the money.
- **Winner-take-all is the special case:** with one prize, chip-EV = $EV and ICM effects vanish. The flatter the remaining payout structure, the stronger the ICM distortion.
- **Heads-up, ICM vanishes again:** with two payouts left, $EV is linear in chips (EV = 2nd-place money + chip share × the difference), so pure chip-EV play is correct.

### Known limitations (be objective about the model)
- ICM assumes **no skill edge**, ignores **position, blinds, and who pays them next** — it is a snapshot, not a simulation.
- Refinements such as **Future Game Simulation (FGS)** look several hands ahead (who posts the next big blind matters a lot at short stacks) and adjust ICM at the margins. Modern solvers use FGS; the directional conclusions in this module hold under both.

> ICM is not a "style" or an opinion. It is the market price of your stack. Every deviation from chip-EV described in this module is just correct pricing of elimination risk.

@check In ICM terms, what happens to the real-money value of each additional chip you win? | It decreases — chips have diminishing marginal $ value | It increases as your stack grows | It stays exactly proportional to stack size
@check With 50% of the chips three-handed (payouts $50k/$30k/$20k), player A's ICM equity is about... | $38,400 — well below 50% of the pool | $50,000 — exactly proportional | $25,000 — half of first prize
@check What does the Malmuth-Harville model use to estimate the chance of each finishing position? | Current stack sizes as shares of total chips | Player skill ratings | Number of hands remaining

## Chapter 2 — Risk Premium: How ICM Creates Fold Pressure

### The asymmetry that drives everything
Because chips have diminishing marginal $ value, every all-in is asymmetric: **the $ you lose by busting exceeds the $ you gain by doubling**. In the Chapter 3 example you will see a mid stack that gains $5,405 by doubling but loses $10,243 by busting — with identical chip amounts at stake.

This asymmetry is quantified by the **bubble factor**:

- **Bubble factor (BF)** = ($EV lost if you lose the all-in) ÷ ($EV gained if you win it)
- **Required equity to call** = BF ÷ (BF + 1)
- **Risk premium** = required equity − the chip-EV requirement (usually ~50% for a pot-sized all-in)

| Bubble factor | Required equity | Risk premium vs 50% |
|---|---|---|
| 1.0 (pure chip-EV) | 50.0% | 0 pts |
| 1.2 | 54.5% | +4.5 pts |
| 1.5 | 60.0% | +10 pts |
| 2.0 | 66.7% | +16.7 pts |
| 3.0 | 75.0% | +25 pts |

Typical values: heads-up BF = 1.0; a comfortable big stack facing another big stack often sees BF 1.5–2.5; a mid stack facing a covering stack on the money bubble or at a final table with a micro stack present can exceed BF 2.0.

### Why folds that "can't be right" are right
A hand with 55% equity against the shover's range is a clearly +chip-EV call. If your bubble factor is 1.5, you need 60% — the same call **burns real money**. This is the entire mechanism behind "folding hands at a final table that are clear chip-EV calls": nothing about the hand changed; the price of your tournament life did.

Key structural facts:

- **Risk premium is paid by the player at risk.** Whoever can bust pays the premium; whoever covers pays far less (they still pay something — losing chips lowers their equity — but they cannot be eliminated).
- **ICM punishes callers much harder than jammers.** The jammer frequently wins the pot uncontested — the fold-equity part of a shove's EV is immune to ICM. The caller only ever realizes value at showdown, with elimination on the line. Result: under ICM, calling ranges tighten drastically, jamming ranges tighten only moderately.
- **That gap IS fold equity.** Aggressors profit precisely because opponents' correct calling thresholds are inflated. ICM pressure is not an excuse to fold your way through a final table — it is the reason well-timed aggression prints money.

> Before calling any final-table all-in, ask one question: "What is my risk premium here?" If a shorter stack is at the table and you are covered by the shover, assume you need 5–15 points more equity than the chip-EV math suggests — sometimes more.

@check With a bubble factor of 1.5, what equity do you need to correctly call an all-in? | 60% | 50% | 40%
@check Why does ICM generate extra fold equity for aggressors at final tables? | Callers need far more than chip-EV equity, so shoves get through more often | Blinds are larger at final tables | Aggressive players tilt their opponents
@check Who pays the largest risk premium in an all-in confrontation? | The covered player whose tournament life is at risk | The big stack that covers everyone | Whoever is in the big blind

## Chapter 3 — Big-Stack Leverage: Weaponizing Cover

### The worked leverage example
Four players, payouts **$40,000 / $28,000 / $18,000 / $14,000** ($100k pool). Blinds 100k/200k. Stacks:

| Player | Chips | bb | Chip share |
|---|---|---|---|
| A (big stack) | 10,000,000 | 50bb | 50% |
| B (mid) | 4,000,000 | 20bb | 20% |
| C (mid) | 4,000,000 | 20bb | 20% |
| D (short) | 2,000,000 | 10bb | 10% |

A open-jams, covering everyone. What does B need to call off 20bb? Full Malmuth–Harville numbers (dead money ignored for clarity):

- B's current ICM equity: **$24,243**
- B calls and wins (B → 8M, A → 6M): **$29,648** → gain = **$5,405**
- B calls and loses (busts 4th, $14,000): loss = **$10,243**
- Bubble factor = 10,243 ÷ 5,405 = **1.90** → required equity = 1.90 ÷ 2.90 ≈ **65.5%**

Against a wide 35–40% jamming range, roughly only **QQ+** clears 65%. **JJ (~64%)** is borderline. **AKo (~58–60%)** — a trivial chip-EV snap-call — is a clear $EV fold. This single number explains most "shocking" final-table folds you see on streams.

### Why the big stack gets to do this
- A risks chips but **cannot bust**. A's downside to jamming into B is losing 4M of a 10M stack — painful in chips, mild in $ because big-stack chips are the cheapest chips at the table (diminishing marginal value works in A's favor here).
- Every covered opponent plays against a ~55–70% calling threshold while A plays against ~50%. A is effectively freerolling the difference on every confrontation.

### Target selection
- **Best targets: mid stacks you cover.** They have the most $ equity to lose (real ladder position, real bust risk) and the highest bubble factors. B and C above must fold almost everything.
- **The presence of a short stack multiplies your leverage.** D's 10bb stack means B and C are one ladder rung from +$4,000 for doing nothing; their incentive to wait inflates their folding frequency even further.
- **Worst target: the other big stack.** Against the only player who covers you (or matches you), your own risk premium appears and the leverage evaporates. Big-stack-vs-big-stack wars are how chip leads die.
- **Micro stacks: attack their blinds relentlessly, but call their jams correctly.** Calling a 4bb jam is cheap; doubling them up matters little. But do not spew 15bb "courtesy calls" to mid stacks — every unnecessary double-up shrinks the set of players you cover, and cover is the asset.

> Big-stack strategy in one line: apply maximum pressure on the players with the most to lose, and avoid volume against the one player who can hurt you. Your chips are worth less per unit than anyone else's — spend them.

@check In the worked 4-player example, mid stack B needed roughly what equity to call the big stack's 20bb shove? | About 65% | Exactly 50% | About 40%
@check The best primary target for big-stack aggression is usually... | Mid stacks you cover that are trying to ladder | The other big stack | Only the shortest stack's big blind
@check Carelessly doubling up shorter stacks hurts the big stack because... | It shrinks the set of players you cover and cuts your fold-equity leverage | It increases the total prize pool | It resets the blind level

## Chapter 4 — Short and Mid Stacks: Push-Fold, Survival, and Laddering

### Push-fold is a solved baseline
Below roughly **10–12bb**, open-raising and folding to a jam torches EV; the game reduces to jam-or-fold, and unexploitable (Nash) ranges exist. Approximate chip-EV Nash equilibrium, blind vs blind:

| Effective stack | SB jam range (~% of hands) | BB call range (~% of hands) |
|---|---|---|
| 5bb | ~85–100% (close to any two) | ~55–60% |
| 8bb | ~65% | ~45% |
| 10bb | ~55–60% | ~35–40% |
| 15bb | ~40–45% | ~25–30% |
| 20bb | ~30–35% | ~18–22% |

Approximate chip-EV open-jam ranges at ~10bb, 8-max final table:

| Position | Approx. jam range | ~% of hands |
|---|---|---|
| UTG | 66+, A9s+, AJo+, KQs | ~10% |
| HJ | 44+, A5s+, ATo+, KJs+, KQo | ~14% |
| CO | 22+, A2s+, A8o+, KTs+, KJo+, QJs | ~20% |
| BTN | 22+, A2s+, A4o+, K7s+, KTo+, Q9s+, QTo, JTs | ~30% |
| SB | 22+, any Ax, K2s+, K8o+, Q5s+, Q9o+, J7s+, T7s+, 98s | ~45% |

These are **chip-EV baselines**. The ICM overlay from Chapter 2 then applies: your jamming ranges tighten moderately (you are still risking your tournament life), and your calling ranges tighten severely. In practice at a final table, drop the bottom ~20–30% of these jamming ranges when covered players still act behind you, and tighten calls by your full risk premium.

### Laddering: when folding everything is the play
Four left, payouts $40,000 / $28,000 / $18,000 / $14,000. You have **8bb**; a micro stack has **1.2bb and posts the big blind next hand**.

- Your bust-now floor: $14,000. If the micro busts first, your floor becomes $18,000 — a **+$4,000** pay jump you collect with near-certainty within a couple of hands by folding.
- You pick up A7o in the small blind. At 8bb this is a trivially +chip-EV jam (well inside every chart above). But the jam risks your entire ladder position to win ~1.5bb of dead money — worth on the order of $1,000–1,500 in $EV — while a lost flip forfeits the ~$4,000 jump plus everything above it. The risk premium makes A7o, K9s, and similar hands **clear folds**. Premium hands (roughly 99+, AQ+) still jam.

### When laddering is wrong
Survival is a means, not the goal. The counter-cases:

- **Top-heavy structures:** when first place dominates (e.g., $50k/$25k/$15k/$10k), pay jumps below the top are small and chip accumulation drives $EV. Nitting from 8bb down to 3bb destroys more equity than one lost flip.
- **No micro stack in sight:** if stacks are 40bb/22bb/8bb/20bb and nobody is blinding out, there is no imminent jump to protect. Blinding down while "waiting" is pure equity bleed — your 8bb stack loses fold equity below ~5bb and your jams stop working.
- **The mid-stack trap ("ICM prison"):** as a mid stack between big stacks, over-folding is often correct — but only against players who cover you. Keep attacking the stacks **you** cover; abdicating those spots hands your equity to the big stack.

> Ladder when a specific, near-term pay jump is being handed to you. Accumulate when it is not. The question is never "how do I survive?" — it is "which action maximizes my $EV given who can bust before me?"

@check At roughly what stack depth does open-jamming become the default preflop tool? | Around 10-12bb and below | Around 40bb | Only under 2bb
@check With 8bb and a 1.2bb micro stack about to post the big blind, marginal chip-EV jams like A7o become... | Folds — the near-locked pay jump outweighs stealing 1.5bb | Even stronger jams | Min-raise bluffs
@check Under ICM pressure, which ranges tighten the most? | Calling ranges | Jamming ranges | Limping ranges

## Chapter 5 — A Worked ICM Example, Every Number Shown

### The state
Three players. Payouts **$50,000 / $30,000 / $20,000**. Stacks: **A = 5,000,000, B = 3,000,000, C = 2,000,000** (total 10,000,000).

### Step 1 — Probability of finishing 1st (chip share)
- P(A 1st) = 5/10 = **0.500**, P(B 1st) = **0.300**, P(C 1st) = **0.200**

### Step 2 — Probability of finishing 2nd (Malmuth–Harville)
Remove each possible winner; take the player's share of remaining chips; weight by that winner's probability.

- P(C 2nd) = P(A 1st)·(2/5) + P(B 1st)·(2/7) = 0.500·0.400 + 0.300·0.286 = **0.286**
- P(B 2nd) = 0.500·(3/5) + 0.200·(3/8) = 0.300 + 0.075 = **0.375**
- P(A 2nd) = 0.300·(5/7) + 0.200·(5/8) = 0.214 + 0.125 = **0.339**

### Step 3 — Probability of 3rd, then ICM equity
P(3rd) = 1 − P(1st) − P(2nd). Then EV = Σ P(finish) × prize:

| Player | P(1st) | P(2nd) | P(3rd) | ICM equity |
|---|---|---|---|---|
| A | 0.500 | 0.339 | 0.161 | 0.500·50,000 + 0.339·30,000 + 0.161·20,000 = **$38,393** |
| B | 0.300 | 0.375 | 0.325 | 15,000 + 11,250 + 6,500 = **$32,750** |
| C | 0.200 | 0.286 | 0.514 | 10,000 + 8,571 + 10,286 = **$28,857** |

Sum = $100,000 (ICM always conserves the pool). Note C's 20% of chips priced at 28.9% of the money — the ladder floor at work.

### Step 4 — A real decision priced in dollars
B open-jams; C must decide for his full 2,000,000 (dead money ignored to isolate the ICM effect — in practice blinds/antes lower the threshold slightly).

- **Fold:** C keeps ≈ **$28,857**
- **Call and lose:** C busts 3rd → **$20,000**
- **Call and win:** stacks become A 5M / C 4M / B 1M. Rerun ICM for C: P(1st) = 0.400; P(2nd) = 0.500·(4/5) + 0.100·(4/9) = 0.444; P(3rd) = 0.156 → EV = 20,000 + 13,333 + 3,111 = **$36,444**

Break-even win probability w: w·36,444 + (1−w)·20,000 = 28,857 → w = 8,857 ÷ 16,444 = **53.9%**

- Chip-EV threshold: **50%**. ICM threshold: **53.9%**. The **3.9-point gap is C's risk premium** (bubble factor = 8,857 ÷ 7,587 = 1.17).
- Against a 40% jamming range from B: **KQs (~52–53%)** and small pairs like **55–66 (~51–52%)** are +chip-EV calls that become **$EV folds**. **88+, AT+ (~56%+)** remain calls.
- With four or more players and a micro stack present, this same premium routinely reaches 10–15+ points (Chapter 3's example demanded 65.5%).

> Do this calculation by hand once in your life, then trust the tools (ICMIZER, HRC, GTO trainers) forever. The point of the manual pass is that risk premium stops feeling like a chart and starts feeling like money.

@check In the worked example, C's break-even calling equity was 53.9% instead of 50%. The 3.9-point difference is the... | ICM risk premium | Rake adjustment | Pot-odds discount
@check C folding KQs (roughly 52-53% equity vs B's 40% jamming range) is correct because... | Its equity is below the 53.9% $EV threshold even though the call is +chip-EV | KQs is a raw-equity underdog against that range | Suited hands perform poorly all-in
@check C held 20% of the chips but 28.9% of the money equity. Why? | The guaranteed third-place floor props up short-stack $ equity | ICM rewards tighter players | The model overweights suited hands

## Chapter 6 — Final-Table Deals: Chip-Chop vs ICM

### The setup
Deals redistribute the **remaining** prize pool by agreement (often the venue requires unanimity and may hold back an amount to play for). Three players, stacks **5M / 3M / 2M**, remaining payouts **$40,000 / $32,000 / $28,000** ($100,000).

### Method 1 — Pure proportional chip-chop
Everyone takes their chip share of the pool: A = $50,000, B = $30,000, C = $20,000.

Two fatal flaws, visible immediately:
- A receives **$50,000 — more than the $40,000 first prize**. No sequence of results could ever pay A that much. 
- C receives **$20,000 — less than the $28,000 third-place guarantee**. C should refuse instantly.

Pure proportional chip counts as if the tournament were winner-take-all. It is structurally biased toward big stacks and can produce impossible numbers.

### Method 2 — Standard chip-chop ("guarantee + proportional remainder")
Each player first receives the next guaranteed payout ($28,000 × 3 = $84,000); the remaining $16,000 splits by chip share.

### Method 3 — ICM deal
Each player receives exactly their Malmuth–Harville equity (same math as Chapter 5, run on $40k/$32k/$28k).

| Player | Chips | Chip-chop (M2) | ICM deal | Chip-chop vs ICM |
|---|---|---|---|---|
| A (5M) | 50% | $36,000 | **$35,357** | **+$643** |
| B (3M) | 30% | $32,800 | **$33,100** | −$300 |
| C (2M) | 20% | $31,200 | **$31,543** | −$343 |

The pattern is universal, not specific to this example: **every chip-chop variant overpays the big stack and underpays everyone else relative to ICM**, because chip-chop prices chips linearly and ICM does not.

### Negotiation guidance (objective, not tricks)
- **Know your ICM number before anyone speaks.** It is the model-fair baseline; compute it yourself (any ICM calculator, or by hand as in Chapter 5). Never negotiate against a number you haven't verified — arithmetic errors at deal time are common and expensive.
- **As a big stack:** propose chip-chop; it is your best defensible framing. Accepting straight ICM is still often fine — you also buy out variance and the risk of coolers.
- **As a short or mid stack:** insist on ICM as the starting point. Any chip-chop proposal costs you money by construction; the burden is on the big stack to explain why you should pay it.
- **Legitimate reasons to deviate from ICM:** a genuine skill edge (a strong player can decline deals or demand ICM-plus), extreme payout jumps relative to bankroll (risk aversion has real utility value — taking slightly below ICM to lock life-changing money is defensible, not a leak), position/blind context that raw ICM ignores (a 5bb stack posting the big blind next hand is worth slightly less than snapshot ICM says — FGS-style thinking applies to deals too).
- **Sanity checks before signing:** the numbers must sum to the remaining pool, nobody may receive more than first place or less than the current guaranteed floor, and any held-back amount to play for should be priced into your comparison.

> At deal time you are no longer playing poker; you are pricing an asset. ICM is the fair market price of your stack. Know it, anchor on it, and make anyone who wants you to accept less show their math.

@check A pure proportional chip-chop gave the 50% stack $50,000 when first prize was $40,000. What does this demonstrate? | Chip-chop can award more than first place and is structurally biased toward big stacks | The prize pool was miscalculated | Proportional deals are only valid heads-up
@check Compared with an ICM deal, a chip-chop deal systematically favors... | The big stack | The short stack | Nobody — the two methods always match
@check Before accepting any final-table deal you should... | Independently compute your ICM equity and treat it as your baseline | Accept whatever number the floor announces | Hold out for exactly first-place money

# The Bubble

## Chapter 1 — Chips Are Not Cash: ICM and the Bubble Factor

### Why the bubble changes everything
Deep in a tournament, a chip you win is worth less than a chip you lose. This asymmetry — invisible in cash games — peaks on the money bubble, and every correct bubble decision flows from quantifying it. The tool is the **Independent Chip Model (ICM)**.

- ICM (Malmuth–Harville) converts stack sizes into finish-position probabilities: your chance of 1st equals your share of chips in play; 2nd and lower are computed by removing each possible winner and repeating.
- Multiply those probabilities by the payout ladder and you get your stack's **$EV** — what your position is worth in prize money right now.
- Chip-EV and $EV diverge because payouts are top-heavy: doubling your stack never doubles your $EV, but busting always sets it to zero.

### A worked example
Four players remain in a $100 sit-and-go paying 50/30/20. Stacks are equal, blinds negligible.

| Situation | Your ICM $EV |
|---|---|
| 4 equal stacks (25% of chips each) | $25.00 |
| You double through an opponent (50% of chips) | $38.33 |
| You bust on the bubble | $0.00 |

- Calling an all-in flip risks **$25.00** of equity to win only **$13.33**.
- Break-even equity = 25 / 38.33 = **65.2%** — not 50%. Even QQ vs AKo (~57%) is a clear fold for your stack here.

### Bubble factor and risk premium
- **Bubble factor (BF)** = $EV you lose by losing an all-in ÷ $EV you gain by winning it. Above: 25 / 13.33 ≈ **1.9**.
- Required equity for an even-money all-in = **BF / (BF + 1)**. BF 1.5 → 60%; BF 2.0 → 66.7%.
- **Risk premium** = required equity minus chip-EV required equity. A 15% risk premium means a spot that needs 50% in chips needs 65% in dollars.

| Situation | Typical BF | Equity needed for a stack-off |
|---|---|---|
| Early MTT, far from money | 1.00–1.10 | 50–52% |
| Money bubble, average vs average stack | 1.3–1.5 | 57–60% |
| Money bubble, medium stack vs chip leader | 1.8–2.5 | 64–71% |
| Money bubble, shortest stack vs another short | 1.1–1.3 | 52–57% |
| Satellite bubble near a locked seat | 5 to effectively infinite | 83–100% |

> Memorize the direction, not just the numbers: **your bubble factor is highest against the one player who covers you by the most, and lowest against the player you cover by the most.** The same hand can be a snap-call vs one stack and a clear fold vs another.

### What ICM does not know
- ICM ignores position, blinds, and skill. Future Game Simulation (FGS) partly corrects for who pays the next blinds; solvers use it for short-stack accuracy.
- ICM says nothing about hand quality — it prices risk. Your job at the table is combining its risk premium with ranges.

@check In a 4-handed SNG paying 50/30/20 with equal stacks, roughly what equity do you need to profitably call an all-in flip for your stack? | About 65% | Exactly 50% | About 55%
@check What does a bubble factor of 2.0 mean? | Losing an all-in costs twice as much $EV as winning it gains | Your stack is worth twice its chip-proportional share | You should play twice as many hands as normal
@check ICM converts stack sizes into what? | Finish-position probabilities, then prize-money $EV | The expected number of hands until elimination | A measure of your skill edge per blind level

## Chapter 2 — Exploiting the Scared: Attacking the Overfolders

### The core exploit
On the bubble, correct ICM play forces everyone to defend tighter — and most humans overshoot it badly, folding far more than even ICM demands. Aggression against overfolders is where bubble profit lives.

### Steal math that prints
- A 2.2bb open into 2.5bb of blinds and antes needs ~**47%** total folds to break even with zero postflop equity (2.2 / 4.7). Since you realize equity when called, the real bar is nearer **35–40%**.
- If the SB folds 80% and the BB folds 80%, you get both folds **64%** of the time — any two cards profit before you ever see a flop.
- Use the smallest size that gets folds: 2–2.2bb. Risking 3bb to win the same 2.5bb is burning leverage.

### Target selection
| Your stack | Their stack | Pressure level |
|---|---|---|
| Big | Medium (you cover) | Maximum — their BF vs you is 2+ |
| Big | Short (5–12bb) | Moderate — they can rejam wide and correctly |
| Medium | Medium | Selective — mutual destruction, both BFs high |
| Medium | Big (covers you) | Minimal — you are the target, not them |
| Short | Any | Shove/fold only — see Chapter 4 |

- Attack the **tight medium stacks you cover**: they have the most $EV to protect and the least ability to fight back.
- Do not attack the shortest stacks with raise-folds: a 7bb stack's correct response to your open is jamming a wide range you must often fold to.
- Skip the stations. A player who has already called off light on this bubble gets value bets, not bluffs.

### Three-bet leverage
- Versus a ~25% cutoff open from a covered medium stack: 3-bet to ~5.5bb into a ~4.7bb pot. You need ~54% folds ignoring postflop; realistic bubble opponents fold **75–80%** because continuing risks their tournament life.
- Their continue range collapses toward the top 4–6% (99+/AQ+ or tighter), so your 3-bets need almost no showdown value. Blockers (Ax, Kx) are a bonus, not a requirement.
- Flat-calling as a medium stack is the worst line on the bubble — it invites squeezes and bloats pots you cannot stack off in. 3-bet or fold.

### Postflop pressure
- C-bet small (25–33% pot) at very high frequency versus capped, scared ranges — the same ICM asymmetry that folds them preflop folds them on flops.
- Double-barrel cards that favor your range (aces, kings, broadway turns). Overfolders give up on exactly these.

> The exploit fails against the wrong customer. Before ramping to any-two aggression, verify the fold: has this player actually surrendered blinds, opens, or c-bets this level? One live tell of tightness (open-folding the SB, showing a folded hand) is worth more than an hour of assumptions.

@check A 2.2bb open into 2.5bb of blinds and antes needs roughly what fold frequency to break even with zero postflop equity? | About 47% | About 65% | About 25%
@check Who is the best steal target on the money bubble? | A tight medium stack that you cover | The shortest stack at the table | Another big stack with position on you
@check Why do 3-bet bluffs gain value on the bubble? | Opponents' continue ranges shrink because playing back risks their tournament life | Pot odds improve automatically postflop | ICM increases the size of the pots your bluffs win

## Chapter 3 — The Big-Stack Bully

### Cover is the weapon
Being chip leader on the bubble is not about having chips — it is about the fact that **you can bust everyone and no one can bust you**. Every covered opponent plays against you with a bubble factor of roughly 1.8–2.5 while yours against them can be as low as 1.05–1.2. You are playing near chip-EV; they are playing with a 15–20% equity handicap. Exploit the gap relentlessly.

### Frequencies and sizes
- Open **40–55%** of hands from the cutoff and button, 2–2.2bb. Against tight blinds, expand toward any-two on the button.
- 3-bet covered mediums liberally (Chapter 2 math applies with even more force — your BF vs them is minimal).
- Attack every limped pot and every blind-vs-blind spot where you cover both players.
- Keep pots small without the goods: bully with raises and small bets, not giant bluffs. Your edge is frequency, not pot size.

### Calling shoves: two different games
- **Versus micro stacks (≤10bb):** the risk is a tiny fraction of your stack, so your bubble factor is near 1 — call close to chip-EV pot odds. A 8bb jam offering 35% pot odds is a call with any hand holding ~40%+ vs their range.
- **Versus real stacks (20bb+):** the dent is real and their bubble-tight jamming range is brutal. Example: you open the button, a tight 25bb medium jams. Their range is ~QQ+/AK; AK has only ~40% against it and you need ~50%+ after even a modest risk premium. **Fold AK, continue KK+.**

### The one fight to avoid
- Never play a big pot against the **second-biggest stack** without a premium. Big-stack-vs-big-stack carries the highest mutual bubble factor at the table, and losing it converts you from bully to target in one hand.
- Corollary: two big stacks at one table should implicitly stay out of each other's way and farm the mediums. The solver reaches the same conclusion without any collusion — the ranges just tighten drastically head-to-head.

### Operational notes
- Hand-for-hand play removes your ability to run over multiple hands per level — tighten slightly, because every all-in at any table can end the bubble and your exploit window.
- Watch for the fed-up medium: after you steal from the same player 3–4 orbits running, their rejam range widens whether ICM likes it or not. Rotate targets.
- Do not spew back what you win. A 70bb stack open-folding 88 to a 24bb jam is fine; the whole strategy relies on staying the cover.

> The bully strategy has an expiry date: the instant the bubble bursts, everyone's risk premium collapses and yesterday's overfolders start calling. Bank the chips during the bubble; downshift the any-two aggression immediately after it.

@check As the chip leader on the bubble, which confrontation should you avoid most? | A big pot against the second-biggest stack without a premium | Calling a 7bb jam with pocket sixes | Opening 45% of buttons against tight blinds
@check Why can a huge stack call short-stack shoves close to chip-EV? | The risk is a small fraction of its stack, so its bubble factor is near 1 | Short stacks only jam premium hands | ICM does not apply to the chip leader
@check You open the button as chip leader and a tight 25bb medium stack jams. With AK the standard play is? | Fold — you have about 40% vs QQ+/AK but need 50%+ after the risk premium | Call — AK dominates their jamming range | Call — chip leaders should never fold to covered stacks

## Chapter 4 — Short and Medium Stacks: Survival vs. Picking a Spot

### The asymmetry nobody talks about
The shortest stack at the table has the **lowest** bubble factor — it has the least $EV left to lose. That means the micro stack is, counterintuitively, the most entitled to gamble: its jam ranges stay close to pure Nash while everyone else tightens. Pure survival mode is usually a leak; the real skill is knowing which of the two modes you are in.

### Mode 1: Pick a spot (default)
You are 5–15bb with no shorter stack about to blind out.

- **First-in or fold.** Below ~12bb, open-jamming or folding beats raise-folding in almost every seat. Limping exists only in solver-approved SB spots.
- The gap principle on steroids: **jamming ranges shrink a little under ICM; calling ranges shrink a lot**, because the jammer keeps fold equity and the caller has none. Shove wider than feels comfortable; call tighter than feels reasonable.
- Illustrative 8bb open-jam ranges on a money bubble (HRC-style output; exact ranges shift with the stack distribution):

| Position | ~Nash, no ICM | Typical money-bubble ICM |
|---|---|---|
| SB | ~58% (22+, any A, any K, Q2s+/Q5o+, J3s+/J7o+, T5s+/T8o+) | ~38% (22+, any A, K4s+/K9o+, Q8s+/QTo+, J9s+/JTo, T9s) |
| BTN | ~40% (22+, A2+, K5s+/K9o+, Q8s+/QTo+, J8s+/JTo, T8s+, 98s) | ~26% (22+, A2s+/A7o+, K9s+/KJo+, QTs+/KQo, JTs) |
| CO | ~28% | ~18% (33+, A7s+/ATo+, KTs+/KQo, QJs) |

- Calling off is a different universe: facing a 10bb jam as a 12bb stack, hands like A9o and 66 that are trivial chip-EV calls become folds once you add a 10–15% risk premium. Continue with the top: 88+/AJs+/AQo+ vs typical jamming ranges, tighter vs nits.
- Know your clock. With a big blind ante, one orbit costs ~2.5bb. At 6bb you have roughly two orbits (~18 hands) of fold equity left; jam a wide range before it evaporates, because at 3bb even aces barely fold anyone.

### Mode 2: Survival (specific triggers only)
Switch to extreme tightness when the min-cash is nearly free:

- Another player has ≤2bb, or is all-in this hand while you can fold.
- Two other tables are all-in during hand-for-hand.
- You have 8bb+ and the 1bb stack takes the big blind next hand.

In these windows your effective bubble factor spikes: folding 77, ATs, even TT to jams can be correct for an orbit, because a near-certain ladder is worth more than a marginal gamble. The moment the trigger resolves (they bust or double), snap back to Mode 1.

### The medium-stack trap
20–35bb on the bubble is the worst seat in the house: too much to jam, too little to fight the cover, and a BF of ~2 against the big stack.

- Cut opens from late position when the chip leader is in the blinds; they should be 3-betting you relentlessly and your correct response is mostly folding.
- Prefer jam-sized 3-bets (or fold) over flats versus stacks that cover you — deny them the postflop leverage their cover buys.
- Farm the same overfolders the big stack farms, in pots the big stack is not in. Medium vs shorter-medium with position is still profitable aggression.

> Do not manufacture heroism to "make something happen." On the bubble, folding a 25bb stack for two orbits costs about 5bb; busting costs a min-cash that is often 1.5–2 buy-ins of real money. Passivity is a strategy error only when it has no trigger — with a 1bb stack at your table, it is the play.

@check Why can the shortest stack still jam wide on the money bubble? | It has the least $EV to lose, so its bubble factor is the lowest at the table | Short stacks always have the most fold equity | Antes fully compensate short stacks for the risk
@check Under ICM pressure, which range tightens more? | Calling ranges — the caller has no fold equity | Jamming ranges — the jammer risks elimination | Both tighten by the same amount
@check Another player at your table is down to 1bb. How should this change your marginal all-in decisions? | Tighten sharply — their likely bust lets you ladder into the money at no risk | No change — always play pure chip-EV | Loosen up — chips matter more right before the bubble bursts

## Chapter 5 — Satellite Bubbles: Survival Is Everything

### A different game entirely
In a satellite, 1st place and last-seat place pay identically. Once payouts are flat, chips have value only insofar as they change your **probability of winning a seat** — and past a certain stack, that probability is 1 and every additional chip is worth exactly nothing.

- **Mathematical lock:** with total chips T and S seats, any stack **greater than T ÷ S** guarantees a seat — it is impossible for S players to all finish above you. Example: 10 seats, 1,000,000 chips in play → more than 100,000 locks it.
- **Practical near-lock:** you rarely need the strict lock. If shorter stacks will blind out before the blinds threaten you, 60–70% of T/S often carries a 95%+ seat probability. Count orbits, not just chips.

### The fold-aces proof
11 players, 10 seats, all stacks roughly equal. An opponent open-jams; you look down at AA (~85% vs even a random hand).

- Fold: 10 of 11 equal stacks win seats → your seat equity is ~**90.9%**, and it rises every time anyone else clashes.
- Call: 85% of the time you win and lock a seat (~100%); 15% of the time you get **0%**. EV ≈ **85%**.
- 85% < 90.9%. **Folding aces is correct**, and it is not close. Your bubble factor here is about 10: you risk ~91 points of seat equity to gain at most ~9.

> The satellite question is never "am I ahead?" It is "does this all-in raise my probability of a seat?" With a near-lock, no hand — not AA — raises a number that is already ~1.

### Calling ranges collapse, jamming survives longer
- **Calling** an all-in that covers you is the first thing to disappear. Rough guide by current seat probability:

| Your P(seat) if you fold | Calling range vs a covering jam |
|---|---|
| ~50% (true coin-flip stack) | Near chip-EV, slightly tight |
| ~75% | ~KK+ only |
| ~90% | Fold everything, including AA |
| Locked (stack > T/S) | Fold literally 100% of hands |

- **Jamming** retains value only while you actually need chips: if blinds will drop your P(seat) below the pack before shorter stacks die, open-jam wide into players who cannot correctly call you (their calling ranges are collapsing too — often harder than yours). A 6bb stack with three 3bb stacks behind should still often fold; a 6bb stack that is the table's shortest must attack now.
- Blind-vs-blind unopened pots you would auto-jam on a money bubble become folds the moment your seat probability is high. Walk math changes: surrendering 1.5bb per orbit is trivial when three players are on fumes.

### The satellite bubble checklist
- Count **seats remaining vs players remaining** every hand; recompute your P(seat) after every bust.
- Rank all stacks. Your real opponents are only the 2–3 stacks nearest yours; everyone else is scenery.
- Count the shortest stacks' orbits to blind-out. If two of them die of natural causes before you post twice, you need zero more chips.
- Never call off a covering stack without recomputing what folding is worth. The reflex "I'm priced in" is a money-tournament reflex — satellites have no prices, only seats.
- Expect deliberate slow play from others near the end (and note that intentional stalling is a rule violation in most rooms). What you can always do legally: know the level clock and plan which blinds you will and will not survive.
- The reverse exploit exists too: with the covering stack, jam relentlessly into locked and near-locked players — they are correctly folding almost everything, so every hand you steal is nearly risk-free.

@check 11 players remain for 10 identical seats with equal stacks. An opponent jams and you hold AA (about 85% equity). The correct play is? | Fold — folding keeps about 91% seat equity while calling offers only about 85% | Call — you should never fold aces preflop | Call — winning makes you chip leader with a guaranteed seat
@check In a 10-seat satellite with 1,000,000 total chips, what stack mathematically guarantees a seat? | More than 100,000 chips | Exactly the average stack of the field | More than 90,909 chips
@check In a satellite, what is the value of chips above the amount needed to lock a seat? | Essentially zero — every seat pays the same | Full face value, as in any tournament | About half face value due to ICM

# Deep-Stack MTT Postflop

## Chapter 1 — Deep-Stack Foundations: Chips, ICM, and Build vs Preserve

### Why 50bb+ Is a Different Game
At 50bb+ effective, most of the money goes in **postflop, across multiple streets**. Stack-to-pot ratio (SPR) is high, implied odds are real, and hand values shift: nut potential and playability beat raw hot-and-cold equity.

- At 100bb, a single-raised pot arrives at the flop with roughly **5-6bb** in the middle and **~97bb** behind — SPR ≈ **15-17**.
- Getting all-in by the river in that pot requires roughly **110% pot on all three streets**. Conclusion: when 100bb goes in after a single raise, ranges are **nutted**, not top-pair-heavy.
- A 3-bet pot (open 2.3x, 3-bet to ~10bb) arrives at SPR ≈ **4** — one pair can now be a stack-off class hand.

### ICM at Early Levels: Near Chip-EV, Not Exactly Chip-EV
The Independent Chip Model converts stacks to tournament $EV. The practical tool is the **bubble factor**: the ratio of $ lost when you lose chips to $ gained when you win the same chips. Required equity for a full-stack all-in = **B / (B + 1)**.

| Stage | Typical bubble factor B | Equity needed for a 0-EV chip flip |
|---|---|---|
| Levels 1-4, deep | 1.02 - 1.10 | 50.5% - 52.4% |
| Mid-tournament | 1.2 - 1.4 | 54.5% - 58.3% |
| Stone bubble, medium stack | 1.8 - 2.5 | 64.3% - 71.4% |

- Early, chips won are worth **almost** as much as chips lost. Play close to chip-EV; do not "nit up to survive."
- The small tax is still real: a 51/49 full-stack flip at level 1 is roughly break-even in $, not +2%. Passing **razor-thin (<1-2% edge) full-stack gambles** is standard practice, especially in soft fields where your future skill edge exceeds the edge you are declining. This is a widely-accepted pro adjustment layered on top of ICM, not a license to fold clear +EV spots.

### Building vs Preserving: What Deep Stacks Actually Reward
- **Build with playability**: suited connectors, suited aces, and pocket pairs gain value — they make nutted hands that win the rare 100bb pots.
- **Set-mining rule**: call a raise with a small pair only when effective stacks are at least **15-20x the call** (you flop a set ~**11.8%** of the time and must be paid when you do).
- **Preserve by dodging dominated offsuit broadways** (KJo, QTo from early seats) — they make expensive second-best top pairs at high SPR.

### Standard Preflop Sizing, 50-100bb
| Action | Size |
|---|---|
| Open raise | 2.2x - 2.5x (+~1bb per limper when isolating) |
| 3-bet in position | ~3x the open |
| 3-bet out of position | ~4x the open |
| 4-bet | ~2.2x - 2.4x the 3-bet |

> Tip: the deeper you are, the more your preflop hand selection should be driven by "what does this hand look like when 100bb goes in?" — not by its all-in equity against one hand.

@check At 100bb with a bubble factor of 1.05, what equity does a full-stack all-in need to break even in $EV? | About 51% | Exactly 50% | About 60%
@check What is the standard implied-odds requirement for set-mining a small pair deep? | Effective stacks at least 15-20x the call | Effective stacks at least 5x the call | Any call under 3bb is automatic
@check Why does "chip preservation" not justify folding clearly +EV spots at level 1? | Early bubble factors are near 1.0, so chips won are worth almost as much as chips lost | Rebuys make early chips worthless | ICM only applies at the final table

## Chapter 2 — Single-Raised Pots: Range Advantage, Texture, and C-Bet Sizing

### Range Advantage vs Nut Advantage
- **Range advantage**: whose whole range has more equity on this board. Drives **frequency** — the bigger your range edge, the more often you can bet.
- **Nut advantage**: who holds more of the strongest hands (sets, overpairs, nut straights). Drives **size** — nut advantage lets you play big bets and stack-off lines.
- As the preflop raiser you usually have the range edge on **A-high and K-high dry boards** (all the AK/AQ/overpairs). The caller gains on **middling connected boards** (T98, 876) that smash suited connectors and middle pairs.

### Texture Map for C-Betting vs the Big Blind (100bb, single-raised)
| Texture | Example | Edge | C-bet frequency | Size |
|---|---|---|---|---|
| Dry A-high | A72r | Raiser, large | High (70-90%) | 25-33% pot |
| Dry K/Q-high | K83r | Raiser | High (65-80%) | 25-33% pot |
| Low paired | 663r | Roughly neutral, raiser nut edge | High | 25-33% pot |
| Middling connected | T98 two-tone | Caller | Low (35-50%) | 66-75% pot, polarized |
| Low connected | 654 two-tone | Caller | Low | 66-75% pot or check |
| Monotone | Kh 9h 4h | Mixed | Moderate | Small (25-40%) |

- **Small range bets** on dry boards tax the caller's whole range cheaply; almost your entire range can bet.
- **Big polarized bets** on wet boards use strong hands plus draws; medium hands check for pot control.

### The Math Behind Sizing: MDF and Bluff Break-Even
| Bet size (pot %) | Bluff needs folds (alpha) | Defender's MDF |
|---|---|---|
| 33% | 25% | 75% |
| 50% | 33% | 67% |
| 66% | 40% | 60% |
| 100% | 50% | 50% |
| 150% | 60% | 40% |

- A 33% pot c-bet only needs to work **25%** of the time — this is why small bets can go in at very high frequency.
- Soft MTT fields **over-fold to large turn and river bets**; barrels realize more than their equilibrium value there.

### Barreling Logic
- Barrel turn cards that improve **your range**: overcards to the board (a K or A on T72), and cards giving your range new nut hands.
- Slow down on cards that improve the caller: middling connectors completing straights, flush completes when you hold no key blocker.

> Tip: pick the size the **board** wants, then bet the hands that fit that size. Do not pick a size hand-by-hand — that leaks information deep-stacked.

@check On A72 rainbow as the preflop raiser vs the BB, what is the standard c-bet plan? | High frequency for 25-33% pot | Low frequency for 75% pot | Always check to induce bluffs
@check Versus a 33% pot c-bet, what is the defender's minimum defense frequency? | 75% | 50% | 60%
@check Which flop most favors the BB caller's range against an UTG open? | 6-5-4 two-tone | A-K-4 rainbow | K-7-2 rainbow

## Chapter 3 — 3-Bet Pots Deep: Low SPR, High Leverage

### The SPR Reset
A 3-bet at 100bb transforms the hand: pot ~**20-22bb** at the flop, ~**89bb** behind, SPR ≈ **4**. One pair goes from "pot control hand" to "potential stack-off hand," and every street carries leverage.

| SPR at flop | Typical pot type (100bb) | Standard commitment class |
|---|---|---|
| 1 - 2 | 4-bet pot | Overpair, TPTK, strong combo draws — usually committed |
| 3 - 5 | 3-bet pot | Overpairs generally commit; TPTK is close, context-dependent |
| 6 - 10 | Big single-raised / small 3-bet very deep | Two pair or better, strong draws |
| 13+ | Standard single-raised pot | Sets, straights, flushes — nut-leaning hands only |

### Geometric Sizing: Getting 90bb In
With pot 20bb and 89bb behind, betting roughly **55-60% pot on each of three streets** grows the pot geometrically so the river bet is all-in. That is the standard value line for overpairs and better in a 3-bet pot — no awkward oversized river jam, maximum leverage on every street.

### C-Betting in 3-Bet Pots
- Ranges are tighter and closer in strength, and SPR is low, so standard c-bets shrink to **25-40% pot** at high frequency on most static boards, from the 3-bettor.
- On boards that smash the caller (middling connected), check more even as the 3-bettor.
- Because SPR is 4, a small flop bet plus a normal turn bet already sets up a river shove — you rarely need big flop sizings to be committed by the river.

### Deep 3-Bet Range Construction
- **Value**: QQ+, AK as the core; add JJ/AQs as depth and position allow.
- **Bluffs**: suited wheel aces (**A5s-A2s**) and suited broadway/connector hands (KJs, T9s type) — they block premium continues, make nut hands, and play well at SPR 4.
- Versus opens, prefer **linear** (merged) 3-bets from the blinds facing late-position steals, **polarized** 3-bets in position against strong opening ranges.
- 4-bet pots: SPR ~**1.5-2**. With an overpair, the standard line is to get the money in; folding an overpair at SPR 1.5 is burning equity against any normal range.

> Tip: before you 3-bet deep, decide your plan versus a 4-bet. At 100bb, 3-bet/calling with A5s is a punt; 3-bet/folding it is fine because it loses so little when raised.

@check In a 100bb 3-bet pot with SPR about 4, roughly what per-street sizing gets stacks in by the river? | About 55-60% pot on each of three streets | Full pot on each street | 25% pot on each street
@check At SPR 1.5-2 in a 4-bet pot, how should an overpair usually play? | Commit — get the stacks in | Pot control and fold to pressure | Check-fold the flop
@check Which hand is a standard deep-stack 3-bet bluff candidate? | A5 suited | Q9 offsuit | 7-2 suited

## Chapter 4 — Position: The Deep-Stack Multiplier

### Equity Realization
Raw equity is not the money you win — **realized** equity is. Position is the biggest realization lever, and its value scales with stack depth because deeper stacks mean more streets and bigger decisions.

- The BB defending versus a BTN open realizes roughly **85%** of its raw equity; the BTN in position realizes **over 100%**.
- Out of position you face bets with capped information; in position you close action, take free cards, and size the pot on your terms.
- This is why every standard chart opens tighter early and wider late.

### Standard Open Frequencies at 50-100bb (8/9-handed, approximate)
| Position | Opening range |
|---|---|
| UTG | ~15% |
| LJ / MP | ~18-20% |
| HJ | ~22% |
| CO | ~27-30% |
| BTN | ~42-48% |
| SB (raise-first-in) | ~35-45% |

### Fighting Back From Out of Position
- **Check-raise the flop** versus small range-bets: on dry boards the BB check-raises ~**10-15%** (sets, two pair, strong draws, some backdoor bluffs); on connected boards that favor the caller, more. Raise small c-bets to ~**3.5-4x** the bet, larger c-bets to ~**2.5-3x**.
- **Probe bet**: when the in-position player checks back the flop, bet the turn OOP at high frequency on cards that favor your range — their check-back capped their hand.
- **Donk-lead rarely**: only on boards that dramatically favor the caller (e.g., 6-5-4 versus an UTG range). Default is check-to-the-raiser.

### In-Position Weapons
- **Delayed c-bet**: check back marginal hands and air on the flop, bet turn when checked to — attacks the capped check-check node.
- **Float**: call flop c-bets with backdoor equity and position, take the pot on turn/river checks.
- Deep, position lets you play thinner value bets and wider bluff-catches because you act last on the expensive streets.

> Tip: at 100bb the button is worth more than any two cards. The same hand (say KQo) is a clear open on the BTN, a mix in the HJ, and a fold UTG — the cards did not change, the realization did.

@check Roughly what share of its raw equity does the BB realize when defending versus a BTN open? | About 85% | About 100% | About 60%
@check What is a probe bet? | A turn bet from out of position after the in-position player checked back the flop | A flop lead into the preflop raiser | A river overbet with the nuts
@check Why can you play far more hands on the button than UTG at 100bb? | Position lets you over-realize equity across all postflop streets | The button pays no ante | Ranges are always stronger out of position

## Chapter 5 — Multiway Pots: The Soft-Field Specialty

### Why They Happen and What Changes
Soft MTT fields limp and over-call, so 3-way and 4-way flops are routine. Two forces reshape everything:

- **Equity dilution** — every hand's equity drops as players are added:

| AA all-in vs random hands | Approximate equity |
|---|---|
| 1 opponent | ~85% |
| 2 opponents | ~73% |
| 3 opponents | ~64% |
| 4 opponents | ~56% |

- **Fold equity multiplies down** — a bluff must get through everyone. If two players each fold 60%, the bluff succeeds 0.6 × 0.6 = **36%**. Against three, 22%.

### Core Multiway Adjustments
| Lever | Heads-up default | Multiway adjustment |
|---|---|---|
| C-bet frequency | 60-75% on good textures | Roughly halves per extra player (~30-35% 3-way, ~20% 4-way) |
| Bluffing | Balanced, frequent | Sharply reduced; bluff mainly with strong draws |
| Value threshold | Top pair often 3 streets | Tighten: strong top pair+ bets, weak top pair checks |
| Bet sizing | MDF forces defense | Smaller sizes work — no single player must defend the full MDF, but hands that continue are stronger |
| Slowplaying | Rare | Rarer still — someone usually has a piece; charge draws now |

- The burden of defense is **shared**: no individual is obliged to meet MDF, so multiway calling ranges are individually tighter and collectively stronger. Bets get called by better hands more often — bluff less, value bet tighter but confidently.
- **Nut potential dominates**: sets, straights, flushes, nut draws soar in value; one-pair hands and non-nut draws (dominated flushes, low ends of straights) bleed reverse implied odds.
- Preflop consequence: pocket pairs and suited/connected hands rise; offsuit broadways fall. Over-limped pots make set-mining and suited connectors excellent because the 15-20x implied-odds bar is easy to clear with multiple payers.

### Practical Lines
- 3-way as the raiser on A72r: still c-bet, but drop from ~85% to roughly half, and value-check hands like KK more often.
- Flopped set multiway: **fast-play**. With more live draws out, protection and value now beat trapping.
- Facing multiway aggression: a bet into several players is value-heavy even in theory, and more so in soft fields — fold one-pair hands earlier than you would heads-up.

> Tip: multiway, the question is not "can I make them fold?" but "who pays me when I hit?" Play hands and lines that win big pots at showdown.

@check What is AA's approximate all-in equity against four random hands? | About 55-60% | About 85% | About 30%
@check If two opponents each fold 60% to a bluff, how often does it get through both? | 36% | 60% | 48%
@check What is the standard multiway adjustment to value betting? | Tighten thresholds — bet strong hands, check more one-pair hands | Loosen thresholds — any pair is a value bet | No change from heads-up

## Chapter 6 — Pot Control and Putting It Together

### Big Pots Need Big Hands — and Depth Raises the Bar
The average all-in range strengthens with stack depth. Recall Chapter 1: getting 100bb in after a single raise requires roughly three overbets. So when the money goes in at high SPR, standard ranges are two pair or better weighted.

| Effective depth | One-pair stack-off in a single-raised pot? |
|---|---|
| 20-30bb | Often fine (TPTK, overpairs) |
| 40-60bb | Marginal — needs a strong read or great board |
| 100bb+ | Almost never at equilibrium — you need two pair+ or a nut draw |

### Pot Control Lines With Medium Strength
- **Way-ahead/way-behind**: KK on A72 after your flop c-bet is called — check back the turn. You beat bluffs and Ax pays you little; checking keeps their worse hands in and caps the pot with your capped hand.
- **Bet-fold**: on static boards deep-stacked, one-pair value bets are bet-**folds**. In soft pools, raises versus your turn/river bets are drastically under-bluffed relative to equilibrium — this is a population read, and the widely-accepted exploit is to over-fold one pair to raises.
- **Two streets, not three**: many strong-but-not-nutted hands (TPTK, weak overpairs) maximize by betting flop and turn, then checking a blank river — extract from worse, avoid stacking off to better.
- **River raises deep = nuts** in soft MTT fields. Facing a big raise on the river at 100bb, folding every one-pair hand is the standard exploitative play, even where a solver would find some calls.

### Common Deep-Stack Leaks (and the Fix)
| Leak | Fix |
|---|---|
| Stacking off top pair at SPR 15 | Two pair+ standard; treat big aggression as nutted |
| One-size-fits-all 50% c-bet | Match size to texture (Ch. 2 map) |
| Bluffing multiway like heads-up | Halve frequency per player; bluff only strong draws |
| Calling 3-bets with dominated offsuit broadways | Fold them; defend with pairs, suited, connected |
| Slowplaying sets in limped family pots | Fast-play — charge the field |
| Paying off river raises with one pair | Bet-fold; soft pools do not bluff-raise enough |

### The Five-Question Checklist (run it every postflop street)
- What is the **SPR**, and which hand class is committed at this depth?
- Who has the **range advantage** and who has the **nut advantage** on this texture?
- Am I **in position** or out — and how does that change my realization?
- How many players — is this a **heads-up** or **multiway** framework?
- If all the money goes in, what does my opponent's line **represent** — and do I beat it?

> Tip: deep-stacked MTT poker is mostly small pots punctuated by a few huge ones. Win the small ones with position, texture, and frequency; make sure the huge ones only happen when you hold the goods.

@check At 100bb in a single-raised pot, what does an opponent's three-street all-in line usually represent? | A nutted range weighted to two pair or better | Mostly bluffs, since the pot started small | Any top pair
@check What is the classic pot-control line with KK on an A72 flop after your c-bet is called? | Check back the turn | Overbet the turn | Bet three streets for max value
@check In soft MTT pools, a big river raise into your 100bb stack is usually? | Heavily value-weighted — fold one-pair hands | Balanced like a solver | Mostly missed draws

