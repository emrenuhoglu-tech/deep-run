// Runtime correctness checks for the engine primitives. Run: npx tsx src/engine/selfcheck.ts
import { parseCard } from "./cards";
import { score7, categoryOf } from "./handEval";
import { icmEquity, icmPressure } from "./icm";
import type { Seat, Action, HandState } from "./hand";
import { startHand, legalActions, applyAction, computePots } from "./hand";
import { inShoveRange } from "./pushfold";
import { recommend, grade } from "./feedback";
import type { TournamentState } from "./tournament";
import { handsIn } from "./rangeNotation";
import { positionOf } from "./preflop";
import preflopCharts from "../content/preflop_charts.json";
import { makeSpot, CONCEPTS } from "../modes/drill/spots";

let pass = 0;
let fail = 0;
function ok(cond: boolean, msg: string) {
  if (cond) pass++;
  else {
    fail++;
    console.log("FAIL:", msg);
  }
}
const h = (...cs: string[]) => score7(cs.map(parseCard));

// --- hand category ordering ---
const royal = h("As", "Ks", "Qs", "Js", "Ts", "2c", "3d");
const quads = h("Ac", "Ad", "Ah", "As", "Kd", "2c", "3d");
const boat = h("Ac", "Ad", "Ah", "Kd", "Ks", "2c", "3d");
const flush = h("As", "Ks", "9s", "5s", "2s", "3d", "4c");
const straight = h("Ac", "Kd", "Qh", "Js", "Tc", "2c", "3d");
const wheel = h("Ac", "2d", "3h", "4s", "5c", "Kd", "Qh");
const trips = h("Ac", "Ad", "Ah", "Kd", "Qs", "2c", "3d");
const twopair = h("Ac", "Ad", "Kh", "Ks", "Qs", "2c", "3d");
const pair = h("Ac", "Ad", "Kh", "Qs", "Js", "2c", "3d");
const high = h("Ac", "Kd", "Qh", "Js", "9s", "2c", "3d");

ok(royal > quads, "royal > quads");
ok(quads > boat, "quads > full house");
ok(boat > flush, "full house > flush");
ok(flush > straight, "flush > straight");
ok(straight > trips, "straight > trips");
ok(trips > twopair, "trips > two pair");
ok(twopair > pair, "two pair > pair");
ok(pair > high, "pair > high card");
ok(wheel < straight, "wheel < broadway straight");
ok(wheel > trips, "wheel is a straight (> trips)");
ok(categoryOf(royal) === 8, "royal categorized as straight flush");
ok(categoryOf(boat) === 6, "full house category");
ok(categoryOf(high) === 0, "high card category");

// kickers
ok(
  h("Ac", "Ad", "Kh", "Qs", "Js", "2c", "3d") > h("Ac", "Ad", "Kh", "Qs", "Tc", "2c", "3d"),
  "pair with J kicker beats T kicker",
);
// a flush should beat a straight that uses the same board
ok(
  h("As", "Ks", "9s", "5s", "2s", "6d", "7c") > h("Th", "Jd", "Qs", "Kd", "9c", "2s", "3h"),
  "flush > straight (mixed)",
);

// --- ICM ---
const eqEqual = icmEquity([100, 100, 100], [50, 30, 20]);
ok(Math.abs(eqEqual[0] - eqEqual[1]) < 1e-9 && Math.abs(eqEqual[1] - eqEqual[2]) < 1e-9, "equal stacks → equal ICM");
ok(Math.abs(eqEqual.reduce((a, b) => a + b, 0) - 100) < 1e-6, "ICM sums to prize pool");

const eq2 = icmEquity([50, 25, 25], [50, 30, 20]);
ok(Math.abs(eq2.reduce((a, b) => a + b, 0) - 100) < 1e-6, "ICM (uneven) sums to prize pool");
ok(eq2[0] > 33.34 && eq2[0] < 50, "chip leader: more than even share, less than top prize");
ok(eq2[0] < 50, "chip leader is ICM-taxed below chip share");
ok(eq2[1] > 25, "short stacks gain relative to chip share");
ok(icmPressure([50, 25, 25], [50, 30, 20], 0) < 0, "leader has negative ICM pressure (survival premium)");

// --- side pots ---
const mkSeat = (id: number, totalCommitted: number, folded = false): Seat => ({
  id, name: "P" + id, isHero: false, stack: 0, hole: [], folded, allIn: false,
  committed: 0, totalCommitted, hasActed: true,
});
const potsA = computePots([mkSeat(0, 100), mkSeat(1, 300), mkSeat(2, 300)]);
ok(potsA.length === 2, "two pots when one player is all-in short");
ok(potsA[0].amount === 300 && potsA[0].eligible.length === 3, "main pot 300, all eligible");
ok(potsA[1].amount === 400 && potsA[1].eligible.join() === "1,2", "side pot 400, only the two deep");
ok(potsA.reduce((a, p) => a + p.amount, 0) === 700, "pots sum to total contributions");

const potsB = computePots([mkSeat(0, 100, true), mkSeat(1, 300), mkSeat(2, 300)]);
ok(potsB[0].eligible.join() === "1,2", "folded contributor's chips stay in the pot but they can't win");
ok(potsB.reduce((a, p) => a + p.amount, 0) === 700, "folded contributor's chips still counted");

// --- full-hand chip conservation over many random hands (all-ins, side pots, showdowns) ---
function playRandomHand(): boolean {
  const N = 2 + Math.floor(Math.random() * 7); // 2..8 seats
  const stacks = Array.from({ length: N }, () => 50 + Math.floor(Math.random() * 2000));
  const total = stacks.reduce((a, b) => a + b, 0);
  const st = startHand({
    stacks, names: stacks.map((_, i) => "P" + i), heroSeat: 0,
    button: Math.floor(Math.random() * N), sb: 25, bb: 50, ante: Math.random() < 0.5 ? 10 : 0,
  });
  let guard = 0;
  while (st.street !== "complete") {
    if (++guard > 800) return false;
    const la = legalActions(st);
    const r = Math.random();
    let action: Action;
    if (!la.check && r < 0.15) action = { type: "fold" };
    else if (la.check && r < 0.5) action = { type: "check" };
    else if (la.canRaise && r < 0.35) {
      const to = la.minRaiseTo + Math.floor(Math.random() * (la.maxRaiseTo - la.minRaiseTo + 1));
      action = { type: "raise", to };
    } else action = la.check ? { type: "check" } : { type: "call" };
    applyAction(st, action);
  }
  return st.seats.reduce((a, s) => a + s.stack, 0) === total;
}
let conserved = 0;
for (let i = 0; i < 300; i++) if (playRandomHand()) conserved++;
ok(conserved === 300, `chip conservation held in all 300 random hands (got ${conserved}/300)`);

// --- push/fold Nash range membership (parser) ---
ok(inShoveRange("A2s", 10, "BTN").inRange, "10bb BTN jams A2s");
ok(!inShoveRange("72o", 10, "UTG").inRange, "10bb UTG does not jam 72o");
ok(inShoveRange("22", 8, "UTG").inRange, "8bb UTG jams 22");
ok(inShoveRange("ATo", 10, "UTG").inRange, "10bb UTG jams ATo");
ok(!inShoveRange("A5o", 10, "UTG").inRange, "10bb UTG folds A5o (ATo+ only)");
ok(inShoveRange("54s", 8, "SB").inRange, "8bb SB jams 54s");
ok(inShoveRange("AA", 15, "UTG").inRange, "15bb UTG jams AA");

// --- TIER 0 P1: antes/blinds must NOT read as a raise (they post via post(), lastAggressor stays -1) ---
const anteHand = startHand({ stacks: [1500, 1500, 1500], names: ["A", "B", "C"], heroSeat: 0, button: 0, sb: 50, bb: 100, ante: 12 });
ok(anteHand.currentBet > anteHand.bb, "ante level: currentBet exceeds bb (the old facingRaise trap)");
ok(anteHand.lastAggressor === -1, "ante level unraised pot has no aggressor (new facingRaise reads false)");

// --- board-only scoring is robust (two paired board, no side card → no Math.max([]) crash) ---
ok(categoryOf(h("As", "Ad", "7h", "7c")) === 2, "board-only AA77 scores as two pair (kicker guard)");

// --- feedback engine (TIER 0 P2/P3/P4). Build a postflop decision as a minimal TournamentState. ---
function fbSpot(o: {
  hole: [string, string];
  board: string[];
  currentBet: number;
  villCommitted?: number;
  heroStack?: number;
  bb?: number;
}): TournamentState {
  const bb = o.bb ?? 100;
  const hero: Seat = {
    id: 0, name: "You", isHero: true, stack: o.heroStack ?? 5000, hole: o.hole.map(parseCard),
    folded: false, allIn: false, committed: 0, totalCommitted: 0, hasActed: false,
  };
  const vill: Seat = {
    id: 1, name: "V", isHero: false, stack: 5000, hole: [], folded: false, allIn: false,
    committed: o.villCommitted ?? o.currentBet, totalCommitted: 0, hasActed: false,
  };
  const hand: HandState = {
    seats: [hero, vill], button: 1, board: o.board.map(parseCard), deck: [], street: "flop",
    toAct: 0, currentBet: o.currentBet, minRaise: bb, lastAggressor: 1, bb,
  };
  return { hand, heroSeat: 0, fieldRemaining: 100, paidPlaces: 15, tableSize: 8 } as unknown as TournamentState;
}

// P2/F4: overpair does not fold to a pot-sized bet, and the call is not graded a mistake.
const aaSpot = fbSpot({ hole: ["Ah", "Ad"], board: ["9c", "7d", "2s"], currentBet: 300 });
const aaRec = recommend(aaSpot)!;
ok(aaRec.bucket !== "fold", "AA overpair on 9-7-2 does not fold to a pot-sized bet");
ok(grade(aaRec, { type: "call" }).verdict !== "mistake", "calling with the AA overpair is not a mistake");
// P4/F7: over-folding a call spot IS a mistake.
ok(grade(aaRec, { type: "fold" }).verdict === "mistake", "over-folding the overpair is flagged a mistake");

// P3/F6: a board pair the hero doesn't share is not hero value.
const airRec = recommend(fbSpot({ hole: ["3c", "2d"], board: ["As", "Ad", "7h"], currentBet: 0 }))!;
ok(airRec.bucket === "check", "32o on AA7 checks — the board pair is not the hero's value");

// P4/F7: checking back a mandatory value bet IS a mistake.
const tripsRec = recommend(fbSpot({ hole: ["As", "Ah"], board: ["Ad", "7h", "2c"], currentBet: 0 }))!;
ok(tripsRec.bucket === "raise", "trips on A-7-2 wants to bet");
ok(grade(tripsRec, { type: "check" }).verdict === "mistake", "checking back a value bet is flagged a mistake");

// P1 behavioral: at an ante level with NO voluntary raise, a <=15bb hero reaches the Nash open-jam
// branch again (before the fix, currentBet=bb+ante misread this as facing a raise and it was dead).
function fbPre(hole: [string, string], heroStack: number): TournamentState {
  const bb = 100;
  const ante = 12;
  const seat = (id: number, isHero: boolean, stack: number, committed: number): Seat => ({
    id, name: isHero ? "You" : "P" + id, isHero, stack, hole: [parseCard("2c"), parseCard("3c")],
    folded: false, allIn: false, committed, totalCommitted: 0, hasActed: false,
  });
  const hero = seat(0, true, heroStack, bb + ante);
  hero.hole = hole.map(parseCard);
  const hand: HandState = {
    seats: [hero, seat(1, false, 5000, ante), seat(2, false, 5000, bb / 2 + ante)],
    button: 1, board: [], deck: [], street: "preflop", toAct: 0,
    currentBet: bb + ante, minRaise: bb, lastAggressor: -1, bb,
  };
  return { hand, heroSeat: 0, fieldRemaining: 100, paidPlaces: 15, tableSize: 8 } as unknown as TournamentState;
}
const jamRec = recommend(fbPre(["Ad", "Kd"], 850))!;
ok(jamRec.regime === "Short-stack push/fold", "ante-level unraised <=15bb reaches the push/fold branch (P1)");
ok(jamRec.bucket === "raise" && jamRec.allIn === true, "AKs at ~9bb open-jams — the Nash trainer is alive again");
ok(recommend(fbPre(["7d", "2c"], 850))!.bucket === "fold", "72o at ~9bb folds (outside any jam range)");

// --- TIER 1: range-notation parser (spans / plus / singles) ---
ok(handsIn("22+").has("AA") && handsIn("22+").has("22"), "22+ spans 22 through AA");
ok(handsIn("66-99").size === 4 && handsIn("66-99").has("77"), "pair span 66-99 → 66,77,88,99");
ok(handsIn("A5s+").has("AKs") && handsIn("A5s+").has("A5s") && !handsIn("A5s+").has("A4s"), "A5s+ climbs to AKs, excludes A4s");
ok(handsIn("A5s-A4s").has("A4s") && handsIn("A5s-A4s").has("A5s") && handsIn("A5s-A4s").size === 2, "suited span A5s-A4s");
ok(handsIn("AQo-ATo").has("AJo") && handsIn("AQo-ATo").size === 3, "offsuit span AQo-ATo → ATo,AJo,AQo");
ok(handsIn("K9s-K2s").has("K5s") && handsIn("K9s-K2s").size === 8, "suited span K9s-K2s → 8 combos");

// --- TIER 1 (PF-8): every embedded preflop range parses to a non-empty set (guards hand-authored JSON rot) ---
{
  const c = preflopCharts as {
    rfi: Record<string, Record<string, string>>;
    vs_open: Record<string, Record<string, { "3bet"?: string; call?: string }>>;
    bb_defense: Record<string, Record<string, { "3bet"?: string; call?: string }>>;
  };
  let bad = 0;
  const check = (r?: string) => { if (!r || handsIn(r).size === 0) bad++; };
  for (const d of Object.values(c.rfi)) for (const r of Object.values(d)) check(r);
  for (const grp of [c.vs_open, c.bb_defense]) for (const d of Object.values(grp)) for (const resp of Object.values(d)) { check(resp["3bet"]); check(resp.call); }
  ok(bad === 0, `all preflop ranges parse to a non-empty set (got ${bad} bad)`);
}

// --- TIER 1: position labels (8-max, button on seat 0) ---
function preSpot(o: {
  heroSeat: number; hole: [string, string]; stackBB: number;
  aggressor?: number; raiseTo?: number; jam?: boolean; finalTable?: boolean;
}): TournamentState {
  const bb = 100;
  const N = 8;
  const heroChips = Math.round(o.stackBB * bb);
  const seats: Seat[] = [];
  for (let i = 0; i < N; i++)
    seats.push({
      id: i, name: i === o.heroSeat ? "You" : "P" + i, isHero: i === o.heroSeat,
      stack: i === o.heroSeat ? heroChips : 100000,
      hole: [parseCard("2c"), parseCard("2d")], folded: false, allIn: false,
      committed: 0, totalCommitted: 0, hasActed: false,
    });
  seats[o.heroSeat].hole = o.hole.map(parseCard);
  const raised = o.aggressor != null && o.aggressor >= 0;
  const currentBet = raised ? (o.jam ? heroChips : o.raiseTo ?? 250) : bb;
  if (raised) {
    seats[o.aggressor!].committed = currentBet;
    if (o.jam) { seats[o.aggressor!].allIn = true; seats[o.aggressor!].stack = 0; }
  }
  const hand: HandState = {
    seats, button: 0, board: [], deck: [], street: "preflop", toAct: o.heroSeat,
    currentBet, minRaise: bb, lastAggressor: raised ? o.aggressor! : -1, bb,
  };
  const tSeats = seats.map((s) => ({ name: s.name, stack: s.isHero ? heroChips : 100000, isHero: s.isHero }));
  const payouts = [1000, 600, 400, 300, 200, 150, 100, 80];
  return {
    hand, heroSeat: o.heroSeat, fieldRemaining: o.finalTable ? 6 : 100, paidPlaces: 15, tableSize: N,
    seats: tSeats, payouts,
  } as unknown as TournamentState;
}
{
  const h8 = preSpot({ heroSeat: 0, hole: ["Ah", "Kd"], stackBB: 100 }).hand!;
  ok(positionOf(h8, 0) === "BTN" && positionOf(h8, 2) === "BB" && positionOf(h8, 3) === "UTG" && positionOf(h8, 7) === "CO",
    "positionOf maps seats (button=0): 0→BTN, 2→BB, 3→UTG, 7→CO");
}

// --- TIER 1: the six adversarially-confirmed misadvice spots are now graded correctly ---
ok(recommend(preSpot({ heroSeat: 0, hole: ["6c", "6d"], stackBB: 45 }))!.bucket === "raise", "66 opens on the BTN at 45bb (was: fold)");
ok(recommend(preSpot({ heroSeat: 0, hole: ["Ah", "Td"], stackBB: 60 }))!.bucket === "raise", "ATo opens on the BTN at 60bb (was: fold)");
ok(recommend(preSpot({ heroSeat: 3, hole: ["Qh", "9h"], stackBB: 100 }))!.bucket === "fold", "Q9s folds from UTG at 100bb (was: raise)");
ok(recommend(preSpot({ heroSeat: 7, hole: ["Ah", "Kd"], stackBB: 100, aggressor: 3, raiseTo: 250 }))!.bucket === "raise", "AKo 3-bets vs a UTG open (was: call)");
{
  const t9 = preSpot({ heroSeat: 2, hole: ["Tc", "9c"], stackBB: 40, aggressor: 0, raiseTo: 200 });
  const r = recommend(t9)!;
  ok(r.bucket !== "fold", "T9s does not fold in the BB vs a BTN open (was: fold + punished)");
  ok(grade(r, { type: "call" }).verdict !== "mistake", "defending T9s in the BB is not graded a mistake");
}
ok(recommend(preSpot({ heroSeat: 3, hole: ["8c", "8d"], stackBB: 30 }))!.bucket === "raise", "88 opens from UTG at 30bb (unraised)");

// --- TIER 2: short-stack call-off uses Nash ranges (was chen>=11) ---
// call_off/15/UTG = "66+, ATs+, AQo+, KQs"
ok(recommend(preSpot({ heroSeat: 2, hole: ["7c", "7d"], stackBB: 15, aggressor: 3, jam: true }))!.bucket === "call", "77 calls a UTG jam at 15bb");
ok(recommend(preSpot({ heroSeat: 2, hole: ["5c", "5d"], stackBB: 15, aggressor: 3, jam: true }))!.bucket === "fold", "55 folds to a UTG jam at 15bb");
ok(recommend(preSpot({ heroSeat: 2, hole: ["Ah", "Jd"], stackBB: 15, aggressor: 3, jam: true }))!.bucket === "fold", "AJo folds to a UTG jam at 15bb (AQo+ only)");

// --- TIER 2: resteal (3-bet jam) over a live open ---
const rs = recommend(preSpot({ heroSeat: 2, hole: ["Ac", "5c"], stackBB: 12, aggressor: 0, raiseTo: 300 }))!;
ok(rs.bucket === "raise" && rs.allIn === true, "A5s 3-bet jams (resteal) over a BTN open at 12bb");
ok(recommend(preSpot({ heroSeat: 2, hole: ["7d", "2c"], stackBB: 12, aggressor: 0, raiseTo: 300 }))!.bucket === "fold", "72o folds to a BTN open at 12bb");

// --- TIER 2: icmEquity actually drives the call-off — a final-table survival premium tightens it ---
const a6 = { heroSeat: 2, hole: ["Ac", "6c"] as [string, string], stackBB: 12, aggressor: 7, jam: true };
ok(recommend(preSpot(a6))!.bucket === "call", "A6s calls a CO jam at 12bb deep in the field (chipEV)");
const a6ft = recommend(preSpot({ ...a6, finalTable: true }))!;
ok(a6ft.bucket === "fold", "A6s is folded to the same CO jam at the final table (ICM-tightened)");
ok(!!a6ft.icmNote && a6ft.icmNote.includes("survival premium"), "final-table call-off carries a real ICM survival-premium note");

// --- TIER 3: every generated drill spot is gradeable by the engine (recommend + grade) ---
for (const c of CONCEPTS) {
  let gradeable = 0;
  for (let i = 0; i < 25; i++) {
    const sp = makeSpot(c);
    const r = recommend(sp.t);
    if (r && grade(r, { type: "fold" })) gradeable++;
  }
  ok(gradeable === 25, `makeSpot("${c}") yields a gradeable spot every time (got ${gradeable}/25)`);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
