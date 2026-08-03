// Runtime correctness checks for the engine primitives. Run: npx tsx src/engine/selfcheck.ts
import { parseCard } from "./cards";
import { score7, categoryOf } from "./handEval";
import { icmEquity, icmPressure } from "./icm";
import type { Seat, Action } from "./hand";
import { startHand, legalActions, applyAction, computePots } from "./hand";

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

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
